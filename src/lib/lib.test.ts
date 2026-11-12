import { describe, expect, it, vi } from 'vitest';
import { decodeBase64, encodeBase64 } from './base64';
import { digestText, isDigestAvailable } from './hash';
import {
  findSyntaxErrorOffset,
  formatJson,
  locateJsonError,
  minifyJson,
  offsetToLocation,
  parseJson,
} from './json';
import { CASES, toWords } from './text-case';
import { convertTimestamp } from './timestamp';
import { decodeUrl, encodeUrl, inspectUrl } from './url-codec';
import { generateUuids, uuidV4 } from './uuid';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('json', () => {
  it('formats with the chosen indentation and optional key sorting', () => {
    const input = '{"b":1,"a":{"d":2,"c":[3]}}';
    expect(formatJson(input)).toEqual({
      ok: true,
      value: '{\n  "b": 1,\n  "a": {\n    "d": 2,\n    "c": [\n      3\n    ]\n  }\n}',
    });
    expect(formatJson(input, { indent: 'tab', sortKeys: true })).toEqual({
      ok: true,
      value: '{\n\t"a": {\n\t\t"c": [\n\t\t\t3\n\t\t],\n\t\t"d": 2\n\t},\n\t"b": 1\n}',
    });
    expect(formatJson('[1,2]', { indent: '4' })).toEqual({
      ok: true,
      value: '[\n    1,\n    2\n]',
    });
  });

  it('minifies valid JSON', () => {
    expect(minifyJson('{ "a" : [ 1, 2 ] }\n')).toEqual({ ok: true, value: '{"a":[1,2]}' });
  });

  it('reports invalid JSON with a location', () => {
    const result = parseJson('{\n  "a": 1,\n  "b": }');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/^Invalid JSON/);
      expect(result.location).toEqual({ line: 3, column: 8 });
      expect(result.error).toContain('(line 3, column 8)');
      // The location appears once, not repeated from the engine's message.
      expect(result.error).not.toMatch(/position \d+|line \d+ column \d+/);
    }
    expect(minifyJson('{oops}').ok).toBe(false);
  });

  it('finds the offset of the first syntax error itself', () => {
    const validInputs = [
      '{}',
      '[]',
      ' 0 ',
      '-1.5e+3',
      'true',
      'null',
      String.raw`"caf\u00e9\n\"quoted\""`,
      '{"a":[1,{"b":null}]}',
    ];
    for (const valid of validInputs) {
      expect(findSyntaxErrorOffset(valid), valid).toBeUndefined();
    }
    expect(findSyntaxErrorOffset('{"a" 1}')).toBe(5);
    expect(findSyntaxErrorOffset('[1,]')).toBe(3);
    expect(findSyntaxErrorOffset('{"a":1,}')).toBe(7);
    expect(findSyntaxErrorOffset("{'a':1}")).toBe(1);
    expect(findSyntaxErrorOffset('[01]')).toBe(2);
    expect(findSyntaxErrorOffset(String.raw`"bad \x"`)).toBe(6);
    expect(findSyntaxErrorOffset(String.raw`"\u12G4"`)).toBe(1);
    expect(findSyntaxErrorOffset('"line\nbreak"')).toBe(5);
    expect(findSyntaxErrorOffset('"open')).toBe(5);
    expect(findSyntaxErrorOffset('{} x')).toBe(3);
    expect(findSyntaxErrorOffset('tru')).toBe(0);
  });

  it('asks for input when empty', () => {
    expect(formatJson('   ')).toEqual({
      ok: false,
      error: 'Enter some JSON to format or validate.',
    });
  });

  it('understands the error formats of different engines', () => {
    expect(
      locateJsonError('', 'JSON.parse: expected property name at line 2 column 5 of the JSON data'),
    ).toEqual({ line: 2, column: 5 });
    expect(locateJsonError('{\n"a"x}', 'Unexpected token x in JSON at position 5')).toEqual({
      line: 2,
      column: 4,
    });
    expect(locateJsonError('', 'JSON Parse error: Unexpected identifier')).toBeUndefined();
    expect(offsetToLocation('ab\ncd', 4)).toEqual({ line: 2, column: 2 });
  });
});

describe('uuid', () => {
  it('generates RFC 9562 version 4 UUIDs', () => {
    const ids = generateUuids(20);
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    for (const id of ids) expect(id).toMatch(UUID_V4);
  });

  it('applies formatting options', () => {
    const [id] = generateUuids(1, { uppercase: true, hyphens: false });
    expect(id).toMatch(/^[0-9A-F]{32}$/);
  });

  it('falls back to getRandomValues outside secure contexts', () => {
    const source = {
      getRandomValues: (array: Uint8Array) => array.fill(0xff),
    } as unknown as Crypto;
    expect(uuidV4(source)).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('rejects invalid counts', () => {
    for (const count of [0, 101, 2.5, Number.NaN]) {
      expect(() => generateUuids(count)).toThrow(RangeError);
    }
  });
});

describe('timestamp', () => {
  const now = Date.UTC(2026, 0, 1, 12);
  const options = { now, locale: 'en-US', timeZone: 'UTC' } as const;

  it('detects seconds and milliseconds', () => {
    const seconds = convertTimestamp('1767225600', options);
    const millis = convertTimestamp('1767225600000', options);
    expect(seconds.ok && seconds.value.iso).toBe('2026-01-01T00:00:00.000Z');
    expect(seconds.ok && seconds.value.interpretation).toBe('Unix time in seconds');
    expect(millis.ok && millis.value.iso).toBe('2026-01-01T00:00:00.000Z');
    expect(millis.ok && millis.value.unixSeconds).toBe(1767225600);
    expect(seconds.ok && seconds.value.relative).toBe('12 hours ago');
  });

  it('respects an explicit unit', () => {
    const result = convertTimestamp('1767225600', { ...options, unit: 'ms' });
    expect(result.ok && result.value.iso).toBe('1970-01-21T10:53:45.600Z');
  });

  it('parses date strings and formats readable dates', () => {
    const result = convertTimestamp('2026-01-02T00:00:00Z', options);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.interpretation).toBe('Date string');
      expect(result.value.utc).toContain('January 2, 2026');
      expect(result.value.relative).toBe('in 12 hours');
    }
  });

  it('explains invalid and out-of-range input', () => {
    expect(convertTimestamp('', options).ok).toBe(false);
    expect(convertTimestamp('next tuesday', options)).toMatchObject({
      ok: false,
      error: expect.stringMatching(/not a number/) as string,
    });
    expect(convertTimestamp('99999999999999999999', options)).toMatchObject({
      ok: false,
      error: expect.stringMatching(/outside the range/) as string,
    });
  });
});

describe('text case', () => {
  it('splits words from identifiers and phrases', () => {
    expect(toWords('XMLHttpRequest userId_2')).toEqual([
      'XML',
      'Http',
      'Request',
      'user',
      'Id',
      '2',
    ]);
  });

  it('converts to every supported case', () => {
    const results = Object.fromEntries(
      CASES.map((c) => [c.id, c.convert('hello wonderful World')]),
    );
    expect(results).toEqual({
      camel: 'helloWonderfulWorld',
      pascal: 'HelloWonderfulWorld',
      snake: 'hello_wonderful_world',
      kebab: 'hello-wonderful-world',
      constant: 'HELLO_WONDERFUL_WORLD',
      dot: 'hello.wonderful.world',
      title: 'Hello Wonderful World',
      sentence: 'Hello wonderful world',
      lower: 'hello wonderful world',
      upper: 'HELLO WONDERFUL WORLD',
    });
  });
});

describe('url codec', () => {
  it('encodes components and full URLs differently', () => {
    expect(encodeUrl('a b&c=d/é', 'component')).toEqual({
      ok: true,
      value: 'a%20b%26c%3Dd%2F%C3%A9',
    });
    expect(encodeUrl('https://example.com/a b?q=é', 'full')).toEqual({
      ok: true,
      value: 'https://example.com/a%20b?q=%C3%A9',
    });
  });

  it('decodes, optionally treating + as a space', () => {
    expect(decodeUrl('a%20b%2Bc', 'component')).toEqual({ ok: true, value: 'a b+c' });
    expect(decodeUrl('a+b', 'component', true)).toEqual({ ok: true, value: 'a b' });
    expect(decodeUrl('%2F', 'full')).toEqual({ ok: true, value: '%2F' });
  });

  it('reports malformed input', () => {
    expect(decodeUrl('%E0%A4%A', 'component').ok).toBe(false);
    expect(encodeUrl('\uD800', 'component').ok).toBe(false);
  });

  it('breaks URLs into parts', () => {
    const result = inspectUrl('https://example.com:8080/path?a=1&b=two#top');
    expect(result.ok && result.value.parts).toEqual([
      ['Protocol', 'https:'],
      ['Host', 'example.com:8080'],
      ['Path', '/path'],
      ['Query', '?a=1&b=two'],
      ['Fragment', '#top'],
    ]);
    expect(result.ok && result.value.params).toEqual([
      ['a', '1'],
      ['b', 'two'],
    ]);
    expect(inspectUrl('/relative').ok).toBe(false);
  });
});

describe('base64', () => {
  it('round-trips UTF-8 text', () => {
    const text = 'Hello, wörld 👋';
    const encoded = encodeBase64(text);
    expect(encoded).toEqual({ ok: true, value: 'SGVsbG8sIHfDtnJsZCDwn5GL' });
    expect(decodeBase64('SGVsbG8sIHfDtnJsZCDwn5GL')).toEqual({ ok: true, value: text });
  });

  it('supports the URL-safe alphabet and missing padding', () => {
    expect(encodeBase64('ÿÿ?', true)).toEqual({ ok: true, value: 'w7_Dvz8' });
    expect(decodeBase64('w7_Dvz8')).toEqual({ ok: true, value: 'ÿÿ?' });
    expect(decodeBase64(' SGk = ')).toEqual({ ok: true, value: 'Hi' });
    expect(decodeBase64('')).toEqual({ ok: true, value: '' });
  });

  it('rejects invalid Base64 and binary data', () => {
    expect(decodeBase64('abc$')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/only A–Z/) as string,
    });
    expect(decodeBase64('abcde')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/length/) as string,
    });
    expect(decodeBase64('/w==')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/not UTF-8/) as string,
    });
  });

  it('encodes large input without exceeding argument limits', () => {
    const large = 'a'.repeat(200_000);
    const encoded = encodeBase64(large);
    expect(encoded.ok && decodeBase64(encoded.value)).toEqual({ ok: true, value: large });
  });
});

describe('hash', () => {
  it('matches published SHA test vectors for "abc"', async () => {
    expect(await digestText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(await digestText('abc', 'SHA-256')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await digestText('abc', 'SHA-384')).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
    );
    expect(await digestText('abc', 'SHA-512')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    );
  });

  it('hashes the empty string and supports Base64 output', async () => {
    expect(await digestText('', 'SHA-256')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(await digestText('abc', 'SHA-256', 'base64')).toBe(
      'ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=',
    );
  });

  it('detects whether Web Crypto digests are available', () => {
    expect(isDigestAvailable()).toBe(true);
    expect(isDigestAvailable({} as Crypto)).toBe(false);
    expect(isDigestAvailable(undefined)).toBe(true);
    vi.stubGlobal('crypto', undefined);
    expect(isDigestAvailable()).toBe(false);
    vi.unstubAllGlobals();
  });
});
