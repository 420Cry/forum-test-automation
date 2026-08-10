# Forum E2E (Playwright)

End-to-end tests for [forum-app](../forum/forum-app). Structure follows [second-hand-test-automation](https://github.com/ingka-group-digital/second-hand-test-automation): specs in `tests/e2e/`, page objects in `tests/support/pageObjects/`.

> Working with an AI agent? Read [`AGENTS.md`](AGENTS.md) first.

## Via forum-server (recommended)

With the stack up (`forum dev`):

```bash
forum install:clone    # includes this repo
forum repo:setup       # bun install + Playwright Chromium + .env.local
forum db:migrate       # required — auth.setup provisions onboarded users via API
forum test:verify
forum test:smoke
forum test
```

Local defaults (`test@test.com` / `test2@test.com`) are in `.env.example`. `auth.setup` creates confirmed Supabase users and completes onboarding through `POST /user/onboarding` before authenticated specs run.

## Setup (standalone)

```bash
bun install
bunx playwright install chromium
cp .env.local.example .env.local   # or .env.example → .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `BASE_URL` | no (default `http://app.forum.test`) | Forum app origin |
| `LOCALE` | no (default `en`) | `en` or `vn` path prefix |
| `E2E_EMAIL` / `E2E_PASSWORD` | yes for authenticated suites | Onboarded user |
| `E2E_PEER_URL_KEY` | optional | Peer `/u/:urlKey` for follow/profile |

Start the forum stack so `http://app.forum.test` is up.

## Run

```bash
make verify                     # typecheck + playwright --list

bun run playwright:test:smoke   # SMK* (guest project)
bun run playwright:test         # smoke + authenticated
bun run playwright:test:ui
bun run playwright:test:headed
bun run playwright:test:find
bun run playwright:report
```

## Layout

```
tests/
  auth.setup.ts
  config/env.ts
  e2e/smoke|find|profile|following/
  support/pageObjects|helpers|fixtures/
```
