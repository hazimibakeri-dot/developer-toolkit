# Contributing

Thanks for helping improve the toolkit. Bug reports, new tool ideas and focused pull requests are
welcome.

## Principles

Every tool must:

1. **Run locally.** No network requests, no third-party scripts and no analytics. The production
   Content Security Policy (`connect-src 'none'`) will block requests anyway; do not loosen it.
2. **Explain failures.** Invalid input gets a specific, actionable error message linked to its
   field.
3. **Avoid misleading claims.** Do not describe an encoding, hash or random value as more secure
   than it is.
4. **Be accessible.** Label every control, keep focus visible and test with the keyboard.

## Setup

```bash
npm install
npm run dev
```

## Adding a tool

1. Put the logic in `src/lib/<tool>.ts` as pure functions that return a `Result` for anything that
   can fail, and add unit tests to `src/lib/lib.test.ts`.
2. Build the UI in `src/tools/<Tool>Tool.tsx` using `ToolPage` and the shared components in
   `src/components/`.
3. Register the tool in `src/tools/registry.ts`; navigation, routing and the accessibility test
   pick it up automatically.
4. Add interaction tests in `src/tools/tools.test.tsx` and update the README table.

## Checks

```bash
npm run check
```

This runs ESLint, the Prettier format check, the tests and a production build (which includes
the TypeScript check). CI runs the same steps.

## Commit messages

Use short, imperative subjects, for example `Add JWT decoder` or `Fix Base64 padding detection`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
