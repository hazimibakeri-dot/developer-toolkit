/** Digest algorithms provided by the Web Crypto API. MD5 is not available there. */
export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];
export type HashEncoding = 'hex' | 'base64';

/** Web Crypto's `subtle` interface exists only in secure contexts (HTTPS or localhost). */
export function isDigestAvailable(cryptoSource: Crypto | undefined = globalThis.crypto): boolean {
  return typeof cryptoSource?.subtle?.digest === 'function';
}

function encode(buffer: ArrayBuffer, encoding: HashEncoding): string {
  const bytes = new Uint8Array(buffer);
  if (encoding === 'hex') return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return btoa(String.fromCharCode(...bytes));
}

/** Hashes the UTF-8 bytes of `text`. */
export async function digestText(
  text: string,
  algorithm: HashAlgorithm,
  encoding: HashEncoding = 'hex',
  cryptoSource: Crypto = globalThis.crypto,
): Promise<string> {
  const buffer = await cryptoSource.subtle.digest(algorithm, new TextEncoder().encode(text));
  return encode(buffer, encoding);
}
