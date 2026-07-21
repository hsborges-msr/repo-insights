# Agent Guidelines for Repo Insights

Next.js 16 / React 19 app (TypeScript, ESM-only) for visualizing GitHub repo insights. Uses Biome, Vitest, HeroUI + Tailwind v4, SWR, Zustand, Zod.

## Non-obvious essentials

- **Package manager is Yarn, not npm.** `"type": "module"` (ESM only), Node >= 20.
- **`libs/core` is a git submodule and is READ-ONLY — never edit files there.** It's `@gittrends-app/core`, imported via the `@/core` alias. If missing: `git submodule update --init --recursive`.
  - `preinstall` installs core's deps; `prebuild` runs `cd libs/core && npm run build` before every `next build`. To rebuild manually: `cd libs/core && npm run build` (there is **no** `yarn build:core` script despite what README says).
- **Path aliases:** `@/*` → `src/*`, `@/core` → `libs/core/src`.
- **No standalone typecheck script.** Type errors surface via `next build`. `yarn verify` = `run-s lint build` (lint → build), used for CI.
- **Lint only covers `./src`** (`biome check ./src`), not `libs/core`.

## Commands

```bash
yarn dev              # dev server (port 3000)
yarn build            # prod build (rebuilds core first via prebuild)
yarn test             # vitest run
yarn lint / lint:fix  # biome check ./src [--write]
yarn format           # biome format --write ./src
yarn verify           # lint + build (CI gate)
```

- Single test: `npx vitest run path/to/file.spec.ts` (watch: `npx vitest path/to/file.spec.ts`).
- **There is no vitest config and no tests under `src/`.** The only specs live in `libs/core/src/**/*.spec.ts` (read-only), so `yarn test` currently exercises core only.

## Git hooks (husky) — commits are gated

- `pre-commit`: runs `lint` + `test`. `pre-push`: runs `verify`. `commit-msg`: commitlint.
- **Conventional Commits required.** Allowed types include the standard set plus `ticket`. Example: `feat: add repository comparison`.

## Conventions (enforced by Biome — see `biome.json`)

- `noExplicitAny` and `noConsole` are **errors**; `noUnusedImports` is a warn. Use `// biome-ignore lint/suspicious/noExplicitAny: <reason>` only when unavoidable.
- Single quotes (JS/TS), double quotes in JSX, semicolons always, no trailing commas, 2-space indent, 120 cols, always arrow parens. Imports auto-organized by Biome.
- React components: PascalCase filename, default export. Utilities: camelCase filename.

## Layout (`src/`)

`app/` (App Router pages + `api/`; dynamic route `r/[owner]/[name]`), `entities/`, `helpers/` (`cache/` IndexedDB via idb-keyval, `env/` Zod-validated env, `github/` service creators), `hooks/`, `providers/`, `constants/`, `types/`.

## Planning workflow

When the user asks for a *plan*, follow `.opencode/rules/plan-documentation.rule.md`: produce RFCs in `docs/RFCs/`, ADRs in `docs/ADRs/` (only after RFC approval), and tasks in `docs/tasks/<code>/` before writing any code.
