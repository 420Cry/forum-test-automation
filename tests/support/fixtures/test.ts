import { test as base } from '@playwright/test'
import { AppShellPage } from '../pageObjects/AppShellPage'
import { ForgotPasswordPage, RegisterPage } from '../pageObjects/AuthPages'
import { FindPage } from '../pageObjects/FindPage'
import { FollowingPage } from '../pageObjects/FollowingPage'
import { LoginPage } from '../pageObjects/LoginPage'
import { ProfilePage } from '../pageObjects/ProfilePage'
import { SettingsHubPage } from '../pageObjects/SettingsHubPage'
import { SettingsProfilePage } from '../pageObjects/SettingsProfilePage'
import { SocialPage } from '../pageObjects/SocialPage'

type Pages = {
  loginPage: LoginPage
  registerPage: RegisterPage
  forgotPasswordPage: ForgotPasswordPage
  findPage: FindPage
  profilePage: ProfilePage
  followingPage: FollowingPage
  socialPage: SocialPage
  settingsHubPage: SettingsHubPage
  settingsProfilePage: SettingsProfilePage
  appShellPage: AppShellPage
}

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page))
  },
  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page))
  },
  findPage: async ({ page }, use) => {
    await use(new FindPage(page))
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page))
  },
  followingPage: async ({ page }, use) => {
    await use(new FollowingPage(page))
  },
  socialPage: async ({ page }, use) => {
    await use(new SocialPage(page))
  },
  settingsHubPage: async ({ page }, use) => {
    await use(new SettingsHubPage(page))
  },
  settingsProfilePage: async ({ page }, use) => {
    await use(new SettingsProfilePage(page))
  },
  appShellPage: async ({ page }, use) => {
    await use(new AppShellPage(page))
  },
})

export { expect } from '@playwright/test'
