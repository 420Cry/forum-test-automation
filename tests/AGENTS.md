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
│   ├── messages/       MSG* — inbox, peer thread, send, reactions
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
- Skip Sendbird-dependent assertions when the inbox shows unavailable / session error (`MessagesPage.isMessagingAvailable()`).
- Messaging a peer requires a follow relationship either way (`canMessagePeer`). Always `followPeer()` before MSG04–MSG06; use `unfollowPeer()` for the not-connected toast case (MSG07).

## Selectors (priority)

1. `[data-testid="…"]` — only when already present in the app for product reasons; prefer not adding FE hooks solely for e2e
2. `getByRole(…, { name })` / aria-label
3. Stable ids (`#email`, `#find-q`, `#settings-location`, `#messages-search`, `#chat-composer`)
4. Multi-locale regex as last resort: `/filters|bộ lọc/i`

Never hardcode a single locale string when the UI is bilingual.
