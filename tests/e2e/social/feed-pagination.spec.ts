import { expect, test } from '../../support/fixtures/test'
import { env } from '../../config/env'
import { signIn } from '../../support/helpers/e2eApi'
import { seedPosts } from '../../support/helpers/e2ePosts'

const FEED_PAGE_SIZE = 5

test.describe('Social feed pagination', () => {
  test('SOC02 Feed loads more posts on scroll', async ({ page, socialPage }) => {
    const token = await signIn(env.email(), env.password())
    expect(token, 'expected a Supabase access token for the e2e user').toBeTruthy()
    await seedPosts(token as string, FEED_PAGE_SIZE + 3)

    await socialPage.goto()

    const articles = page.getByRole('main').locator('article')
    await expect(articles).toHaveCount(FEED_PAGE_SIZE, { timeout: 15_000 })

    const nextPage = page.waitForResponse(
      response =>
        /\/posts\?.*cursor=/.test(response.url())
        && response.request().method() === 'GET'
        && response.ok(),
      { timeout: 15_000 },
    )
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await nextPage

    // Not an exact count: seeded posts accumulate across runs against a
    // persistent dev DB, so only the initial page size is guaranteed exact.
    await expect
      .poll(() => articles.count(), { timeout: 15_000 })
      .toBeGreaterThan(FEED_PAGE_SIZE)
  })
})
