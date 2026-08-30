import { test as base } from '@playwright/test'
import { withResourceLock } from '../helpers/resourceLock'
import { AppShellPage } from '../pageObjects/AppShellPage'
import { ForgotPasswordPage, RegisterPage } from '../pageObjects/AuthPages'
import { CookieBannerPage } from '../pageObjects/CookieBannerPage'
import { FindPage } from '../pageObjects/FindPage'
import { FollowingPage } from '../pageObjects/FollowingPage'
import { LoginPage } from '../pageObjects/LoginPage'
import { MessagesPage } from '../pageObjects/MessagesPage'
import { ProfilePage } from '../pageObjects/ProfilePage'
import { SettingsHubPage } from '../pageObjects/SettingsHubPage'
import { SettingsProfilePage } from '../pageObjects/SettingsProfilePage'

type Pages = {
  loginPage: LoginPage
  registerPage: RegisterPage
  forgotPasswordPage: ForgotPasswordPage
  cookieBannerPage: CookieBannerPage
  findPage: FindPage
  profilePage: ProfilePage
  followingPage: FollowingPage
  messagesPage: MessagesPage
  socialPage: AppShellPage
  settingsHubPage: SettingsHubPage
  settingsProfilePage: SettingsProfilePage
  appShellPage: AppShellPage
}

type Locks = {
  /**
   * Declare in any test that follows/unfollows the seeded peer, or asserts on
   * that edge. The whole suite shares two accounts, so without this the
   * follow state is mutated underneath tests running in the other worker.
   */
  peerFollowLock: void
}

export const test = base.extend<Pages & Locks>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  cookieBannerPage: async ({ page }, use) => {
    await use(new CookieBannerPage(page))
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
  messagesPage: async ({ page }, use) => {
    await use(new MessagesPage(page))
  },
  socialPage: async ({ page }, use) => {
    await use(new AppShellPage(page))
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
  // Playwright reads the destructured pattern to resolve dependencies; this
  // fixture needs none, and an empty pattern is the documented way to say so.
  // eslint-disable-next-line no-empty-pattern
  peerFollowLock: async ({}, use) => {
    await withResourceLock('peer-follow', async () => {
      await use()
    })
  },
})

export { expect } from '@playwright/test'
