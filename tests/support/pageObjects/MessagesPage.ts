import { type Locator, expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { chatText } from '../locators/chatText'
import { BasePage } from './BasePage'

/** Messages inbox + thread (`/messages`) — prefers role / aria / ids over FE testids. */
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

  contactRows() {
    return this.page.getByTestId('messages-contact-row')
  }

  peopleSectionHint() {
    return this.page.getByText(chatText.peopleHint)
  }

  notConnectedToast() {
    return this.page.getByRole('alert').filter({ hasText: chatText.notConnected })
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

  composer() {
    return this.page.locator('#chat-composer')
  }

  sendButton() {
    return this.page.getByRole('button', { name: chatText.sendButton })
  }

  reactionPicker() {
    return this.page.getByTestId('chat-reaction-picker')
  }

  deliveryStatus() {
    return this.page.getByLabel(chatText.status.any)
  }

  profileMessageButton() {
    return this.page.getByRole('button', { name: chatText.messageCta })
  }

  /**
   * Bubble rows (`.group/msg`) carrying `text`. Scoped to the thread on
   * purpose: the channel-list preview repeats the last message verbatim.
   */
  messageRows(text: string): Locator {
    return this.page
      .locator('.group\\/msg')
      .filter({ has: this.page.getByText(text, { exact: true }) })
  }

  messageRow(text: string): Locator {
    return this.messageRows(text).last()
  }

  async goto(query?: { channelUrl?: string, userId?: string }) {
    await this.ensureProfileCached()
    const params = new URLSearchParams()
    if (query?.channelUrl) params.set('channelUrl', query.channelUrl)
    if (query?.userId) params.set('userId', query.userId)
    const qs = params.toString()
    await this.page.goto(localePath(`/messages${qs ? `?${qs}` : ''}`))
    await this.assertAppReachable()
  }

  async openFromHeader() {
    await this.ensureProfileCached()
    await this.headerMessagesLink().click()
    await this.expectOnInbox()
    await this.assertAppReachable()
  }

  /** URL-only check — safe to race inside a retry loop. */
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

  async expectThreadOpen() {
    await expect(this.page).toHaveURL(/channelUrl=/)
    await expect(this.composer()).toBeVisible({ timeout: 20_000 })
  }

  async sendMessage(text: string) {
    await expect(this.composer()).toBeEnabled()
    await this.fillStable(this.composer(), text)
    await this.sendButton().click()

    // Poll one settled row: a wiped pending bubble makes pending-count 0 look
    // like success, so require the bubble AND a non-pending delivery label.
    await expect(async () => {
      const row = this.messageRow(text)
      await expect(row).toBeVisible({ timeout: 3_000 })
      await row.scrollIntoViewIfNeeded()
      await expect(row.getByLabel(chatText.status.pending)).toHaveCount(0, {
        timeout: 2_000,
      })
      await expect(row.getByLabel(chatText.status.settled)).toBeVisible({
        timeout: 3_000,
      })
    }).toPass({ timeout: 30_000, intervals: [500, 1_000] })
  }

  reactionChip(text: string, emoji: string): Locator {
    return this.messageRow(text)
      .getByTestId('chat-reaction-chip')
      .filter({ hasText: emoji })
  }

  /**
   * Open the desktop picker and react with `emoji`.
   *
   * Opening and picking are one retryable unit on purpose: the picker closes on
   * any thread scroll (receipts, incoming messages), so a picker opened in a
   * previous step may be gone by the time the emoji is clicked. Per-action
   * timeouts stay short so a stale handle fails fast and the loop starts over.
   */
  async reactWith(text: string, emoji: string) {
    const option = this.reactionPicker().getByRole('option', {
      name: new RegExp(`React with\\s*${emoji}|${emoji}`),
    })
    await expect(async () => {
      // Already applied by an earlier attempt — retrying would toggle it off.
      if (await this.reactionChip(text, emoji).isVisible().catch(() => false)) {
        return
      }
      const row = this.messageRow(text)
      await row.hover({ force: true, timeout: 3_000 })
      const trigger = row.getByTestId('chat-reaction-trigger')
      await expect(trigger).toBeEnabled({ timeout: 3_000 })
      await trigger.click({ force: true, timeout: 3_000 })
      await option.click({ timeout: 3_000 })
      await expect(this.reactionChip(text, emoji)).toBeVisible({
        timeout: 5_000,
      })
    }).toPass({ timeout: 40_000, intervals: [500, 1_000] })
  }

  async expectReactionOnMessage(text: string, emoji: string) {
    await expect(this.reactionChip(text, emoji)).toBeVisible({
      timeout: 15_000,
    })
  }
}
