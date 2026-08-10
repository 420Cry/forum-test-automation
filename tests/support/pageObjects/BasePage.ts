import { type Page, expect } from '@playwright/test'
import { localePath } from '../../config/env'

/** Shared base for page objects (mirrors second-hand-test-automation). */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Protected routes other than /social can redirect to /onboard before
   * `/auth/me` finishes. Social middleware always awaits profile sync.
   */
  protected async ensureProfileCached() {
    if (
      this.page.url().includes('/social')
      && (await this.page
        .getByRole('button', { name: /view your profile|xem hồ sơ của bạn/i })
        .isVisible())
    ) {
      await expect(
        this.page.getByRole('heading', { name: /social/i }),
      ).toBeVisible()
      return
    }

    const meResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/auth/me')
        && response.request().method() === 'GET'
        && response.ok(),
      { timeout: 20_000 },
    )

    await this.page.goto(localePath('/social'), {
      waitUntil: 'domcontentloaded',
    })

    try {
      const response = await meResponse
      const me = (await response.json()) as { profile?: { onboarded?: boolean } }
      if (!me.profile?.onboarded) {
        throw new Error(
          'E2E user is not onboarded. Re-run auth setup and forum db:migrate.',
        )
      }
    }
    catch (error) {
      if (
        error instanceof Error
        && error.message.includes('not onboarded')
      ) {
        throw error
      }
      await expect(this.page).toHaveURL(/\/social/, { timeout: 15_000 })
      await expect(this.page).not.toHaveURL(/\/onboard/)
    }

    await expect(
      this.page.getByRole('heading', { name: /social/i }),
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      this.page.getByRole('button', {
        name: /view your profile|xem hồ sơ của bạn/i,
      }),
    ).toBeVisible()
  }

  /** Client-side nav keeps the warmed `/auth/me` profile cache in the SPA. */
  protected async openFindViaNav() {
    await this.ensureProfileCached()
    await this.page
      .getByRole('navigation')
      .getByRole('link', { name: /find|tìm/i })
      .click()
    await expect(this.page).toHaveURL(/\/find/, { timeout: 15_000 })
    await expect(
      this.page.getByRole('heading', { name: /directory|danh bạ/i }),
    ).toBeVisible({ timeout: 15_000 })
  }

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

  /** Wait until Vue owns an input (fill survives a short delay). */
  protected async waitForInputHydration(input: ReturnType<Page['locator']>) {
    const probe = `probe-${Date.now()}@example.com`
    const deadline = Date.now() + 15_000
    while (Date.now() < deadline) {
      try {
        await input.fill(probe)
        await this.page.waitForTimeout(200)
        if ((await input.inputValue()) !== probe) {
          await this.page.waitForTimeout(200)
          continue
        }
        await this.page.waitForTimeout(400)
        if ((await input.inputValue()) === probe) {
          await input.fill('')
          return
        }
      }
      catch {
        await this.page.waitForTimeout(300)
      }
    }
    throw new Error('Form input did not hydrate in time')
  }
}
