import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class SettingsHubPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/settings'))
  }

  heading() {
    return this.page.getByRole('heading', { name: /settings|cài đặt/i })
  }

  profileCta() {
    return this.page.getByRole('link', {
      name: /view and edit personal profile|xem và chỉnh sửa hồ sơ/i,
    })
  }

  passwordSectionLink() {
    return this.page.locator(`a[href*="/settings/password"]`)
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.profileCta()).toBeVisible()
    await expect(this.passwordSectionLink()).toBeVisible()
  }

  async openProfile() {
    await this.profileCta().click()
    await expect(this.page).toHaveURL(/\/settings\/profile/)
  }

  async openPassword() {
    await this.passwordSectionLink().click()
    await expect(this.page).toHaveURL(/\/settings\/password/)
  }
}
