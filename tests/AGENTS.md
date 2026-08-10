# tests/AGENTS.md

Scope: writing or fixing Playwright tests under `tests/e2e/**`.

## Layout

```
tests/
├── e2e/
│   ├── smoke/          SMK* — guest auth UI + login (no storageState)
│   ├── navigation/     NAV* — header + left rail
│   ├── social/         SOC* — feed placeholder
│   ├── find/           FIND*
│   ├── profile/        PROF*
│   ├── following/      FLW*
│   ├── settings/       SET* — hub + profile editor + location autocomplete
│   └── journey/        JOUR* — multi-page authenticated flows
├── support/
│   ├── pageObjects/    BasePage + domain POMs
│   ├── helpers/        auth helpers
│   └── fixtures/       Playwright fixtures (page objects)
├── config/env.ts
└── auth.setup.ts
```

## Conventions

- **Test IDs in the title:** `test('FIND01 Loads directory…', …)`.
- Use `test.step` for multi-step / journey flows (helps HTML report).
- Assert **rendering** (headings, fields editable/visible, roles) before interactions.
- Reuse page objects before adding locators in specs.
- Guest/smoke specs run in the `guest` project; authenticated specs depend on `auth.setup.ts`.
- Skip peer-only flows when `E2E_PEER_URL_KEY` is unset.

## Selectors (priority)

1. `[data-testid="…"]` (none in app yet — prefer adding when roles are weak)
2. `getByRole(…, { name })`
3. Stable ids (`#email`, `#find-q`, `#settings-location`)
4. Multi-locale regex as last resort: `/filters|bộ lọc/i`

Never hardcode a single locale string when the UI is bilingual.
