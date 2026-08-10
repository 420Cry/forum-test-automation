import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  async goto() {
    await this.page.goto(localePath('/auth/login'), {
      waitUntil: 'domcontentloaded',
    })
    await this.waitForInputHydration(this.email())
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
    await this.fillStable(this.email(), email)
    await this.fillStable(this.password(), password)
    await this.submitLogin()

    if (
      this.page.url().includes('/auth/login')
      && !(await this.credentialsError().isVisible())
    ) {
      await this.fillStable(this.email(), email)
      await this.fillStable(this.password(), password)
      await this.submitLogin()
    }
  }

  private async submitLogin() {
    if (!this.page.url().includes('/auth/login')) return

    await this.submit().click()
    await this.page
      .waitForURL((url) => !url.pathname.includes('/auth/login'), {
        timeout: 15_000,
      })
      .catch(() => undefined)
  }

  private async fillStable(
    locator: ReturnType<LoginPage['email']>,
    value: string,
  ) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await locator.fill(value)
      if ((await locator.inputValue()) === value) return
      await this.page.waitForTimeout(300)
    }
    await expect(locator).toHaveValue(value)
  }

  credentialsError() {
    return this.page.getByRole('alert').filter({
      hasText: /incorrect email or password|email hoặc mật khẩu không đúng/i,
    })
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
