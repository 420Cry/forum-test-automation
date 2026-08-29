import { test, expect } from '../../support/fixtures/test'
import { localePath } from '../../config/env'

test.describe('Smoke — auth UI', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('SMK04 Register page renders email, password, and requirements', async ({
    registerPage,
    page,
  }) => {
    await registerPage.goto()
    await registerPage.expectLoaded()
    await expect(registerPage.email()).toBeEditable()
    await expect(registerPage.password()).toBeEditable()
    await expect(
      page.getByText(/password must include|mật khẩu phải/i),
    ).toBeVisible()
  })

  test('SMK05 Forgot-password page renders email field', async ({
    forgotPasswordPage,
  }) => {
    await forgotPasswordPage.goto()
    await forgotPasswordPage.expectLoaded()
    await expect(forgotPasswordPage.email()).toBeEditable()
  })

  test('SMK06 Login links navigate to register and forgot-password', async ({
    loginPage,
    page,
  }) => {
    await loginPage.goto()
    await loginPage.expectLoaded()

    await loginPage.forgotPasswordLink().click()
    await expect(page).toHaveURL(/\/auth\/forgot-password/)

    await loginPage.goto()
    await loginPage.expectLoaded()
    await loginPage.createAccountLink().click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test('SMK07 Invalid credentials show an error and stay on login', async ({
    loginPage,
    page,
  }) => {
    await loginPage.login('e2e-invalid@example.com', 'WrongPassword1!')
    await expect(loginPage.credentialsError()).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('SMK08 Auth hub redirects to login with create-account link', async ({
    page,
  }) => {
    await page.goto(localePath('/auth'), { waitUntil: 'domcontentloaded' })
    const gateway = page.getByRole('heading', {
      name: /502 Bad Gateway|503 Service|504 Gateway/i,
    })
    if ((await gateway.count()) > 0) {
      throw new Error(
        `App unreachable at ${page.url()}. Start the stack with: forum dev`,
      )
    }
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(
      page.getByRole('heading', {
        name: /welcome back|sign in|đăng nhập|chào mừng trở lại/i,
      }),
    ).toBeVisible()
    await expect(
      page
        .getByRole('link', { name: /create account|tạo tài khoản/i })
        .first(),
    ).toBeVisible()
  })
})
