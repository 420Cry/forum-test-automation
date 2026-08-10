import { expect } from '@playwright/test'
import { clickUntilReady } from '../helpers/retry'
import { BasePage } from './BasePage'

/** Left rail + header chrome on the protected home layout. */
export class AppShellPage extends BasePage {
  logo() {
    return this.page.getByRole('link', { name: /forum/i })
  }

  languageGroup() {
    return this.page.getByRole('group', { name: /language|ngôn ngữ/i })
  }

  profileAvatarButton() {
    return this.page.getByRole('button', {
      name: /view your profile|xem hồ sơ của bạn/i,
    })
  }

  accountMenuButton() {
    return this.page.getByRole('button', {
      name: /signed in as|đã đăng nhập/i,
    })
  }

  nav() {
    return this.page.getByRole('navigation')
  }

  navLink(name: RegExp) {
    return this.nav().getByRole('link', { name })
  }

  socialHeading() {
    return this.page.getByRole('heading', { name: /social/i })
  }

  socialFeedSoonCopy() {
    return this.page.getByText(/feed will live here|bảng tin sẽ xuất hiện/i)
  }

  async openAccountMenu() {
    await this.ensureProfileCached()
    const settingsItem = this.page.getByRole('menuitem', {
      name: /settings|cài đặt/i,
    })
    await clickUntilReady(this.accountMenuButton(), () =>
      settingsItem.isVisible(),
    )
  }

  async goToSettingsViaMenu() {
    await this.openAccountMenu()
    await this.page
      .getByRole('menuitem', { name: /settings|cài đặt/i })
      .click()
    await expect(this.page).toHaveURL(/\/settings/)
  }

  async expectShellLoaded() {
    await expect(this.logo()).toBeVisible()
    await expect(this.profileAvatarButton()).toBeVisible()
    await expect(this.accountMenuButton()).toBeVisible()
    await expect(this.navLink(/social/i)).toBeVisible()
    await expect(this.navLink(/find|tìm/i)).toBeVisible()
    await expect(this.navLink(/following|đang theo dõi/i)).toBeVisible()
    await expect(this.navLink(/settings|cài đặt/i)).toBeVisible()
  }

  async goto() {
    await this.ensureProfileCached()
  }

  async expectSocialLoaded() {
    await expect(this.socialHeading()).toBeVisible()
    await expect(this.socialFeedSoonCopy()).toBeVisible()
  }

  async openOwnProfileFromHeader() {
    await this.ensureProfileCached()
    await clickUntilReady(this.profileAvatarButton(), async () =>
      this.page.url().includes('/u/'),
    )
    await expect(this.page).toHaveURL(/\/u\//)
  }
}
