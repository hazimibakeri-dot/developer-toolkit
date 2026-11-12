import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getAxeViolations } from '../test/axe';
import { Base64Tool } from './Base64Tool';
import { HashTool } from './HashTool';
import { JsonTool } from './JsonTool';
import { TextCaseTool } from './TextCaseTool';
import { TimestampTool } from './TimestampTool';
import { UrlTool } from './UrlTool';
import { UuidTool } from './UuidTool';

describe('JsonTool', () => {
  it('formats valid JSON and copies the result', async () => {
    const user = userEvent.setup();
    render(<JsonTool title="JSON" />);
    await user.click(screen.getByRole('button', { name: 'Load sample' }));
    await user.click(screen.getByRole('button', { name: 'Format' }));

    const result = screen.getByRole('textbox', { name: 'Result' });
    expect((result as HTMLTextAreaElement).value).toContain('\n  "name": "Example"');
    expect(screen.getByText('Valid JSON, formatted.')).toHaveAttribute('role', 'status');

    await user.click(screen.getByRole('button', { name: 'Copy JSON result' }));
    expect(await navigator.clipboard.readText()).toBe((result as HTMLTextAreaElement).value);
    expect(screen.getByText('JSON result copied to clipboard')).toBeInTheDocument();
  });

  it('shows an accessible error for invalid JSON', async () => {
    const user = userEvent.setup();
    const { container } = render(<JsonTool title="JSON" />);
    const input = screen.getByRole('textbox', { name: 'JSON input' });
    await user.type(input, '{{"a" 1}');
    await user.click(screen.getByRole('button', { name: 'Minify' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid JSON/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Invalid JSON/);
    expect(await getAxeViolations(container)).toEqual([]);
  });
});

describe('UuidTool', () => {
  it('generates the requested number of UUIDs', async () => {
    const user = userEvent.setup();
    render(<UuidTool title="UUID" />);
    const count = screen.getByRole('spinbutton', { name: /How many/ });
    await user.clear(count);
    await user.type(count, '3');
    await user.click(screen.getByRole('checkbox', { name: 'Uppercase' }));
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    const lines = screen
      .getByRole<HTMLTextAreaElement>('textbox', { name: 'UUIDs' })
      .value.split('\n');
    expect(lines).toHaveLength(3);
    for (const line of lines) expect(line).toMatch(/^[0-9A-F-]{36}$/);
  });

  it('explains an invalid count', async () => {
    const user = userEvent.setup();
    render(<UuidTool title="UUID" />);
    const count = screen.getByRole('spinbutton', { name: /How many/ });
    await user.clear(count);
    await user.type(count, '500');
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Count must be a whole number from 1 to 100.',
    );
    expect(count).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('TimestampTool', () => {
  it('converts a Unix timestamp', async () => {
    const user = userEvent.setup();
    render(<TimestampTool title="Timestamp" />);
    await user.type(screen.getByRole('textbox', { name: 'Timestamp or date' }), '1767225600');
    const results = screen.getByRole('region', { name: 'Conversion results' });
    expect(results).toHaveTextContent('2026-01-01T00:00:00.000Z');
    expect(results).toHaveTextContent('Unix time in seconds');
  });

  it('shows an error for unrecognised input and fills in the current time', async () => {
    const user = userEvent.setup();
    render(<TimestampTool title="Timestamp" />);
    const input = screen.getByRole('textbox', { name: 'Timestamp or date' });
    await user.type(input, 'soon');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await user.click(screen.getByRole('button', { name: 'Use current time' }));
    expect((input as HTMLInputElement).value).toMatch(/^\d{10}$/);
    expect(screen.getByRole('region', { name: 'Conversion results' })).toHaveTextContent(
      /Relative(now|1 second ago)/,
    );
  });
});

describe('TextCaseTool', () => {
  it('shows every conversion', async () => {
    const user = userEvent.setup();
    render(<TextCaseTool title="Text case" />);
    await user.type(screen.getByRole('textbox', { name: 'Text' }), 'user profile id');
    const results = screen.getByRole('region', { name: 'Converted text' });
    expect(results).toHaveTextContent('userProfileId');
    expect(results).toHaveTextContent('USER_PROFILE_ID');
    expect(within(results).getByRole('button', { name: 'Copy kebab-case' })).toBeEnabled();
  });
});

describe('UrlTool', () => {
  it('encodes text and breaks down URLs', async () => {
    const user = userEvent.setup();
    render(<UrlTool title="URL" />);
    await user.type(
      screen.getByRole('textbox', { name: 'Text to encode' }),
      'https://example.com/?q=a b',
    );
    expect(screen.getByRole('textbox', { name: 'Result' })).toHaveValue(
      'https%3A%2F%2Fexample.com%2F%3Fq%3Da%20b',
    );
    expect(screen.getByRole('heading', { name: 'URL breakdown' })).toBeInTheDocument();
  });

  it('reports malformed percent-encoding when decoding', async () => {
    const user = userEvent.setup();
    render(<UrlTool title="URL" />);
    await user.click(screen.getByRole('radio', { name: 'Decode' }));
    const input = screen.getByRole('textbox', { name: 'Text to decode' });
    await user.type(input, '100%');
    expect(input).toHaveAccessibleDescription(/Malformed percent-encoding/);
  });
});

describe('Base64Tool', () => {
  it('encodes, swaps and decodes', async () => {
    const user = userEvent.setup();
    render(<Base64Tool title="Base64" />);
    await user.type(screen.getByRole('textbox', { name: 'Text to encode' }), 'héllo');
    expect(screen.getByRole('textbox', { name: 'Result' })).toHaveValue('aMOpbGxv');
    await user.click(screen.getByRole('button', { name: 'Use result as input' }));
    expect(screen.getByRole('textbox', { name: 'Base64 to decode' })).toHaveValue('aMOpbGxv');
    expect(screen.getByRole('textbox', { name: 'Result' })).toHaveValue('héllo');
  });
});

describe('HashTool', () => {
  it('shows SHA digests of the input', async () => {
    const user = userEvent.setup();
    render(<HashTool title="Hash" />);
    await user.type(screen.getByRole('textbox', { name: 'Text to hash' }), 'abc');
    const results = screen.getByRole('region', { name: 'Hash results' });
    expect(
      await within(results).findByText(
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Base64' }));
    expect(
      await within(results).findByText('ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0='),
    ).toBeInTheDocument();
  });

  it('includes security guidance', () => {
    render(<HashTool title="Hash" />);
    expect(screen.getByRole('complementary', { name: 'Security notes' })).toHaveTextContent(
      /Do not store passwords as plain hashes/,
    );
  });
});
