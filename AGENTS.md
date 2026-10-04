# Agent Guidelines for Repo Insights

Next.js 16 / React 19 app (TypeScript, ESM-only) for visualizing GitHub repo insights. Uses Biome, Vitest, HeroUI + Tailwind v4, SWR, Zustand, Zod.

## Non-obvious essentials

- **Package manager is Yarn, not npm.** `"type": "module"` (ESM only), Node >= 20.
- **GitHub data layer lives in `src/helpers/github/`** (incorporated from the former `@gittrends-app/core` submodule, trimmed to what the app uses): `client.ts` (fetch-based GraphQL client, drops `null`s from responses), `queries.ts` (static GraphQL documents), `service.ts` (`GithubService`: viewer, repository, stargazers/releases/watchers pagination with page-size halving on 5xx), `cache.ts` (`CacheService` decorator). Entities are Zod schemas in `src/entities/`.
- **Path alias:** `@/*` → `src/*` (also mirrored in `vitest.config.ts`).
- **No standalone typecheck script.** Type errors surface via `next build`. `yarn verify` = `run-s lint build` (lint → build), used for CI.
- **Lint only covers `./src`** (`biome check ./src`).

## Commands

```bash
yarn dev              # dev server (port 3000)
yarn build            # prod build
yarn test             # vitest run
yarn lint / lint:fix  # biome check ./src [--write]
yarn format           # biome format --write ./src
yarn verify           # lint + build (CI gate)
```

- Single test: `npx vitest run path/to/file.spec.ts` (watch: `npx vitest path/to/file.spec.ts`).
- Specs live next to the code as `*.spec.ts` (e.g. `src/helpers/github/*.spec.ts`); they are excluded from the Next.js typecheck via `tsconfig.json`.

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
