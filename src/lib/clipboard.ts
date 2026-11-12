/**
 * Copies text to the clipboard. The asynchronous Clipboard API needs a secure context
 * (HTTPS or localhost); elsewhere it falls back to a temporary textarea and the legacy
 * `execCommand('copy')`, which browsers still support for user-initiated copies.
 */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command was rejected.');
}
