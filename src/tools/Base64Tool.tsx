import { useId, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { ToolPage } from '../components/ToolPage';
import { Button, CheckboxField, ErrorMessage, RadioGroup, TextAreaField } from '../components/ui';
import { decodeBase64, encodeBase64 } from '../lib/base64';
import type { CodecMode } from '../lib/url-codec';
import type { ToolProps } from './types';

export function Base64Tool({ headingRef, title }: ToolProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CodecMode>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const errorId = useId();

  const result = mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input);
  const output = result.ok ? result.value : '';
  const error = result.ok ? '' : result.error;

  function swap() {
    setInput(output);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  }

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Encode text as Base64 or decode Base64 back to text. Text is converted to UTF-8 first, so
          accented letters and emoji round-trip correctly. Base64 is an encoding, not encryption:
          anyone can decode it.
        </p>
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <RadioGroup<CodecMode>
          legend="Mode"
          name="base64-mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
        />
        {mode === 'encode' && (
          <CheckboxField
            label="URL-safe alphabet (base64url, no padding)"
            checked={urlSafe}
            onChange={(event) => setUrlSafe(event.target.checked)}
          />
        )}
        <Button variant="secondary" onClick={swap} disabled={output === ''}>
          Use result as input
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextAreaField
          label={mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
          hint={
            mode === 'decode'
              ? 'Standard and URL-safe Base64 are accepted; padding is optional.'
              : undefined
          }
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
          actions={<CopyButton text={output} what="Base64 result" />}
        />
      </div>
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </ToolPage>
  );
}
