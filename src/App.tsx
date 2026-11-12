import { useEffect, useRef } from 'react';
import { useHashRoute } from './hooks/useHashRoute';
import { cn } from './lib/cn';
import { TOOL_IDS, TOOLS, type ToolId } from './tools/registry';

const APP_NAME = 'Developer Toolkit';

export function App() {
  const activeId = useHashRoute<ToolId>(TOOL_IDS, 'json');
  const active = TOOLS.find((tool) => tool.id === activeId) ?? TOOLS[0];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousId = useRef(activeId);

  useEffect(() => {
    document.title = `${active.title} · ${APP_NAME}`;
    // Move focus to the new tool's heading after navigation (not on first load).
    if (previousId.current !== activeId) {
      previousId.current = activeId;
      headingRef.current?.focus();
    }
  }, [active.title, activeId]);

  const ActiveTool = active.component;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        onClick={(event) => {
          // Keep the route in the fragment: move focus without changing the URL.
          event.preventDefault();
          headingRef.current?.focus();
        }}
        className="sr-only rounded-md bg-accent px-4 py-2 font-semibold text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to tool
      </a>

      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a href="#/json" className="flex items-center gap-2 rounded-md font-bold tracking-tight">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m8 9-4 3 4 3M16 9l4 3-4 3M13.5 5l-3 14" />
            </svg>
            {APP_NAME}
          </a>
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            Runs in your browser. Nothing you enter is uploaded.
          </p>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10 md:py-10">
        <nav aria-label="Tools">
          <ul className="flex flex-wrap gap-2 md:sticky md:top-6 md:flex-col md:gap-1">
            {TOOLS.map((tool) => {
              const current = tool.id === activeId;
              return (
                <li key={tool.id}>
                  <a
                    href={`#/${tool.id}`}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      current
                        ? 'bg-accent-soft text-fg ring-1 ring-accent/40'
                        : 'text-muted hover:bg-subtle hover:text-fg',
                    )}
                  >
                    {tool.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <main id="main" className="min-w-0">
          <ActiveTool key={active.id} title={active.title} headingRef={headingRef} />
        </main>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-muted sm:px-6">
          All processing happens locally with standard browser APIs. The production build sets a
          Content Security Policy that blocks network requests from the page.
        </div>
      </footer>
    </div>
  );
}
