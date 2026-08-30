import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class SettingsHubPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/settings'))
  }

  private main() {
    return this.page.getByRole('main')
  }

  heading() {
    return this.main().getByRole('heading', { name: /settings|cài đặt/i })
  }

  profileCta() {
    return this.main().getByRole('link', {
      name: /view and edit personal profile|xem và chỉnh sửa hồ sơ/i,
    })
  }

  passwordSectionLink() {
    return this.main().locator(`a[href*="/settings/password"]`)
  }

  privacyHeading() {
    return this.main().getByRole('heading', { name: /privacy|quyền riêng tư/i })
  }

  cookieSettings() {
    return this.main().getByRole('button', {
      name: /cookie settings|cài đặt cookie/i,
    })
  }

  cookiePolicyLink() {
    return this.main().getByRole('link', {
      name: /cookie policy|chính sách cookie/i,
    })
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.profileCta()).toBeVisible()
    await expect(this.passwordSectionLink()).toBeVisible()
    await expect(this.privacyHeading()).toBeVisible()
    await expect(this.cookieSettings()).toBeVisible()
    await expect(this.cookiePolicyLink()).toBeVisible()
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
