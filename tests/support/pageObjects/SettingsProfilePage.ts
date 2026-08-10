import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { clickUntilReady } from '../helpers/retry'
import { BasePage } from './BasePage'

export class SettingsProfilePage extends BasePage {
  async goto() {
    await this.ensureProfileCached()
    await this.page.goto(localePath('/settings/profile'), {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.editButton()).toBeVisible()
    await expect(this.firstName()).toHaveValue(/.+/, { timeout: 15_000 })
  }

  heading() {
    return this.page.getByRole('heading', {
      name: /personal profile|hồ sơ cá nhân/i,
    })
  }

  editButton() {
    return this.page.getByRole('button', { name: /^(edit|chỉnh sửa)$/i })
  }

  cancelButton() {
    return this.page.getByRole('button', { name: /cancel|hủy/i })
  }

  saveButton() {
    return this.page.getByRole('button', {
      name: /save changes|lưu thay đổi/i,
    })
  }

  firstName() {
    return this.page.locator('#settings-firstName')
  }

  lastName() {
    return this.page.locator('#settings-lastName')
  }

  dateOfBirth() {
    return this.page.locator('#settings-dateOfBirth')
  }

  location() {
    return this.page.locator('#settings-location')
  }

  occupation() {
    return this.page.locator('#settings-occupation')
  }

  urlKey() {
    return this.page.locator('#settings-url-key')
  }

  backLink() {
    return this.page.getByRole('link', { name: /←?\s*back|quay lại/i })
  }

  async expectLoaded() {
    await expect(this.heading()).toBeVisible()
    await expect(this.editButton()).toBeVisible()
  }

  async startEditing() {
    const save = this.saveButton()
    await clickUntilReady(this.editButton(), () => save.isVisible())
    await expect(this.firstName()).toBeEditable()
    await expect(this.location()).toBeVisible()
    await expect(save).toBeVisible()
  }

  async searchLocation(query: string) {
    await this.location().click()
    await this.location().fill(query)
    const listbox = this.page.locator('#settings-location-listbox')
    await expect(listbox).toBeVisible({ timeout: 15_000 })
    return listbox
  }
}
