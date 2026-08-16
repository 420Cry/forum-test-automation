import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { chatText } from '../locators/chatText'
import { BasePage } from './BasePage'

/** Messages inbox (`/messages`) — prefers role / aria / ids over FE testids. */
export class MessagesPage extends BasePage {
  headerMessagesLink() {
    return this.page.getByRole('link', { name: chatText.messagesLink })
  }

  search() {
    return this.page.locator('#messages-search')
  }

  channelList() {
    return this.search().locator('xpath=ancestor::aside[1]')
  }

  heading() {
    return this.page.getByRole('heading', { name: chatText.heading })
  }

  unavailableCopy() {
    return this.page.getByText(chatText.unavailable)
  }

  sessionErrorCopy() {
    return this.page.getByText(chatText.sessionError)
  }

  async goto() {
    await this.ensureProfileCached()
    await this.page.goto(localePath('/messages'))
    await this.assertAppReachable()
  }

  async openFromHeader() {
    await this.ensureProfileCached()
    await this.headerMessagesLink().click()
    await this.expectOnInbox()
    await this.assertAppReachable()
  }

  async expectOnInbox(timeout = 10_000) {
    await expect(this.page).toHaveURL(/\/messages/, { timeout })
  }

  /** True when Sendbird session is ready (not unavailable / session error). */
  async isMessagingAvailable(): Promise<boolean> {
    await this.expectSettled()
    if (await this.unavailableCopy().isVisible().catch(() => false)) return false
    if (await this.sessionErrorCopy().isVisible().catch(() => false)) return false
    return this.search().isVisible().catch(() => false)
  }

  /** Wait until loading finishes and a terminal inbox surface is shown. */
  async expectSettled() {
    await this.expectOnInbox()
    await expect
      .poll(
        async () => {
          if (await this.search().isVisible().catch(() => false)) return 'ready'
          if (await this.unavailableCopy().isVisible().catch(() => false)) {
            return 'unavailable'
          }
          if (await this.sessionErrorCopy().isVisible().catch(() => false)) {
            return 'error'
          }
          return 'loading'
        },
        { timeout: 30_000 },
      )
      .not.toBe('loading')
  }

  async expectReady() {
    await this.expectSettled()
    await expect(this.search()).toBeVisible()
    await expect(this.channelList()).toBeVisible()
  }
}
