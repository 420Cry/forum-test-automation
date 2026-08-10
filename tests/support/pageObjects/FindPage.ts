import { expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class FindPage extends BasePage {
  async goto() {
    await this.openFindViaNav()
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
    await this.expectLoaded()
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
    await this.clickUntilVisible(/^filters$|^bộ lọc$/i, this.drawer())
  }

  async openSort() {
    await this.clickUntilVisible(/sort|sắp xếp/i, this.drawer())
  }

  private async clickUntilVisible(
    buttonName: RegExp,
    target: ReturnType<FindPage['drawer']>,
  ) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (!this.page.url().includes('/find')) {
        await this.goto()
      }
      const trigger = this.page.getByRole('button', { name: buttonName })
      await expect(trigger).toBeVisible({ timeout: 10_000 })
      await trigger.click({ timeout: 10_000 })
      if (await target.isVisible()) return
      await this.page.waitForTimeout(300)
    }
    await expect(target).toBeVisible({ timeout: 15_000 })
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
