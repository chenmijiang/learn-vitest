---
name: vitest-test-author
description: Scaffold a new test file in __tests__/ following the project's node-tests / browser-tests project conventions. Use when the user asks to "add a test for X", "write a test case for Y", or scaffold a test from an existing docs/NNN-*.md article.
disable-model-invocation: true
---

# Vitest Test Author

A user-invocable skill that scaffolds new test files in `__tests__/` using the conventions already established in this project. Trigger it explicitly — it should not fire on every test-related conversation.

## Project layout (do not invent — these are the actual conventions)

This project's `vitest.config.ts` defines two projects:

| Project       | Glob                                   | Plugins                | Notes                                           |
| ------------- | -------------------------------------- | ---------------------- | ----------------------------------------------- |
| node-tests    | `__tests__/**/*.test.ts`               | none                   | excludes `__tests__/browser/**`                 |
| browser-tests | `__tests__/browser/**/*.test.{ts,tsx}` | `@vitejs/plugin-react` | runs via `@vitest/browser-playwright`, chromium |

When the user picks a target, use the right folder. Never put a `.tsx` outside `__tests__/browser/`.

## Decision flow

1. **Clarify scope first.** Ask the user (one short question, not a wall):
   - Which Vitest topic is this test exercising? (e.g. snapshot, mock, lifecycle, browser render)
   - Is there an existing `docs/NNN-*.md` that anchors the behavior? If yes, read it before drafting.
   - Node project (logic/API tests) or browser project (DOM/React)?
2. **Pick a filename** in kebab-case, mirroring an existing convention:
   - Node: `__tests__/<topic>.test.ts` (e.g. `__tests__/lifecycle.test.ts`)
   - Browser: `__tests__/browser/<topic>.test.tsx` for components, `__tests__/browser/<topic>.test.ts` for DOM-only
3. **Check for collision.** If a file with that name already exists, prefer extending it with a new `describe(...)` block instead of creating a sibling — the existing test files already group related cases.
4. **Draft from canonical templates** (see below). Do not invent helpers or wrappers — stick to vitest primitives the rest of the codebase uses (`describe`, `test`, `it`, `expect`, `assert`, `vi`, hooks).
5. **Run the relevant project** to confirm the scaffold is green or fails for the expected reason:
   - `bun run test:run --project=node-tests`
   - `bun run test:run --project=browser-tests`

## Canonical templates

### Node test (`__tests__/<topic>.test.ts`)

```ts
import { assert, describe, expect, test } from "vitest";

describe("<topic — short, what it exercises>", () => {
  test("<concrete behavior in plain language>", () => {
    // arrange
    // act
    // assert — prefer expect(...).toXxx for value checks, assert.equal for primitives
  });
});
```

### Browser test (`__tests__/browser/<topic>.test.tsx`)

```tsx
import { expect, it } from "vitest";
import { render } from "vitest-browser-react";

function Subject() {
  return <h1>...</h1>;
}

it("<observable user-facing behavior>", async () => {
  const screen = await render(<Subject />);

  await expect
    .element(screen.getByRole("heading", { name: "..." }))
    .toBeVisible();
});
```

### Notes that come up regularly

- Snapshot tests live alongside the test file; the engine writes into `__tests__/__snapshots__/` automatically — do not create that folder manually.
- For mock cleanup, follow the pattern in `__tests__/mock-cleanup-methods.test.ts`; do not introduce a global `beforeEach(vi.restoreAllMocks)` unless the user asks.
- The `globalSetup.ts` already runs once per test session — do not duplicate its setup inside individual files.

## Cross-references

If a `docs/NNN-*.md` exists for the behavior, link it in a brief comment at the top of the test file:

```ts
// see docs/NNN-<slug>.md for background
```

## When NOT to use this skill

- Do not use to "fix" an existing test — that's regular editing, not scaffolding.
- Do not use to write integration tests outside `__tests__/` — the project has no such convention yet; ask the user before introducing one.
- Do not use to generate test cases from a wiki topic page directly; wiki pages are summaries, not specs. Use the underlying `docs/NNN-*.md` or the Vitest official docs instead.
