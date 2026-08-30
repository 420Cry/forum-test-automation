import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class CookieBannerPage extends BasePage {
  region() {
    return this.page.getByRole('region', {
      name: /cookie consent|đồng ý cookie/i,
    })
  }

  acceptAll() {
    return this.region().getByRole('button', {
      name: /accept all cookies|chấp nhận tất cả cookie/i,
    })
  }

  rejectAll() {
    return this.region().getByRole('button', {
      name: /reject all optional cookies|từ chối cookie tùy chọn/i,
    })
  }

  settings() {
    return this.region().getByRole('button', {
      name: /cookie configuration|cấu hình cookie/i,
    })
  }

  policyLink() {
    return this.region().getByRole('link', {
      name: /cookie policy|chính sách cookie/i,
    })
  }

  preferencesDialog() {
    return this.page.getByRole('dialog', {
      name: /cookie preferences|tùy chọn cookie/i,
    })
  }

  async expectVisible() {
    await this.assertAppReachable()
    await expect(this.region()).toBeVisible()
    await expect(this.acceptAll()).toBeVisible()
    await expect(this.settings()).toBeVisible()
    await expect(this.rejectAll()).toBeVisible()
    await expect(this.policyLink()).toBeVisible()
  }

  async expectHidden() {
    await expect(this.region()).toHaveCount(0)
  }

  async gotoPolicy() {
    await this.page.goto(localePath('/legal/cookies'), {
      waitUntil: 'domcontentloaded',
    })
    await this.assertAppReachable()
  }
}
