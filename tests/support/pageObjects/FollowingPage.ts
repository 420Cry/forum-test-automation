import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { waitForBusyCleared } from '../helpers/loading'
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
    return this.page.locator('article:not([aria-hidden])')
  }

  async cardCount() {
    await this.expectLoaded()
    return this.cards().count()
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await waitForBusyCleared(this.page, 20_000)
  }
}
