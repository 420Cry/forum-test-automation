import { expect } from '@playwright/test'
import { localePath } from '../../config/env'
import { BasePage } from './BasePage'

/** Messages inbox + thread (`/messages`) — prefers role / aria / ids over FE testids. */
export class MessagesPage extends BasePage {
  headerMessagesLink() {
    return this.page.getByRole('link', { name: /^(?:messages|tin nhắn)$/i })
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
    return this.page.getByText(
      /message someone you follow|nhắn tin với người bạn theo dõi/i,
    )
  }

  notConnectedToast() {
    return this.page.getByText(
      /follow each other first|hãy theo dõi nhau trước/i,
    )
  }

  heading() {
    return this.page.getByRole('heading', {
      name: /messages|tin nhắn/i,
    })
  }

  unavailableCopy() {
    return this.page.getByText(
      /messaging is not available|tin nhắn chưa sẵn sàng/i,
    )
  }

  sessionErrorCopy() {
    return this.page.getByText(
      /could not open messages|không mở được tin nhắn/i,
    )
  }

  composer() {
    return this.page.locator('#chat-composer')
  }

  sendButton() {
    return this.page.getByRole('button', {
      name: /send message|gửi tin nhắn/i,
    })
  }

  reactionTrigger() {
    return this.page.getByRole('button', {
      name: /add reaction|thêm cảm xúc/i,
    })
  }

  reactionPicker() {
    return this.page.getByRole('listbox', {
      name: /choose a reaction|chọn cảm xúc/i,
    })
  }

  deliveryStatus() {
    return this.page.getByLabel(
      /^(?:sending|failed to send|sent|delivered|seen|đang gửi|gửi thất bại|đã gửi|đã nhận|đã xem)$/i,
    )
  }

  profileMessageButton() {
    return this.page.getByRole('button', {
      name: /^(?:message|nhắn tin|sign in to message|đăng nhập để nhắn tin)$/i,
    })
  }

  async goto(query?: { channelUrl?: string, userId?: string }) {
    await this.ensureProfileCached()
    const params = new URLSearchParams()
    if (query?.channelUrl) params.set('channelUrl', query.channelUrl)
    if (query?.userId) params.set('userId', query.userId)
    const qs = params.toString()
    await this.page.goto(
      localePath(`/messages${qs ? `?${qs}` : ''}`),
    )
    await this.assertAppReachable()
  }

  async openFromHeader() {
    await this.ensureProfileCached()
    await this.headerMessagesLink().click()
    await expect(this.page).toHaveURL(/\/messages/)
    await this.assertAppReachable()
  }

  /** True when Sendbird session is ready (not unavailable / session error). */
  async isMessagingAvailable(): Promise<boolean> {
    await this.expectSettled()
    if (await this.unavailableCopy().isVisible().catch(() => false)) {
      return false
    }
    if (await this.sessionErrorCopy().isVisible().catch(() => false)) {
      return false
    }
    return this.search().isVisible().catch(() => false)
  }

  /** Wait until loading finishes and a terminal inbox surface is shown. */
  async expectSettled() {
    await expect(this.page).toHaveURL(/\/messages/)
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
    await expect(this.page.getByText(text, { exact: true }).last()).toBeVisible({
      timeout: 20_000,
    })
  }

  async openReactionPickerOnLastOutgoing(text: string) {
    const bubble = this.page.getByText(text, { exact: true }).last()
    await bubble.hover()
    await this.reactionTrigger().last().click()
    await expect(this.reactionPicker()).toBeVisible()
  }

  async pickReaction(emoji: string) {
    await this.reactionPicker()
      .getByRole('option', { name: new RegExp(emoji) })
      .click()
    await expect(this.reactionPicker()).toHaveCount(0)
  }
}
