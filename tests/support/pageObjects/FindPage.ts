import { expect } from '@playwright/test'
import { clickUntilReady } from '../helpers/retry'
import { waitForBusyCleared } from '../helpers/loading'
import { BasePage } from './BasePage'

export class FindPage extends BasePage {
  async goto() {
    await this.ensureOnFindPage()
    await this.expectLoaded()
  }

  async ensureOnFindPage() {
    if (
      this.page.url().includes('/find')
      && (await this.heading().isVisible())
    ) {
      return
    }
    await this.openFindViaNav()
  }

  heading() {
    return this.page.getByRole('heading', { name: /directory|danh bạ/i })
  }

  searchInput() {
    return this.page.locator('#find-q')
  }

  searchButton() {
    return this.page.getByRole('button', {
      name: /^(?:search|searching|tìm kiếm|đang tìm)/i,
    })
  }

  filtersButton() {
    return this.findPanel().getByRole('button', { name: /filters|bộ lọc/i })
  }

  sortButton() {
    return this.findPanel().getByRole('button', { name: /sort|sắp xếp/i })
  }

  private findPanel() {
    return this.page.locator('section').filter({ has: this.searchInput() })
  }

  /** Type tabs (All / People) — not filter chips or "Clear all". */
  typePills() {
    return this.findPanel().locator('div.flex-wrap').first().getByRole('button')
  }

  /** Role quick filters — not removable facet chips below. */
  rolePills() {
    return this.findPanel().locator('div.flex-wrap').nth(1).getByRole('button')
  }

  typePill(label: RegExp | string) {
    return this.typePills().filter({ hasText: label })
  }

  rolePill(label: RegExp | string) {
    return this.rolePills().filter({ hasText: label })
  }

  drawer() {
    return this.page.getByRole('dialog')
  }

  async openFilters() {
    await this.clickDrawerTrigger(this.filtersButton())
  }

  async openSort() {
    await this.clickDrawerTrigger(this.sortButton())
  }

  async waitForSettled(timeout = 20_000) {
    await waitForBusyCleared(this.page, timeout)
  }

  private async clickDrawerTrigger(
    trigger: ReturnType<FindPage['filtersButton']>,
  ) {
    await this.ensureOnFindPage()
    await this.expectLoaded()
    await this.waitForSettled()

    const drawer = this.drawer()
    await expect(trigger).toBeVisible({ timeout: 10_000 })

    const ok = await clickUntilReady(
      trigger,
      () => drawer.isVisible(),
      { attempts: 8, delayMs: 300 },
    )
    if (!ok) {
      await this.openFindViaNav()
      await this.expectLoaded()
      await this.waitForSettled()
      await clickUntilReady(
        trigger,
        () => drawer.isVisible(),
        { attempts: 8, delayMs: 300 },
      )
    }
    await expect(drawer).toBeVisible({ timeout: 15_000 })
  }

  async selectType(label: RegExp) {
    await this.typePill(label).first().click()
  }

  async selectRole(label: RegExp) {
    await this.rolePill(label).first().click()
  }

  async search(query: string) {
    await this.ensureOnFindPage()
    await this.waitForSettled()
    await this.fillStable(this.searchInput(), query)
    await this.searchButton().click()
    await this.waitForSettled()
  }

  resultCards() {
    return this.page.locator('article:not([aria-hidden])')
  }

  emptyOrResults() {
    return this.resultCards().or(
      this.page.getByText(
        /no matches yet|không có kết quả|try a different search|chưa có gợi ý/i,
      ),
    )
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.searchInput()).toBeVisible()
    await expect(this.filtersButton()).toBeVisible()
    await expect(this.sortButton()).toBeVisible()
    await this.waitForSettled()
  }
}
