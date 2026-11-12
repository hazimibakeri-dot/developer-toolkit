import { useId, useState } from 'react';
import { ToolPage } from '../components/ToolPage';
import { Button, ErrorMessage, RadioGroup, ResultList } from '../components/ui';
import type { Result } from '../lib/result';
import { convertTimestamp, type TimestampDetails, type TimestampUnit } from '../lib/timestamp';
import type { ToolProps } from './types';

const LOCAL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function TimestampTool({ headingRef, title }: ToolProps) {
  const [input, setInput] = useState('');
  const [unit, setUnit] = useState<TimestampUnit>('auto');
  const [result, setResult] = useState<Result<TimestampDetails> | null>(null);
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  // Conversions run in event handlers so "relative time" is measured from the moment of input.
  function update(nextInput: string, nextUnit: TimestampUnit) {
    setInput(nextInput);
    setUnit(nextUnit);
    setResult(
      nextInput.trim() === ''
        ? null
        : convertTimestamp(nextInput, { unit: nextUnit, now: Date.now() }),
    );
  }

  const error = result && !result.ok ? result.error : '';
  const details = result?.ok ? result.value : null;

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Convert Unix timestamps (seconds or milliseconds) and date strings into ISO 8601, UTC and
          your local time ({LOCAL_TIME_ZONE}).
        </p>
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="w-full max-w-md space-y-1.5">
          <label htmlFor={inputId} className="block text-sm font-semibold">
            Timestamp or date
          </label>
          <p id={hintId} className="text-sm text-muted">
            For example 1767225600, 1767225600000 or 2026-01-01T00:00:00Z.
          </p>
          <input
            id={inputId}
            value={input}
            onChange={(event) => update(event.target.value, unit)}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={error !== '' || undefined}
            aria-describedby={[hintId, error ? errorId : ''].filter(Boolean).join(' ')}
            className="block h-10 w-full rounded-md border border-border-strong bg-surface px-3 font-mono text-sm"
          />
        </div>
        <RadioGroup<TimestampUnit>
          legend="Numbers are"
          name="timestamp-unit"
          value={unit}
          onChange={(next) => update(input, next)}
          options={[
            { value: 'auto', label: 'Detect' },
            { value: 's', label: 'Seconds' },
            { value: 'ms', label: 'Milliseconds' },
          ]}
        />
        <Button
          variant="secondary"
          onClick={() => update(String(Math.floor(Date.now() / 1000)), unit)}
        >
          Use current time
        </Button>
      </div>

      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}

      {details && (
        <section aria-label="Conversion results">
          <ResultList
            rows={[
              { label: 'Interpreted as', value: details.interpretation, copy: false },
              { label: 'Unix seconds', value: String(details.unixSeconds) },
              { label: 'Unix milliseconds', value: String(details.unixMilliseconds) },
              { label: 'ISO 8601 (UTC)', value: details.iso },
              { label: 'UTC', value: details.utc },
              { label: `Local (${LOCAL_TIME_ZONE})`, value: details.local },
              { label: 'Relative', value: details.relative, copy: false },
            ]}
          />
        </section>
      )}
      <p className="text-sm text-muted">
        Detect mode treats numbers below 100,000,000,000 as seconds and larger numbers as
        milliseconds. Choose a unit explicitly for values near that boundary.
      </p>
    </ToolPage>
  );
}
