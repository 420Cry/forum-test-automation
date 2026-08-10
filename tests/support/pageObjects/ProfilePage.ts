import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { retryUntil } from '../helpers/retry'
import { BasePage } from './BasePage'

export class ProfilePage extends BasePage {
  async goto(urlKeyOrPath: string) {
    await this.ensureProfileCached()
    const path = urlKeyOrPath.startsWith('/u/')
      ? urlKeyOrPath
      : `/u/${urlKeyOrPath}`
    await this.page.goto(localePath(path))
  }

  async followPeer() {
    const follow = this.followButton()
    await expect(follow).toBeVisible()
    const label = (await follow.textContent())?.trim() ?? ''
    if (/following|đang theo dõi/i.test(label)) return

    const ok = await retryUntil(async () => {
      const followRequest = this.page.waitForResponse(
        (response) =>
          response.url().includes('/follows')
          && response.request().method() === 'POST'
          && response.ok(),
        { timeout: 15_000 },
      )
      await follow.click()
      await followRequest.catch(() => undefined)
      const nextLabel = (await follow.textContent())?.trim() ?? ''
      return /following|đang theo dõi/i.test(nextLabel)
    })

    if (!ok) await expect(follow).toHaveText(/following|đang theo dõi/i)
  }

  ownPreviewBanner() {
    // Legacy banner copy was removed; keep helper for expectOtherProfile callers.
    return this.page.getByText(
      /this is your public profile|đây là hồ sơ công khai/i,
    )
  }

  editProfileButton() {
    return this.page.getByRole('link', {
      name: /edit profile|chỉnh sửa hồ sơ/i,
    })
  }

  followButton() {
    return this.page.getByRole('button', {
      name: /\+?\s*follow|theo dõi|following|đang theo dõi/i,
    })
  }

  async expectOwnProfile() {
    await expect(this.editProfileButton()).toBeVisible()
    await expect(this.followButton()).toHaveCount(0)
  }

  async expectOtherProfile() {
    await expect(this.editProfileButton()).toHaveCount(0)
    await expect(this.followButton()).toBeVisible()
  }
}
