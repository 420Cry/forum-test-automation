import { expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class SocialPage extends BasePage {
  async goto() {
    await this.ensureProfileCached()
  }

  heading() {
    return this.page.getByRole('heading', { name: /social/i })
  }

  feedSoonCopy() {
    return this.page.getByText(/feed will live here|bảng tin sẽ xuất hiện/i)
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.feedSoonCopy()).toBeVisible()
  }
}
