import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { getAxeViolations } from './test/axe';
import { TOOLS } from './tools/registry';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('App', () => {
  it('opens the JSON tool by default', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'JSON formatter and validator' }),
    ).toBeInTheDocument();
    expect(document.title).toBe('JSON formatter and validator · Developer Toolkit');
  });

  it('lists every tool and marks the current one', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Tools' });
    expect(within(nav).getAllByRole('link')).toHaveLength(TOOLS.length);
    expect(within(nav).getByRole('link', { name: 'JSON' })).toHaveAttribute('aria-current', 'page');
  });

  it('switches tools from the URL fragment and moves focus to the new heading', async () => {
    const user = userEvent.setup();
    render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Tools' });
    await user.click(within(nav).getByRole('link', { name: 'Base64' }));
    goTo('#/base64');
    const heading = screen.getByRole('heading', { level: 1, name: 'Base64 encoder and decoder' });
    expect(heading).toHaveFocus();
    expect(within(nav).getByRole('link', { name: 'Base64' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('falls back to the default tool for unknown fragments', () => {
    window.location.hash = '#/does-not-exist';
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'JSON formatter and validator' }),
    ).toBeInTheDocument();
  });

  it('states that processing is local', () => {
    render(<App />);
    expect(screen.getByText(/Nothing you enter is uploaded/)).toBeInTheDocument();
  });

  it.each(TOOLS.map((tool) => [tool.id]))(
    'has no detectable accessibility violations on #/%s',
    async (id) => {
      window.location.hash = `#/${id}`;
      const { container } = render(<App />);
      expect(await getAxeViolations(container)).toEqual([]);
    },
  );
});
