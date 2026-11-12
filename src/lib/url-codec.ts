import { fail, ok, type Result } from './result';

/**
 * `component` encodes everything except unreserved characters, for query values and path
 * segments. `full` keeps URL structure characters such as ":/?#&=" for whole URLs.
 */
export type UrlScope = 'component' | 'full';
export type CodecMode = 'encode' | 'decode';

export function encodeUrl(text: string, scope: UrlScope): Result<string> {
  try {
    return ok(scope === 'component' ? encodeURIComponent(text) : encodeURI(text));
  } catch {
    // Only lone surrogate characters (invalid UTF-16) make encoding fail.
    return fail('The text contains an incomplete Unicode character and cannot be encoded.');
  }
}

export function decodeUrl(text: string, scope: UrlScope, plusAsSpace = false): Result<string> {
  const input = plusAsSpace ? text.replaceAll('+', ' ') : text;
  try {
    return ok(scope === 'component' ? decodeURIComponent(input) : decodeURI(input));
  } catch {
    return fail(
      'Malformed percent-encoding: every "%" must be followed by two hexadecimal digits that form valid UTF-8.',
    );
  }
}

/** Splits a URL into its parts and query parameters, or explains why it cannot be parsed. */
export function inspectUrl(
  text: string,
): Result<{ parts: [string, string][]; params: [string, string][] }> {
  try {
    const url = new URL(text.trim());
    const parts: [string, string][] = [
      ['Protocol', url.protocol],
      ['Host', url.host],
      ['Path', url.pathname],
      ['Query', url.search],
      ['Fragment', url.hash],
    ];
    return ok({ parts: parts.filter(([, value]) => value !== ''), params: [...url.searchParams] });
  } catch {
    return fail('Not an absolute URL. Include the scheme, for example https://example.com/path.');
  }
}
