import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class ProfilePage extends BasePage {
  async goto(urlKeyOrPath: string) {
    const path = urlKeyOrPath.startsWith('/u/')
      ? urlKeyOrPath
      : `/u/${urlKeyOrPath}`
    await this.page.goto(localePath(path))
  }

  ownPreviewBanner() {
    return this.page.getByText(/public profile|hồ sơ công khai/i)
  }

  editProfileButton() {
    return this.page.getByRole('link', {
      name: /edit profile|chỉnh sửa hồ sơ/i,
    })
  }

  followButton() {
    return this.page.getByRole('button', { name: /\+?\s*follow|theo dõi/i })
  }

  async expectOwnProfile() {
    await expect(this.ownPreviewBanner()).toBeVisible()
    await expect(this.editProfileButton()).toBeVisible()
    await expect(this.followButton()).toHaveCount(0)
  }

  async expectOtherProfile() {
    await expect(this.ownPreviewBanner()).toHaveCount(0)
  }
}
