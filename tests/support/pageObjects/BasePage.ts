import { type Page, expect } from '@playwright/test'
import {
  ensureProfileCached,
  openFindViaNav,
} from '../helpers/profileCache'

/** Shared base for page objects (mirrors second-hand-test-automation). */
export class BasePage {
  constructor(protected readonly page: Page) {}

  protected ensureProfileCached() {
    return ensureProfileCached(this.page)
  }

  protected openFindViaNav() {
    return openFindViaNav(this.page)
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

  /** Fill a Vue-controlled input until the value sticks. */
  protected async fillStable(
    input: ReturnType<Page['locator']>,
    value: string,
  ) {
    for (let attempt = 0; attempt < 15; attempt += 1) {
      await input.fill(value)
      if ((await input.inputValue()) === value) return
      await this.page.waitForTimeout(200)
    }
    await expect(input).toHaveValue(value)
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
