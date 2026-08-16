import { test, expect } from '../../support/fixtures/test'

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
})
