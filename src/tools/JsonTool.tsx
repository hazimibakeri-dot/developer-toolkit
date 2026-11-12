import { useId, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { ToolPage } from '../components/ToolPage';
import { Button, CheckboxField, ErrorMessage, RadioGroup, TextAreaField } from '../components/ui';
import { formatJson, minifyJson, type JsonIndent } from '../lib/json';
import type { ToolProps } from './types';

const SAMPLE =
  '{"name":"Example","tags":["demo","json"],"nested":{"count":3,"active":true},"empty":null}';

export function JsonTool({ headingRef, title }: ToolProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [indent, setIndent] = useState<JsonIndent>('2');
  const [sortKeys, setSortKeys] = useState(false);
  const errorId = useId();

  function run(kind: 'format' | 'minify') {
    const result = kind === 'format' ? formatJson(input, { indent, sortKeys }) : minifyJson(input);
    if (result.ok) {
      setOutput(result.value);
      setError('');
      setStatus(kind === 'format' ? 'Valid JSON, formatted.' : 'Valid JSON, minified.');
    } else {
      setOutput('');
      setStatus('');
      setError(result.error);
    }
  }

  function clear() {
    setInput('');
    setOutput('');
    setError('');
    setStatus('');
  }

  return (
    <ToolPage
      headingRef={headingRef}
      title={title}
      description={
        <p>
          Validate, pretty-print or minify JSON. Errors show the line and column where parsing
          stopped. Parsing uses the built-in <code>JSON.parse</code>.
        </p>
      }
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <RadioGroup<JsonIndent>
          legend="Indentation"
          name="json-indent"
          value={indent}
          onChange={setIndent}
          options={[
            { value: '2', label: '2 spaces' },
            { value: '4', label: '4 spaces' },
            { value: 'tab', label: 'Tabs' },
          ]}
        />
        <CheckboxField
          label="Sort keys"
          checked={sortKeys}
          onChange={(event) => setSortKeys(event.target.checked)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TextAreaField
          label="JSON input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder='{"paste": "your JSON here"}'
          invalid={error !== ''}
          errorId={errorId}
          rows={14}
          actions={
            <Button variant="secondary" size="sm" onClick={() => setInput(SAMPLE)}>
              Load sample
            </Button>
          }
        />
        <TextAreaField
          label="Result"
          value={output}
          readOnly
          rows={14}
          placeholder="Formatted output appears here."
          actions={<CopyButton text={output} what="JSON result" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => run('format')}>Format</Button>
        <Button variant="secondary" onClick={() => run('minify')}>
          Minify
        </Button>
        <Button variant="secondary" onClick={clear}>
          Clear
        </Button>
        <p role="status" className="text-sm font-medium text-accent">
          {status}
        </p>
      </div>
      {error && (
        <ErrorMessage id={errorId} alert>
          {error}
        </ErrorMessage>
      )}
    </ToolPage>
  );
}
