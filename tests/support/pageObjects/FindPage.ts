import { expect } from '@playwright/test'
import { clickUntilReady } from '../helpers/retry'
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
    return this.page.getByRole('button', { name: /^(search|tìm kiếm)$/i })
  }

  filtersButton() {
    return this.page.getByRole('button', { name: /^filters$|^bộ lọc$/i })
  }

  sortButton() {
    return this.page.getByRole('button', { name: /sort/i })
  }

  typePill(label: RegExp | string) {
    return this.page.getByRole('button', { name: label })
  }

  drawer() {
    return this.page.getByRole('dialog')
  }

  async openFilters() {
    await this.clickDrawerTrigger(/^filters$|^bộ lọc$/i)
  }

  async openSort() {
    await this.clickDrawerTrigger(/sort|sắp xếp/i)
  }

  private async clickDrawerTrigger(buttonName: RegExp) {
    await this.ensureOnFindPage()
    await this.expectLoaded()

    const drawer = this.drawer()
    const trigger = this.page.getByRole('button', { name: buttonName })
    await expect(trigger).toBeVisible({ timeout: 10_000 })

    const ok = await clickUntilReady(
      trigger,
      () => drawer.isVisible(),
      { attempts: 8, delayMs: 300 },
    )
    if (!ok) {
      await this.openFindViaNav()
      await this.expectLoaded()
      await clickUntilReady(
        this.page.getByRole('button', { name: buttonName }),
        () => drawer.isVisible(),
        { attempts: 8, delayMs: 300 },
      )
    }
    await expect(drawer).toBeVisible({ timeout: 15_000 })
  }

  async selectType(label: RegExp) {
    await this.typePill(label).click()
  }

  async search(query: string) {
    await this.ensureOnFindPage()
    await this.fillStable(this.searchInput(), query)
    await this.searchButton().click()
  }

  resultCards() {
    return this.page.locator('article')
  }

  emptyOrResults() {
    return this.page
      .locator('article')
      .or(this.page.getByText(/no matches yet|không có kết quả|try a different search/i))
      .or(this.page.getByText(/loading|đang tải/i))
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.searchInput()).toBeVisible()
    await expect(this.filtersButton()).toBeVisible()
    await expect(this.sortButton()).toBeVisible()
  }
}
