export const MAX_UUID_COUNT = 100;

export interface UuidOptions {
  uppercase?: boolean;
  hyphens?: boolean;
}

/**
 * Version 4 (random) UUID from the browser's cryptographically secure generator.
 * `crypto.randomUUID` needs a secure context (HTTPS or localhost); elsewhere the same
 * format is built from `crypto.getRandomValues`.
 */
export function uuidV4(cryptoSource: Crypto = globalThis.crypto): string {
  if (typeof cryptoSource.randomUUID === 'function') return cryptoSource.randomUUID();
  const bytes = cryptoSource.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40; // version 4
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80; // RFC 9562 variant
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Generates `count` UUIDs (1–100) with formatting options. */
export function generateUuids(
  count: number,
  options: UuidOptions = {},
  cryptoSource?: Crypto,
): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_UUID_COUNT) {
    throw new RangeError(`Count must be a whole number from 1 to ${MAX_UUID_COUNT}.`);
  }
  const { uppercase = false, hyphens = true } = options;
  return Array.from({ length: count }, () => {
    let id = uuidV4(cryptoSource);
    if (!hyphens) id = id.replaceAll('-', '');
    return uppercase ? id.toUpperCase() : id;
  });
}
