import { type Page, expect } from '@playwright/test'

/** Shared base for page objects (mirrors second-hand-test-automation). */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /** Fail fast when nginx/proxy is up but forum-app is not (common local miss). */
  async assertAppReachable() {
    const gateway = this.page.getByRole('heading', {
      name: /502 Bad Gateway|503 Service|504 Gateway/i,
    })
    if ((await gateway.count()) > 0) {
      const label = (await gateway.first().innerText()).trim()
      throw new Error(
        `App unreachable at ${this.page.url()} (${label}). Start the stack with: forum dev`,
      )
    }
  }

  async assertToastMessage(
    expectedPattern: string | RegExp,
    { timeout = 5_000, waitForDismiss = true } = {},
  ) {
    const pattern =
      expectedPattern instanceof RegExp
        ? expectedPattern
        : new RegExp(
            expectedPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'i',
          )

    const toast = this.page.getByRole('alert').filter({ hasText: pattern })
    await expect(toast.first()).toBeVisible({ timeout })

    if (waitForDismiss) {
      await toast
        .first()
        .waitFor({ state: 'hidden', timeout: 8_000 })
        .catch(() => undefined)
    }
  }
}
