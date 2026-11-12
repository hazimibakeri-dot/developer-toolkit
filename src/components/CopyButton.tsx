import { useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard';
import { cn } from '../lib/cn';

interface CopyButtonProps {
  text: string;
  /** Completes the accessible name, e.g. "formatted JSON" gives "Copy formatted JSON". */
  what: string;
  className?: string;
}

/** Copies `text` and confirms the result visually and through a polite live region. */
export function CopyButton({ text, what, className }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  async function handleCopy() {
    try {
      await copyText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setStatus('idle'), 2000);
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <button
        type="button"
        onClick={() => void handleCopy()}
        disabled={text === ''}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {status === 'copied' ? (
            <path d="m5 12 5 5 9-10" />
          ) : (
            <>
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </>
          )}
        </svg>
        {status === 'copied' ? 'Copied' : 'Copy'} <span className="sr-only">{what}</span>
      </button>
      <span role="status" className="sr-only">
        {status === 'copied'
          ? `${what} copied to clipboard`
          : status === 'failed'
            ? `Could not copy ${what}`
            : ''}
      </span>
    </span>
  );
}
