import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class RegisterPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/auth/register'), {
      waitUntil: 'domcontentloaded',
    })
  }

  email() {
    return this.page.locator('#email')
  }

  password() {
    return this.page.locator('#password')
  }

  submit() {
    return this.page.getByRole('button', {
      name: /create account|tạo tài khoản/i,
    })
  }

  signInLink() {
    return this.page.getByRole('link', { name: /sign in|đăng nhập/i })
  }

  async expectLoaded() {
    await this.assertAppReachable()
    await expect(
      this.page.getByRole('heading', {
        name: /create account|tạo tài khoản/i,
      }),
    ).toBeVisible()
    await expect(this.email()).toBeVisible()
    await expect(this.password()).toBeVisible()
    await expect(this.submit()).toBeVisible()
  }
}

export class ForgotPasswordPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/auth/forgot-password'), {
      waitUntil: 'domcontentloaded',
    })
  }

  email() {
    return this.page.locator('#email')
  }

  submit() {
    return this.page.getByRole('button', {
      name: /send reset link|gửi liên kết/i,
    })
  }

  async expectLoaded() {
    await this.assertAppReachable()
    await expect(
      this.page.getByRole('heading', {
        name: /reset password|đặt lại mật khẩu/i,
      }),
    ).toBeVisible()
    await expect(this.email()).toBeVisible()
    await expect(this.submit()).toBeVisible()
  }
}
