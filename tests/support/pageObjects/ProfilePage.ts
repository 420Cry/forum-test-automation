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
    // Wait until follow status has loaded (button disabled while !ready).
    await expect(follow).toBeEnabled({ timeout: 15_000 })
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

  /** Ensure we are not following this peer (needed for DM gate assertions). */
  async unfollowPeer() {
    const follow = this.followButton()
    await expect(follow).toBeVisible()
    await expect(follow).toBeEnabled({ timeout: 15_000 })
    const label = (await follow.textContent())?.trim() ?? ''
    // Idle CTA is "+ Follow" / "Theo dõi" — already not following.
    if (/follow|theo dõi/i.test(label) && !/following|đang theo dõi/i.test(label)) {
      return
    }

    const ok = await retryUntil(async () => {
      const unfollowRequest = this.page.waitForResponse(
        (response) =>
          response.url().includes('/follows')
          && response.request().method() === 'DELETE'
          && response.ok(),
        { timeout: 15_000 },
      )
      await follow.click()
      await unfollowRequest.catch(() => undefined)
      const nextLabel = (await follow.textContent())?.trim() ?? ''
      return /follow|theo dõi/i.test(nextLabel)
        && !/following|đang theo dõi/i.test(nextLabel)
    })

    if (!ok) {
      await expect(follow).toHaveText(/follow|theo dõi/i)
      await expect(follow).not.toHaveText(/following|đang theo dõi/i)
    }
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
    // Exact CTA labels only — do not match header stats like "3 following".
    return this.page.getByRole('button', {
      name: /^(?:\+ ?)?(?:follow|following|unfollow|sign in to follow|theo dõi|đang theo dõi|đăng nhập để theo dõi)$/i,
    })
  }

  async expectOwnProfile() {
    await expect(this.editProfileButton()).toBeVisible()
    await expect(this.followButton()).toHaveCount(0)
    await this.expectUserFollowStats()
  }

  async expectOtherProfile() {
    await expect(this.editProfileButton()).toHaveCount(0)
    await expect(this.followButton()).toBeVisible()
    await this.expectUserFollowStats()
  }

  async expectUserFollowStats() {
    await expect(
      this.page.getByRole('button', {
        name: /\d+\s*(followers|người theo dõi)/i,
      }),
    ).toBeVisible()
    await expect(
      this.page.getByRole('button', {
        name: /\d+\s*(following|đang theo dõi)/i,
      }),
    ).toBeVisible()
  }

  followersStatButton() {
    return this.page.getByRole('button', {
      name: /\d+\s*(followers|người theo dõi)/i,
    })
  }

  followingStatButton() {
    return this.page.getByRole('button', {
      name: /\d+\s*(following|đang theo dõi)/i,
    })
  }

  async followingCount(): Promise<number> {
    const text = (await this.followingStatButton().textContent()) ?? ''
    const match = text.match(/(\d+)/)
    return match ? Number(match[1]) : NaN
  }

  async openFollowersSheet() {
    await this.followersStatButton().click()
    await expect(
      this.page.getByRole('dialog', {
        name: /followers|người theo dõi/i,
      }),
    ).toBeVisible()
  }

  async openFollowingSheet() {
    await this.followingStatButton().click()
    await expect(
      this.page.getByRole('dialog', {
        name: /following|đang theo dõi/i,
      }),
    ).toBeVisible()
  }

  async closeFollowSheet() {
    const dialog = this.page.getByRole('dialog').first()
    await dialog.getByRole('button', { name: /dismiss|đóng/i }).click()
    await expect(dialog).toHaveCount(0)
  }
}
