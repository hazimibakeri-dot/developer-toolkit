import { fail, ok, type Result } from './result';

export type JsonIndent = '2' | '4' | 'tab';

export interface JsonErrorLocation {
  line: number;
  column: number;
}

export interface JsonFormatOptions {
  indent?: JsonIndent;
  sortKeys?: boolean;
}

/** Converts a character offset into 1-based line and column numbers. */
export function offsetToLocation(text: string, offset: number): JsonErrorLocation {
  const before = text.slice(0, offset);
  const lines = before.split('\n');
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
}

/**
 * Extracts a line and column from a JSON.parse error. Engines word these messages
 * differently, so this recognises the common formats and returns undefined otherwise.
 */
export function locateJsonError(text: string, message: string): JsonErrorLocation | undefined {
  const lineColumn = /line (\d+) column (\d+)/i.exec(message);
  if (lineColumn) return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  const position = /position (\d+)/i.exec(message);
  if (position) return offsetToLocation(text, Number(position[1]));
  return undefined;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortDeep((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export type JsonParseResult =
  { ok: true; value: unknown } | { ok: false; error: string; location?: JsonErrorLocation };

class SyntaxStop extends Error {
  readonly offset: number;
  constructor(offset: number) {
    super('JSON syntax error');
    this.offset = offset;
  }
}

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const HEX4 = /^[0-9a-fA-F]{4}$/;

/**
 * Finds the character offset of the first JSON syntax error, or returns undefined for valid
 * JSON. Browsers word (and sometimes omit) error positions differently, so this small
 * scanner gives the same line and column everywhere.
 */
export function findSyntaxErrorOffset(text: string): number | undefined {
  let index = 0;
  const stop = (): never => {
    throw new SyntaxStop(index);
  };
  const skipWhitespace = () => {
    while (index < text.length && ' \t\n\r'.includes(text.charAt(index))) index += 1;
  };

  function readString(): void {
    index += 1;
    while (index < text.length) {
      const char = text.charAt(index);
      if (char === '"') {
        index += 1;
        return;
      }
      if (char === '\\') {
        const next = text.charAt(index + 1);
        if (next === 'u') {
          if (!HEX4.test(text.slice(index + 2, index + 6))) stop();
          index += 6;
        } else if (next !== '' && '"\\/bfnrt'.includes(next)) {
          index += 2;
        } else {
          index += 1;
          stop();
        }
        continue;
      }
      if (char < ' ') stop();
      index += 1;
    }
    stop();
  }

  function readValue(): void {
    skipWhitespace();
    const char = text.charAt(index);
    if (char === '{') return readContainer('}', true);
    if (char === '[') return readContainer(']', false);
    if (char === '"') return readString();
    NUMBER.lastIndex = index;
    if (NUMBER.test(text)) {
      index = NUMBER.lastIndex;
      return;
    }
    for (const literal of ['true', 'false', 'null']) {
      if (text.startsWith(literal, index)) {
        index += literal.length;
        return;
      }
    }
    stop();
  }

  function readContainer(close: string, isObject: boolean): void {
    index += 1;
    skipWhitespace();
    if (text.charAt(index) === close) {
      index += 1;
      return;
    }
    for (;;) {
      if (isObject) {
        skipWhitespace();
        if (text.charAt(index) !== '"') stop();
        readString();
        skipWhitespace();
        if (text.charAt(index) !== ':') stop();
        index += 1;
      }
      readValue();
      skipWhitespace();
      const char = text.charAt(index);
      if (char === ',') {
        index += 1;
        continue;
      }
      if (char === close) {
        index += 1;
        return;
      }
      stop();
    }
  }

  try {
    readValue();
    skipWhitespace();
    if (index < text.length) stop();
    return undefined;
  } catch (error) {
    if (error instanceof SyntaxStop) return error.offset;
    return undefined; // For example, extremely deep nesting exceeding the call stack.
  }
}

/** Parses JSON and reports a readable error with its location when parsing fails. */
export function parseJson(text: string): JsonParseResult {
  if (text.trim() === '') return { ok: false, error: 'Enter some JSON to format or validate.' };
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const offset = findSyntaxErrorOffset(text);
    const location =
      offset === undefined ? locateJsonError(text, message) : offsetToLocation(text, offset);
    if (!location) return { ok: false, error: `Invalid JSON: ${message}` };
    // The location is reported once, in a consistent format, so drop the engine's own copy.
    const detail = message
      .replace(/\s+in JSON at position \d+(?:\s*\(line \d+ column \d+\))?/i, '')
      .replace(/\s+at line \d+ column \d+ of the JSON data/i, '');
    return {
      ok: false,
      error: `Invalid JSON (line ${location.line}, column ${location.column}): ${detail}`,
      location,
    };
  }
}

const INDENTS: Record<JsonIndent, string | number> = { '2': 2, '4': 4, tab: '\t' };

/** Pretty-prints JSON with the chosen indentation, optionally sorting object keys. */
export function formatJson(text: string, options: JsonFormatOptions = {}): Result<string> {
  const parsed = parseJson(text);
  if (!parsed.ok) return fail(parsed.error);
  const value = options.sortKeys ? sortDeep(parsed.value) : parsed.value;
  return ok(JSON.stringify(value, null, INDENTS[options.indent ?? '2']));
}

/** Removes all insignificant whitespace. */
export function minifyJson(text: string): Result<string> {
  const parsed = parseJson(text);
  return parsed.ok ? ok(JSON.stringify(parsed.value)) : fail(parsed.error);
}
