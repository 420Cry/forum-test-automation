# AGENTS.md — forum-test-automation

Playwright E2E suite for [forum-app](../forum/forum-app). Layout mirrors [second-hand-test-automation](https://github.com/ingka-group-digital/second-hand-test-automation) (page objects under `tests/support`, specs under `tests/e2e`, `make verify`).

## Stack

- **Runtime:** Node `>=22` / Bun (`packageManager` in `package.json`)
- **Language:** TypeScript (ESM)
- **Runner:** Playwright

## Run

```bash
bun install
bunx playwright install chromium
cp .env.local.example .env.local   # fill E2E_EMAIL / E2E_PASSWORD

make verify                  # typecheck + test discovery
# or via forum-server:
#   forum test:unit          # api + app unit tests (no stack)
#   forum test:verify        # e2e typecheck + discovery (no stack)
#   forum test:smoke         # guest e2e only (stack required)
#   forum test               # unit + full e2e (stack required for e2e)
#   forum test:e2e           # full e2e only
#   forum lint:fix
bun run playwright:test:smoke
bun run playwright:test      # guest smoke + authenticated suites
bun run lint:fix
```

Forum stack must be up (`http://app.forum.test` by default). Without `E2E_EMAIL` / `E2E_PASSWORD` in `.env.local`, only the `guest` project runs (setup + authenticated suites are omitted).

## Hard constraints

- Never commit `.env`, `.env.local`, or credentials.
- Prefer `data-testid`, role + accessible name, or aria — not CSS class chains.
- Prefer locale-aware regex (`/sign in|đăng nhập/i`) until Phrase i18n fixtures exist.
- Put new page objects in `tests/support/pageObjects/`; put specs under `tests/e2e/`.
- Test IDs in titles: `SMK*`, `NAV*`, `SOC*`, `FIND*`, `PROF*`, `FLW*`, `MSG*`, `SET*`, `JOUR*`.
- Cover **UI rendering** (headings/fields visible) and at least one **full journey** for authenticated paths when credentials exist.

## Layout

```
tests/
  auth.setup.ts              # storageState → playwright/.auth/user.json
  config/env.ts
  e2e/
    smoke/                   # guest project (no session)
    navigation/ social/ find/ profile/ following/ messages/ settings/ journey/
  support/
    pageObjects/
    helpers/
    fixtures/test.ts         # page-object fixtures
```

## Definition of done

1. `make verify` exits 0.
2. Relevant suite passes against a running forum stack when credentials are set.
3. No secrets or `playwright/.auth/` in the diff.

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml` on every push/PR to `main`.

- **verify:** lint, typecheck, `playwright test --list`
- **forum-app PRs:** full e2e runs in [forum-app CI](../forum-app/.github/workflows/ci.yml). Prefer the **same branch name** as the app PR (e.g. `4FOR-56`); CI checks out that ref when it exists, otherwise `main`. Scenario pass/fail table: `bun run report:e2e-summary` (also invoked from `forum-app/.github/scripts/ci-e2e.sh`).

See also [`tests/AGENTS.md`](tests/AGENTS.md).
