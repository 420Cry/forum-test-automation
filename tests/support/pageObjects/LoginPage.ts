import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/auth/login'), {
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
    return this.page.getByRole('button', { name: /sign in|đăng nhập/i })
  }

  async login(email: string, password: string) {
    await this.goto()
    await this.expectLoaded()
    await this.email().fill(email)
    await this.password().fill(password)
    await this.submit().click()
  }

  credentialsError() {
    return this.page.getByText(
      /incorrect email or password|email hoặc mật khẩu không đúng/i,
    )
  }

  createAccountLink() {
    return this.page.getByRole('link', {
      name: /create account|tạo tài khoản/i,
    })
  }

  forgotPasswordLink() {
    return this.page.getByRole('link', {
      name: /forgot password|quên mật khẩu/i,
    })
  }

  async expectLoaded() {
    await this.assertAppReachable()
    await expect(
      this.page.getByRole('heading', { name: /sign in|đăng nhập/i }),
    ).toBeVisible()
    await expect(this.email()).toBeVisible()
    await expect(this.forgotPasswordLink()).toBeVisible()
    await expect(this.createAccountLink()).toBeVisible()
  }
}
