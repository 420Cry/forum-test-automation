import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class FollowingPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/following'), {
      waitUntil: 'domcontentloaded',
    })
  }

  heading() {
    return this.page.getByRole('heading', {
      name: /following|đang theo dõi/i,
    })
  }

  emptyState() {
    return this.page.getByText(/not following anyone|chưa theo dõi/i)
  }

  cards() {
    return this.page.locator('article')
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.page.getByText(/loading|đang tải/i)).toHaveCount(0, {
      timeout: 15_000,
    })
  }
}
