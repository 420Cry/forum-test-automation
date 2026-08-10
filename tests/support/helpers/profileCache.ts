import { expect, type Page } from '@playwright/test'
import { localePath } from '../../config/env'

const profileButton = (page: Page) =>
  page.getByRole('button', {
    name: /view your profile|xem hồ sơ của bạn/i,
  })

async function assertSocialShell(page: Page) {
  await expect(page.getByRole('heading', { name: /social/i })).toBeVisible({
    timeout: 15_000,
  })
  await expect(profileButton(page)).toBeVisible()
}

/** Warm `/auth/me` on social — required before other protected routes. */
export async function ensureProfileCached(page: Page) {
  if (
    page.url().includes('/social')
    && (await profileButton(page).isVisible())
  ) {
    await assertSocialShell(page)
    return
  }

  const meResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/me')
      && response.request().method() === 'GET'
      && response.ok(),
    { timeout: 20_000 },
  )

  await page.goto(localePath('/social'), { waitUntil: 'domcontentloaded' })

  try {
    const response = await meResponse
    const me = (await response.json()) as { profile?: { onboarded?: boolean } }
    if (!me.profile?.onboarded) {
      throw new Error(
        'E2E user is not onboarded. Re-run auth setup and forum db:migrate.',
      )
    }
  }
  catch (error) {
    if (error instanceof Error && error.message.includes('not onboarded')) {
      throw error
    }
    await expect(page).toHaveURL(/\/social/, { timeout: 15_000 })
    await expect(page).not.toHaveURL(/\/onboard/)
  }

  await assertSocialShell(page)
}

/** Client-side nav keeps the warmed profile cache in the SPA. */
export async function openFindViaNav(page: Page) {
  await ensureProfileCached(page)
  await page
    .getByRole('navigation')
    .getByRole('link', { name: /find|tìm/i })
    .click()
  await expect(page).toHaveURL(/\/find/, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: /directory|danh bạ/i }),
  ).toBeVisible({ timeout: 15_000 })
}
