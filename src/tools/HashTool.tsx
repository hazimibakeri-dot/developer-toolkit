import { useEffect, useState } from 'react';
import { ToolPage } from '../components/ToolPage';
import { RadioGroup, ResultList, TextAreaField } from '../components/ui';
import {
  digestText,
  HASH_ALGORITHMS,
  isDigestAvailable,
  type HashAlgorithm,
  type HashEncoding,
} from '../lib/hash';
import type { ToolProps } from './types';

type Digests = { input: string; encoding: HashEncoding; values: Record<HashAlgorithm, string> };

export function HashTool({ headingRef, title }: ToolProps) {
  const [input, setInput] = useState('');
  const [encoding, setEncoding] = useState<HashEncoding>('hex');
  const [digests, setDigests] = useState<Digests | null>(null);
  const available = isDigestAvailable();

  useEffect(() => {
    if (!available) return;
    let cancelled = false;
    void Promise.all(
      HASH_ALGORITHMS.map((algorithm) => digestText(input, algorithm, encoding)),
    ).then((values) => {
      if (cancelled) return;
      setDigests({
        input,
        encoding,
        values: Object.fromEntries(HASH_ALGORITHMS.map((a, i) => [a, values[i] ?? ''])) as Record<
          HashAlgorithm,
          string
        >,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [input, encoding, available]);

  // Show results only when they match the current input, so stale hashes never appear.
  const current =
    digests && digests.input === input && digests.encoding === encoding ? digests : null;

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Calculate SHA digests of text with the browser&apos;s Web Crypto API. The UTF-8 bytes of
          the text are hashed exactly as entered, including spaces and line breaks.
        </p>
      }
    >
      <TextAreaField
        label="Text to hash"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={5}
        className="max-w-3xl"
      />
      <RadioGroup<HashEncoding>
        legend="Output encoding"
        name="hash-encoding"
        value={encoding}
        onChange={setEncoding}
        options={[
          { value: 'hex', label: 'Hexadecimal' },
          { value: 'base64', label: 'Base64' },
        ]}
      />

      {available ? (
        <section aria-label="Hash results" aria-busy={current === null}>
          <ResultList
            rows={HASH_ALGORITHMS.map((algorithm) => ({
              label: algorithm,
              value: current?.values[algorithm] ?? '',
            }))}
          />
        </section>
      ) : (
        <p className="rounded-md border border-border bg-subtle px-3 py-2 text-sm">
          Hashing needs the Web Crypto API, which browsers only provide on secure pages (HTTPS or
          localhost). Open the toolkit over HTTPS or on localhost to use this tool.
        </p>
      )}

      <aside aria-label="Security notes" className="max-w-3xl space-y-2 text-sm text-muted">
        <p>
          <strong className="text-fg">SHA-1</strong> is shown for compatibility with older systems.
          Practical collision attacks exist, so do not rely on it for security.
        </p>
        <p>
          <strong className="text-fg">Do not store passwords as plain hashes.</strong> Fast hashes
          such as SHA-256 are unsuitable for passwords; use a dedicated password hashing function
          (for example Argon2id, scrypt or bcrypt) on the server.
        </p>
        <p>MD5 is not offered because the Web Crypto API does not provide it.</p>
      </aside>
    </ToolPage>
  );
}
