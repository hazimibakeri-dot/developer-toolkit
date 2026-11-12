import type { ReactNode, Ref } from 'react';

interface ToolPageProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
}

/** Shared layout for a tool: one h1, a short description and the tool's controls. */
export function ToolPage({ title, description, children, headingRef }: ToolPageProps) {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight outline-none sm:text-3xl"
        >
          {title}
        </h1>
        <div className="max-w-3xl text-muted">{description}</div>
      </header>
      {children}
    </article>
  );
}
