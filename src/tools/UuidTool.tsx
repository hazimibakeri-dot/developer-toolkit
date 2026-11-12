import { useId, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { ToolPage } from '../components/ToolPage';
import { Button, CheckboxField, ErrorMessage, TextAreaField } from '../components/ui';
import { generateUuids, MAX_UUID_COUNT } from '../lib/uuid';
import type { ToolProps } from './types';

export function UuidTool({ headingRef, title }: ToolProps) {
  const [count, setCount] = useState('5');
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const countId = useId();
  const errorId = useId();

  function generate() {
    try {
      setOutput(generateUuids(Number(count), { uppercase, hyphens }).join('\n'));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not generate UUIDs.');
    }
  }

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Generate random version 4 UUIDs with the browser&apos;s cryptographically secure random
          number generator (<code>crypto.randomUUID</code>).
        </p>
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="space-y-1.5">
          <label htmlFor={countId} className="block text-sm font-semibold">
            How many (1–{MAX_UUID_COUNT})
          </label>
          <input
            id={countId}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_UUID_COUNT}
            value={count}
            onChange={(event) => setCount(event.target.value)}
            aria-invalid={error !== '' || undefined}
            aria-describedby={error ? errorId : undefined}
            className="block h-10 w-28 rounded-md border border-border-strong bg-surface px-3 text-sm"
          />
        </div>
        <CheckboxField
          label="Uppercase"
          checked={uppercase}
          onChange={(event) => setUppercase(event.target.checked)}
        />
        <CheckboxField
          label="Include hyphens"
          checked={hyphens}
          onChange={(event) => setHyphens(event.target.checked)}
        />
        <Button onClick={generate}>Generate</Button>
      </div>

      {error && (
        <ErrorMessage id={errorId} alert>
          {error}
        </ErrorMessage>
      )}

      <TextAreaField
        label="UUIDs"
        value={output}
        readOnly
        rows={10}
        placeholder="Choose options and select Generate."
        actions={<CopyButton text={output} what="UUIDs" />}
      />
    </ToolPage>
  );
}
