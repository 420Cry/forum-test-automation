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
    // Prefer desktop left-rail; fall back to mobile bottom bar when rail is hidden.
    const main = this.page.getByRole('navigation', {
      name: /main|chính/i,
    })
    const mobile = this.page.getByRole('navigation', {
      name: /mobile|di động/i,
    })
    return main.or(mobile)
  }

  navLink(name: RegExp) {
    return this.nav().getByRole('link', { name })
  }

  /**
   * The feed area always renders exactly one of these two, independent of
   * whether posts have loaded yet: the reader-mode banner (personal `user`
   * accounts, which can't post) or the composer card (startup/investor).
   */
  socialFeedShell() {
    const readerModeBanner = this.page.getByText(
      /you're browsing in reader mode|bạn đang ở chế độ người đọc/i,
    )
    const composerCard = this.page.getByRole('button', {
      name: /^(?:photo|ảnh)$/i,
    })
    return readerModeBanner.or(composerCard)
  }

  async goToSettingsViaNav() {
    await clickUntilReady(this.navLink(/settings|cài đặt/i), async () =>
      /\/settings/.test(this.page.url()),
    )
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
    await expect(this.page.getByRole('link', { name: /^(?:messages|tin nhắn)$/i })).toBeVisible()
    await expect(this.navLink(/^(?:social|mạng xã hội)$/i)).toBeVisible()
    await expect(this.navLink(/find|tìm/i)).toBeVisible()
    await expect(this.navLink(/following|đang theo dõi/i)).toBeVisible()
    await expect(this.navLink(/settings|cài đặt/i)).toBeVisible()
  }

  async goto() {
    await this.ensureProfileCached()
  }

  async expectSocialLoaded() {
    await expect(this.navLink(/^(?:social|mạng xã hội)$/i)).toBeVisible()
    await expect(this.socialFeedShell()).toBeVisible()
  }

  async waitForAccountReady(timeout = 20_000) {
    await expect(this.profileAvatarButton()).toBeVisible({ timeout })
    await expect(this.profileAvatarButton()).not.toHaveAttribute(
      'aria-busy',
      'true',
      { timeout },
    )
  }

  async openOwnProfileFromHeader() {
    await this.ensureProfileCached()
    await this.waitForAccountReady()
    const profileResponse = this.page.waitForResponse(
      (response) =>
        /\/profiles\/user\//.test(response.url())
        && response.request().method() === 'GET'
        && response.ok(),
      { timeout: 20_000 },
    )
    await clickUntilReady(this.profileAvatarButton(), async () =>
      this.page.url().includes('/u/'),
    )
    await expect(this.page).toHaveURL(/\/u\//)
    await profileResponse
  }
}
