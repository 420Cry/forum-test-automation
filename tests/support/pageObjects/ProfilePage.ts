import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
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
    if (this.isFollowingLabel(label)) return

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = this.followButton()
      const currentLabel = (await current.textContent())?.trim() ?? ''
      if (this.isFollowingLabel(currentLabel)) return

      await expect(current).toBeEnabled({ timeout: 10_000 })
      const followRequest = this.page.waitForResponse(
        (response) =>
          response.url().includes('/follows')
          && response.request().method() === 'POST'
          && response.ok(),
        { timeout: 20_000 },
      )
      await current.click()
      const response = await followRequest.catch(() => null)
      if (response) {
        await expect(this.followButton()).toHaveText(
          /following|đang theo dõi|social\.action\.unfollow/i,
          { timeout: 10_000 },
        )
        return
      }

      await this.page.waitForTimeout(500)
    }

    await expect(this.followButton()).toHaveText(
      /following|đang theo dõi|social\.action\.unfollow/i,
      { timeout: 10_000 },
    )
  }

  /** Ensure we are not following this peer (needed for DM gate assertions). */
  async unfollowPeer() {
    const follow = this.followButton()
    await expect(follow).toBeVisible()
    await expect(follow).toBeEnabled({ timeout: 15_000 })
    const label = (await follow.textContent())?.trim() ?? ''
    if (this.isNotFollowingLabel(label)) return

    const unfollowRequest = this.page.waitForResponse(
      (response) =>
        response.url().includes('/follows')
        && response.request().method() === 'DELETE'
        && response.ok(),
      { timeout: 20_000 },
    )
    await follow.click()
    await unfollowRequest.catch(() => undefined)

    await expect(this.followButton()).toHaveText(
      /^(?:\+ ?)?follow|theo dõi|social\.action\.follow$/i,
      { timeout: 20_000 },
    )
    await expect(this.followButton()).not.toHaveText(
      /following|đang theo dõi|social\.action\.unfollow/i,
    )
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
    // Include raw i18n keys when locale strings are still hydrating after profile reload.
    return this.page.getByRole('button', {
      name: /^(?:\+ ?)?(?:follow|following|unfollow|sign in to follow|theo dõi|đang theo dõi|đăng nhập để theo dõi|social\.action\.(?:follow|unfollow|sign_in_to_follow))$/i,
    })
  }

  private isFollowingLabel(label: string) {
    return /following|đang theo dõi|social\.action\.unfollow/i.test(label)
  }

  private isNotFollowingLabel(label: string) {
    return /^(?:\+ ?)?follow|theo dõi|social\.action\.follow$/i.test(label)
      && !this.isFollowingLabel(label)
  }

  async expectOwnProfile() {
    await this.waitForProfileSettled()
    await expect(this.editProfileButton()).toBeVisible()
    await expect(this.followButton()).toHaveCount(0)
    await this.expectUserFollowStats({ followingInteractive: true })
  }

  async expectOtherProfile() {
    await this.waitForProfileSettled()
    await expect(this.editProfileButton()).toHaveCount(0)
    await expect(this.followButton()).toBeVisible()
    // Following list is viewable on any onboarded user's profile.
    await this.expectUserFollowStats({ followingInteractive: true })
  }

  private async waitForProfileSettled(timeout = 20_000) {
    await expect(
      this.page.locator('[aria-hidden="true"][aria-busy="true"]'),
    ).toHaveCount(0, { timeout })
  }

  async expectUserFollowStats(
    options: { followingInteractive?: boolean } = {},
  ) {
    const followingInteractive = options.followingInteractive ?? true
    await expect(this.followersStatButton()).toBeVisible()
    if (followingInteractive) {
      await expect(this.followingStatButton()).toBeVisible()
      return
    }
    await expect(this.followingStat()).toBeVisible()
    await expect(this.followingStatButton()).toHaveCount(0)
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

  /** Non-interactive following count on peer profiles (span, not a button). */
  followingStat() {
    return this.page.getByText(/\d+\s*(following|đang theo dõi)/i)
  }

  async followingCount(): Promise<number> {
    const text = (await this.followingStatButton().textContent()) ?? ''
    const match = text.match(/(\d+)/)
    return match ? Number(match[1]) : NaN
  }

  async waitForFollowingCountAtLeast(min: number, timeout = 45_000) {
    let reloads = 0
    await expect
      .poll(
        async () => {
          await this.waitForProfileSettled()
          const statCount = await this.followingCount()
          if (Number.isFinite(statCount) && statCount >= min) return statCount

          const sheetCount = await this.followingSheetRowCount().catch(() => NaN)
          if (Number.isFinite(sheetCount) && sheetCount >= min) return sheetCount

          if (reloads < 5) {
            reloads += 1
            const profileResponse = this.page.waitForResponse(
              (response) =>
                /\/profiles\/user\//.test(response.url())
                && response.request().method() === 'GET'
                && response.ok(),
              { timeout: 15_000 },
            )
            await this.page.reload({ waitUntil: 'domcontentloaded' })
            await profileResponse.catch(() => undefined)
            await this.waitForProfileSettled()
            await expect(this.editProfileButton()).toBeVisible({
              timeout: 10_000,
            })
          }

          const nextStat = await this.followingCount()
          if (Number.isFinite(nextStat) && nextStat >= min) return nextStat
          return this.followingSheetRowCount().catch(() => nextStat)
        },
        { timeout },
      )
      .toBeGreaterThanOrEqual(min)
  }

  followingSheetDialog() {
    return this.page.getByRole('dialog', {
      name: /following|đang theo dõi/i,
    })
  }

  async followingSheetRowCount(): Promise<number> {
    await this.openFollowingSheet()
    const count = await this.followingSheetDialog()
      .locator('div.shrink-0 button')
      .count()
    await this.closeFollowSheet()
    return count
  }

  async expectPeerInFollowingSheet(peerKey: string, timeout = 20_000) {
    await this.openFollowingSheet()
    await expect(
      this.followingSheetDialog().locator(`a[href*="/u/${peerKey}"]`).first(),
    ).toBeVisible({ timeout })
    await this.closeFollowSheet()
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
