import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { CopyButton } from './CopyButton';

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: 'primary' | 'secondary'; size?: 'sm' | 'md' }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3' : 'h-10 px-4',
        variant === 'primary'
          ? 'bg-accent text-accent-fg hover:bg-accent-hover'
          : 'border border-border-strong bg-surface text-fg hover:bg-subtle',
        className,
      )}
      {...props}
    />
  );
}

const controlClasses =
  'block w-full rounded-md border bg-surface px-3 py-2 font-mono text-sm text-fg placeholder:text-muted/80';

interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  label: string;
  hint?: ReactNode;
  /** Id of an element describing an error, linked with aria-describedby. */
  errorId?: string;
  invalid?: boolean;
  actions?: ReactNode;
}

export function TextAreaField({
  label,
  hint,
  errorId,
  invalid,
  actions,
  id,
  className,
  ...props
}: TextAreaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex min-h-9 flex-wrap items-end justify-between gap-2">
        <label htmlFor={fieldId} className="text-sm font-semibold">
          {label}
        </label>
        {actions}
      </div>
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <textarea
        id={fieldId}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        aria-describedby={
          [hintId, invalid ? errorId : undefined].filter(Boolean).join(' ') || undefined
        }
        className={cn(
          controlClasses,
          'min-h-40 resize-y',
          invalid ? 'border-danger' : 'border-border-strong',
        )}
        {...props}
      />
    </div>
  );
}

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

/** A labelled group of radio buttons rendered as a segmented control. */
export function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{legend}</legend>
      <div className="inline-flex flex-wrap rounded-md border border-border-strong bg-surface p-0.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative cursor-pointer rounded px-3 py-1.5 text-sm font-medium has-checked:bg-accent has-checked:text-accent-fg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckboxField({
  label,
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'type'> & { label: string }) {
  const id = useId();
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <input id={id} type="checkbox" className="size-4 accent-accent" {...props} />
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
    </div>
  );
}

/** An error message. `alert` announces it immediately; use it for errors after an action. */
export function ErrorMessage({
  id,
  children,
  alert = false,
}: {
  id: string;
  children: ReactNode;
  alert?: boolean;
}) {
  return (
    <p
      id={id}
      role={alert ? 'alert' : undefined}
      className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
    >
      {children}
    </p>
  );
}

/** A key/value list where each value can be copied. */
export function ResultList({
  rows,
}: {
  rows: readonly { label: string; value: string; copy?: boolean }[];
}) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr_auto] sm:items-center sm:gap-4"
        >
          <dt className="text-sm font-semibold text-muted">{row.label}</dt>
          <dd className="min-w-0 font-mono text-sm break-all">{row.value || '—'}</dd>
          {row.copy !== false && (
            <dd className="sm:justify-self-end">
              <CopyButton text={row.value} what={row.label} />
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
