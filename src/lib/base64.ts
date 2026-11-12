import { fail, ok, type Result } from './result';

const CHUNK_SIZE = 0x8000;

function bytesToBinary(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(index, index + CHUNK_SIZE));
  }
  return binary;
}

/**
 * Encodes text as UTF-8, then Base64. `urlSafe` uses "-" and "_" and drops "=" padding
 * (the "base64url" alphabet from RFC 4648).
 */
export function encodeBase64(text: string, urlSafe = false): Result<string> {
  try {
    const encoded = btoa(bytesToBinary(new TextEncoder().encode(text)));
    return ok(
      urlSafe ? encoded.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '') : encoded,
    );
  } catch {
    /* c8 ignore next */
    return fail('The text could not be encoded.');
  }
}

/**
 * Decodes standard or URL-safe Base64 (padding optional, whitespace ignored) and interprets
 * the bytes as UTF-8 text.
 */
export function decodeBase64(input: string): Result<string> {
  const cleaned = input.replace(/\s+/g, '');
  if (cleaned === '') return ok('');
  if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(cleaned)) {
    return fail(
      'Input is not valid Base64: only A–Z, a–z, 0–9, "+", "/", "-", "_" and trailing "=" are allowed.',
    );
  }
  const standard = cleaned.replaceAll('-', '+').replaceAll('_', '/').replace(/=+$/, '');
  if (standard.length % 4 === 1) {
    return fail('Input is not valid Base64: its length is not possible for Base64 data.');
  }
  const padded = standard.padEnd(Math.ceil(standard.length / 4) * 4, '=');

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    /* c8 ignore next */
    return fail('Input is not valid Base64.');
  }

  try {
    return ok(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return fail('The decoded data is not UTF-8 text (it may be an image or other binary file).');
  }
}
