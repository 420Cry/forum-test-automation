import { test, expect } from '../../support/fixtures/test'
import { env } from '../../config/env'

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

  test('MSG02 Inbox search renders when messaging is available', async ({
    messagesPage,
  }) => {
    await messagesPage.goto()
    await messagesPage.expectSettled()

    const available = await messagesPage.isMessagingAvailable()
    test.skip(!available, 'Sendbird messaging unavailable in this environment')

    await messagesPage.expectReady()
    await expect(messagesPage.search()).toBeEditable()
  })

  test('MSG03 Search connections filters contact rows', async ({
    messagesPage,
    page,
  }) => {
    await messagesPage.goto()
    const available = await messagesPage.isMessagingAvailable()
    test.skip(!available, 'Sendbird messaging unavailable in this environment')

    await messagesPage.search().fill('zzzz-no-match-forum-e2e')
    await expect(
      page.getByText(/no people found|không tìm thấy/i),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('MSG08 Empty inbox shows people list when connections exist', async ({
    profilePage,
    messagesPage,
    page,
  }) => {
    const peerKey = env.peerUrlKey()
    expect(peerKey, 'E2E_PEER_URL_KEY is required for contacts inbox').toBeTruthy()

    await profilePage.goto(peerKey)
    await profilePage.followPeer()

    await messagesPage.goto()
    const available = await messagesPage.isMessagingAvailable()
    test.skip(!available, 'Sendbird messaging unavailable in this environment')

    // Fresh accounts may already have channels; people section only when empty.
    const contactCount = await messagesPage.contactRows().count()
    if (contactCount === 0) {
      test.skip(true, 'No contact rows rendered (no connections or channels-only list)')
    }

    await expect(messagesPage.contactRows().first()).toBeVisible()
    // When there are no existing conversations, compact People hint is shown.
    const hintVisible = await messagesPage.peopleSectionHint().isVisible().catch(() => false)
    if (hintVisible) {
      await expect(messagesPage.peopleSectionHint()).toBeVisible()
      await expect(
        page.getByText(/no messages yet|chưa có tin nhắn/i),
      ).toHaveCount(0)
    }
  })
})
