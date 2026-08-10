import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class FindPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/find'))
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
    return this.page.getByRole('button', { name: /filters|bộ lọc/i })
  }

  sortButton() {
    return this.page.getByRole('button', { name: /sort|sắp xếp/i })
  }

  typePill(label: RegExp | string) {
    return this.page.getByRole('button', { name: label })
  }

  drawer() {
    return this.page.getByRole('dialog')
  }

  async openFilters() {
    await this.filtersButton().click()
    await expect(this.drawer()).toBeVisible()
  }

  async openSort() {
    await this.sortButton().click()
    await expect(this.drawer()).toBeVisible()
  }

  async selectType(label: RegExp) {
    await this.typePill(label).click()
  }

  async search(query: string) {
    await this.searchInput().fill(query)
    await this.searchButton().click()
  }

  resultCards() {
    return this.page.locator('article')
  }

  emptyOrResults() {
    return this.page
      .locator('article')
      .or(this.page.getByText(/no matches yet|không có kết quả|thử tìm/i))
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.searchInput()).toBeVisible()
    await expect(this.filtersButton()).toBeVisible()
    await expect(this.sortButton()).toBeVisible()
  }
}
