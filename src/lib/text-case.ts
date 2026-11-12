// Acronym followed by a word, a word, an acronym, digits, or caseless letters.
const WORD_PATTERN = /\p{Lu}+(?=\p{Lu}\p{Ll})|\p{Lu}?\p{Ll}+|\p{Lu}+|\p{N}+|\p{Lo}+/gu;

/** Splits text or identifiers into words: "XMLHttpRequest" -> ["XML", "Http", "Request"]. */
export function toWords(value: string): string[] {
  return value.replace(/['’]/g, '').match(WORD_PATTERN) ?? [];
}

const capitalize = (word: string) => {
  const [first = '', ...rest] = word.toLowerCase();
  return first.toUpperCase() + rest.join('');
};

export interface CaseDefinition {
  id: string;
  label: string;
  convert: (value: string) => string;
}

export const CASES: readonly CaseDefinition[] = [
  {
    id: 'camel',
    label: 'camelCase',
    convert: (v) =>
      toWords(v)
        .map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w)))
        .join(''),
  },
  { id: 'pascal', label: 'PascalCase', convert: (v) => toWords(v).map(capitalize).join('') },
  {
    id: 'snake',
    label: 'snake_case',
    convert: (v) =>
      toWords(v)
        .map((w) => w.toLowerCase())
        .join('_'),
  },
  {
    id: 'kebab',
    label: 'kebab-case',
    convert: (v) =>
      toWords(v)
        .map((w) => w.toLowerCase())
        .join('-'),
  },
  {
    id: 'constant',
    label: 'CONSTANT_CASE',
    convert: (v) =>
      toWords(v)
        .map((w) => w.toUpperCase())
        .join('_'),
  },
  {
    id: 'dot',
    label: 'dot.case',
    convert: (v) =>
      toWords(v)
        .map((w) => w.toLowerCase())
        .join('.'),
  },
  { id: 'title', label: 'Title Case', convert: (v) => toWords(v).map(capitalize).join(' ') },
  {
    id: 'sentence',
    label: 'Sentence case',
    convert: (v) => capitalize(toWords(v).join(' ').toLowerCase()),
  },
  { id: 'lower', label: 'lower case', convert: (v) => v.toLowerCase() },
  { id: 'upper', label: 'UPPER CASE', convert: (v) => v.toUpperCase() },
];
