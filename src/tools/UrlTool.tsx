import { useId, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { ToolPage } from '../components/ToolPage';
import {
  CheckboxField,
  ErrorMessage,
  RadioGroup,
  ResultList,
  TextAreaField,
} from '../components/ui';
import { decodeUrl, encodeUrl, inspectUrl, type CodecMode, type UrlScope } from '../lib/url-codec';
import type { ToolProps } from './types';

export function UrlTool({ headingRef, title }: ToolProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CodecMode>('encode');
  const [scope, setScope] = useState<UrlScope>('component');
  const [plusAsSpace, setPlusAsSpace] = useState(false);
  const errorId = useId();

  const result = mode === 'encode' ? encodeUrl(input, scope) : decodeUrl(input, scope, plusAsSpace);
  const output = result.ok ? result.value : '';
  const error = result.ok ? '' : result.error;
  const inspected = /^[a-z][a-z\d+\-.]*:\/\//i.test(input.trim()) ? inspectUrl(input) : null;

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Percent-encode or decode text for URLs. Use <strong>Component</strong> for a single query
          value or path segment, and <strong>Full URL</strong> to keep characters such as{' '}
          <code>: / ? # &amp; =</code> intact.
        </p>
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <RadioGroup<CodecMode>
          legend="Mode"
          name="url-mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
        />
        <RadioGroup<UrlScope>
          legend="Scope"
          name="url-scope"
          value={scope}
          onChange={setScope}
          options={[
            { value: 'component', label: 'Component' },
            { value: 'full', label: 'Full URL' },
          ]}
        />
        {mode === 'decode' && (
          <CheckboxField
            label='Treat "+" as a space (form encoding)'
            checked={plusAsSpace}
            onChange={(event) => setPlusAsSpace(event.target.checked)}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextAreaField
          label={mode === 'encode' ? 'Text to encode' : 'Text to decode'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          invalid={error !== ''}
          errorId={errorId}
          rows={8}
        />
        <TextAreaField
          label="Result"
          value={output}
          readOnly
          rows={8}
          actions={<CopyButton text={output} what="URL result" />}
        />
      </div>
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}

      {inspected?.ok && (
        <section aria-labelledby="url-parts-heading" className="space-y-3">
          <h2 id="url-parts-heading" className="text-lg font-semibold">
            URL breakdown
          </h2>
          <ResultList rows={inspected.value.parts.map(([label, value]) => ({ label, value }))} />
          {inspected.value.params.length > 0 && (
            <ResultList
              rows={inspected.value.params.map(([key, value], index) => ({
                label: `Parameter ${index + 1}: ${key}`,
                value,
              }))}
            />
          )}
        </section>
      )}
    </ToolPage>
  );
}
