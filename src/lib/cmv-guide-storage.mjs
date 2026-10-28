import { CMV_GUIDE_MANIFEST, verifyCmvGuideMaterial } from "./cmv-guide-envelope.mjs";

const MAX_MATERIAL_BYTES = 8 * 1024 * 1024;

export class CmvGuideStorageError extends Error {
  constructor(code) {
    super(code);
    this.name = "CmvGuideStorageError";
    this.code = code;
  }
}

function timeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function readBoundedBody(response, expectedBytes, signal) {
  const reader = response?.body?.getReader?.();
  if (!reader) throw new CmvGuideStorageError("asset_unavailable");
  const readCap = Math.min(MAX_MATERIAL_BYTES, expectedBytes) + 1;
  const abortReader = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener("abort", abortReader, { once: true });
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      if (signal?.aborted) throw new CmvGuideStorageError("asset_timeout");
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
      total += chunk.byteLength;
      if (total >= readCap) {
        await reader.cancel().catch(() => {});
        throw new CmvGuideStorageError("asset_size_mismatch");
      }
      chunks.push(chunk);
    }
    if (signal?.aborted) throw new CmvGuideStorageError("asset_timeout");
  } catch (error) {
    if (error instanceof CmvGuideStorageError) throw error;
    await reader.cancel().catch(() => {});
    throw new CmvGuideStorageError("asset_unavailable");
  } finally {
    signal?.removeEventListener("abort", abortReader);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function readCmvGuideMaterials({
  supabaseUrl,
  serviceRoleKey,
  fetchImpl = fetch,
  bucket = "cmv-guide-private",
  timeoutMs = 12_000,
} = {}) {
  if (!supabaseUrl || !serviceRoleKey || bucket !== "cmv-guide-private") {
    throw new CmvGuideStorageError("not_configured");
  }
  const attachments = [];
  for (const entry of CMV_GUIDE_MANIFEST) {
    const url = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${entry.objectPath}`;
    const timeout = timeoutSignal(timeoutMs);
    let response;
    try {
      response = await fetchImpl(url, {
        method: "GET",
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
        cache: "no-store",
        signal: timeout.signal,
      });
    } catch {
      timeout.clear();
      throw new CmvGuideStorageError("asset_timeout");
    }
    if (!response?.ok) {
      timeout.clear();
      throw new CmvGuideStorageError(response?.status === 404 ? "asset_missing" : "asset_unavailable");
    }
    const contentLengthHeader = response.headers?.get?.("content-length");
    const contentLength = contentLengthHeader === null || contentLengthHeader === undefined || contentLengthHeader === ""
      ? null
      : Number(contentLengthHeader);
    if (contentLength !== null && Number.isInteger(contentLength) && contentLength !== entry.bytes) {
      timeout.clear();
      throw new CmvGuideStorageError("asset_size_mismatch");
    }
    let bytes;
    try {
      bytes = await readBoundedBody(response, entry.bytes, timeout.signal);
    } catch (error) {
      timeout.clear();
      if (error instanceof CmvGuideStorageError && error.code === "asset_size_mismatch") throw error;
      if (timeout.signal.aborted) throw new CmvGuideStorageError("asset_timeout");
      throw new CmvGuideStorageError("asset_unavailable");
    }
    timeout.clear();
    if (bytes.byteLength > MAX_MATERIAL_BYTES || !verifyCmvGuideMaterial({ bytes }, entry)) {
      throw new CmvGuideStorageError("asset_checksum_mismatch");
    }
    attachments.push({ filename: entry.filename, content: Buffer.from(bytes).toString("base64") });
  }
  return attachments;
}
