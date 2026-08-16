import { test, expect } from '../../support/fixtures/test'

/**
 * Messages inbox shell — no Sendbird required.
 * Deep DM / send / reaction coverage stays local (needs SENDBIRD_* on forum-api).
 */
test.describe('Messages inbox', () => {
  test('MSG01 Header messages link opens inbox', async ({
    socialPage,
    messagesPage,
    appShellPage,
  }) => {
    await socialPage.goto()
    await appShellPage.expectShellLoaded()
    await expect(messagesPage.headerMessagesLink()).toBeVisible()

    await messagesPage.openFromHeader()
    await messagesPage.expectSettled()
    await expect(messagesPage.heading().first()).toBeVisible()
  })

  test('MSG02 Inbox settles to ready search or unavailable copy', async ({
    messagesPage,
  }) => {
    await messagesPage.goto()
    await messagesPage.expectSettled()

    const available = await messagesPage.isMessagingAvailable()
    if (available) {
      await messagesPage.expectReady()
      await expect(messagesPage.search()).toBeEditable()
      return
    }

    await expect(messagesPage.unavailableCopy().or(messagesPage.sessionErrorCopy()))
      .toBeVisible()
  })
})
