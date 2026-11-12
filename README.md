# Developer Toolkit

A small set of everyday developer utilities that run entirely in the browser. Nothing you type or
paste is sent to a server.

| Tool           | What it does                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **JSON**       | Validate, pretty-print (2 spaces, 4 spaces or tabs, optional key sorting) or minify; errors show line and column        |
| **UUID**       | Generate 1–100 random version 4 UUIDs, optionally uppercase or without hyphens                                          |
| **Timestamp**  | Convert Unix seconds or milliseconds and date strings to ISO 8601, UTC, local time and relative time                    |
| **Text case**  | camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, Title Case, Sentence case, lower and upper case |
| **URL encode** | Percent-encode or decode a URL component or a full URL, with a breakdown of URL parts and query parameters              |
| **Base64**     | Encode or decode UTF-8 text, with the URL-safe (base64url) alphabet as an option                                        |
| **Hash**       | SHA-1, SHA-256, SHA-384 and SHA-512 digests in hexadecimal or Base64                                                    |

Every result has a copy-to-clipboard button. Invalid input gets a specific error message linked to
the field it describes.

## Privacy and security

- **Local processing.** Every tool uses standard browser APIs (`JSON`, `crypto.randomUUID`,
  `Intl`, `encodeURIComponent`, `TextEncoder`, `crypto.subtle.digest`). There is no backend, no
  analytics and no third-party script.
- **Enforced by the browser.** The production build adds a Content Security Policy with
  `connect-src 'none'`, so the browser blocks `fetch`, XHR, WebSocket and beacon requests from the
  page. See `CONTENT_SECURITY_POLICY` in [`vite.config.ts`](vite.config.ts). When you deploy, also
  send the policy as an HTTP header, which supports directives a `<meta>` tag cannot (such as
  `frame-ancestors`).
- **No storage.** Input is kept in memory only and disappears when you close or reload the page.
- **Clipboard.** Copy buttons write to the clipboard only when you click them.

What this toolkit does not claim:

- **Hashes are not password storage.** SHA digests are fast by design; use a dedicated password
  hashing function (Argon2id, scrypt or bcrypt) on a server. SHA-1 is included only for
  compatibility, because practical collision attacks against it exist. MD5 is not offered because
  the Web Crypto API does not provide it.
- **Base64 is not encryption.** Anyone can decode it.
- **UUIDs** come from the browser's cryptographically secure random number generator, but a UUID
  is an identifier, not a secret or an access token.

## Browser requirements

Current versions of Chrome, Edge, Firefox and Safari. The hash tool and `crypto.randomUUID` need a
[secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or
`localhost`). Outside one, UUIDs fall back to `crypto.getRandomValues`, and the hash tool explains
why it is unavailable.

## Getting started

Requires Node.js 22.12 or later (Node 24 LTS recommended; see `.nvmrc`).

```bash
npm install
npm run dev
```

Tools are addressed by URL fragment, for example `/#/json` or `/#/hash`. Fragment routing works on
any static host without rewrite rules, and fragments are never sent to the server.

## Scripts

| Command            | What it does                                                       |
| ------------------ | ------------------------------------------------------------------ |
| `npm run dev`      | Development server (no CSP, so hot reloading works)                |
| `npm run build`    | Type-check and build to `dist/`, with the CSP meta tag             |
| `npm run preview`  | Serve the production build locally                                 |
| `npm run lint`     | ESLint, including React Hooks and JSX accessibility rules          |
| `npm run format`   | Prettier                                                           |
| `npm test`         | Unit tests for every tool's logic and interaction tests for its UI |
| `npm run coverage` | Tests with a coverage report                                       |
| `npm run check`    | Lint, format check, tests and build                                |

## Project structure

```text
src/
├── lib/          Pure, unit-tested logic for each tool (no React)
├── tools/        One component per tool, plus the tool registry
├── components/   Shared UI: ToolPage, form fields, CopyButton, result lists
├── hooks/        useHashRoute
└── App.tsx       Layout, navigation and focus management
```

To add a tool, write its logic in `src/lib/`, a component in `src/tools/`, then add an entry to
`src/tools/registry.ts`.

## Accessibility

- Every control has a visible label; errors are linked with `aria-describedby` and
  `aria-invalid`.
- Copy confirmations and status messages are announced through polite live regions; errors after
  a button press use `role="alert"`.
- Switching tools moves keyboard focus to the new tool's heading, and the current tool is marked
  with `aria-current`.
- Visible focus outlines, light and dark themes that follow the system setting, and reduced-motion
  support.

The automated tests run axe-core on every tool (in jsdom, where colour contrast cannot be
measured). Manual screen reader testing has not been done yet.

## Limitations

- Timestamp detection treats numbers below 100,000,000,000 as seconds and larger numbers as
  milliseconds. Choose the unit explicitly near that boundary.
- Date strings are parsed by the browser's `Date.parse`. ISO 8601 is reliable everywhere; other
  formats vary between browsers.
- Base64 decoding expects text. Binary data, such as images, is reported as not being UTF-8.
- Very large inputs (many megabytes) are processed on the main thread and may make the page
  briefly unresponsive.

## License

[MIT](LICENSE)
