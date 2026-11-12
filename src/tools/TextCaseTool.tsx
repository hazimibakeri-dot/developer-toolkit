import { useState } from 'react';
import { ToolPage } from '../components/ToolPage';
import { ResultList, TextAreaField } from '../components/ui';
import { CASES } from '../lib/text-case';
import type { ToolProps } from './types';

export function TextCaseTool({ headingRef, title }: ToolProps) {
  const [input, setInput] = useState('');

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Convert text or identifiers between common naming conventions. Words are detected from
          spaces, punctuation and capital letters, so <code>XMLHttpRequest</code> becomes{' '}
          <code>xml-http-request</code>.
        </p>
      }
    >
      <TextAreaField
        label="Text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type or paste text, e.g. userProfile settings"
        rows={4}
        className="max-w-3xl"
      />
      <section aria-label="Converted text">
        <ResultList
          rows={CASES.map((style) => ({ label: style.label, value: style.convert(input) }))}
        />
      </section>
    </ToolPage>
  );
}
