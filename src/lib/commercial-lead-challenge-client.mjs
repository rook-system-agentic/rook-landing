const encoder = new TextEncoder();

function hasLeadingZeroNibbles(bytes, difficulty) {
  const fullBytes = Math.floor(difficulty / 2);
  for (let index = 0; index < fullBytes; index += 1) {
    if (bytes[index] !== 0) return false;
  }
  if (difficulty % 2 === 1) {
    return (bytes[fullBytes] & 0xf0) === 0;
  }
  return true;
}

export async function solveCommercialLeadChallenge({ token, difficulty }) {
  if (typeof token !== "string" || token.length > 512) {
    throw new Error("Invalid commercial lead challenge token.");
  }
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 6) {
    throw new Error("Invalid commercial lead challenge difficulty.");
  }
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable.");
  }

  for (let nonce = 0; nonce <= 1_000_000; nonce += 1) {
    const solution = String(nonce);
    const digest = new Uint8Array(
      await globalThis.crypto.subtle.digest(
        "SHA-256",
        encoder.encode(`${token}.${solution}`),
      ),
    );
    if (hasLeadingZeroNibbles(digest, difficulty)) return solution;
  }

  throw new Error("Commercial lead challenge could not be solved.");
}
