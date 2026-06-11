import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function getProvidedContentSecret(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return req.headers.get("x-content-automation-secret") || "";
}

export function isContentApiAuthorized(req: NextRequest) {
  const expected = process.env.CONTENT_AUTOMATION_SECRET;
  if (!expected) return false;
  return safeEqual(getProvidedContentSecret(req), expected);
}
