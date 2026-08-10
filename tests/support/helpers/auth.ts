import { type Page, expect } from '@playwright/test'
import { env } from '../../config/env'
import { LoginPage } from '../pageObjects/LoginPage'

/** Sign in and wait until we leave guest auth routes. */
export async function authenticate(
  page: Page,
  email: string,
  password: string,
) {
  const login = new LoginPage(page)
  await login.login(email, password)
  await expect(page).not.toHaveURL(/\/auth\/login/)
  await expect(page).toHaveURL(
    new RegExp(`/${env.locale}/(social|onboard|find|following|settings|u/)`),
  )
}
