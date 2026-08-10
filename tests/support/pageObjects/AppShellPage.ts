import { expect } from '@playwright/test'
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

  async openAccountMenu() {
    await this.ensureProfileCached()
    const settingsItem = this.page.getByRole('menuitem', {
      name: /settings|cài đặt/i,
    })
    const toggle = this.accountMenuButton()
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await toggle.click()
      if (await settingsItem.isVisible()) return
      await this.page.waitForTimeout(250)
    }
    await expect(settingsItem).toBeVisible()
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

  async gotoSocial() {
    await this.ensureProfileCached()
  }

  async openOwnProfileFromHeader() {
    await this.ensureProfileCached()
    const avatar = this.profileAvatarButton()
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await avatar.click()
      if (this.page.url().includes('/u/')) return
      await this.page.waitForTimeout(300)
    }
    await expect(this.page).toHaveURL(/\/u\//)
  }
}
