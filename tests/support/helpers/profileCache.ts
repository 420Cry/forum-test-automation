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
    && (await profileButton(page).isVisible().catch(() => false))
  ) {
    await assertSocialShell(page)
    return
  }

  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const meResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/me')
        && response.request().method() === 'GET'
        && response.ok(),
      { timeout: 25_000 },
    )

    try {
      await page.goto(localePath('/social'), {
        waitUntil: 'domcontentloaded',
        timeout: 45_000,
      })

      const response = await meResponse
      const me = (await response.json()) as { profile?: { onboarded?: boolean } }
      if (!me.profile?.onboarded) {
        throw new Error(
          'E2E user is not onboarded. Re-run auth setup and forum db:migrate.',
        )
      }

      await assertSocialShell(page)
      return
    }
    catch (error) {
      lastError = error
      if (error instanceof Error && error.message.includes('not onboarded')) {
        throw error
      }

      const onSocial = /\/social/.test(page.url())
      const onOnboard = /\/onboard/.test(page.url())
      if (onSocial && !onOnboard) {
        try {
          await assertSocialShell(page)
          return
        }
        catch {
          // Retry from a cold navigation.
        }
      }

      if (attempt < 2) {
        await page.waitForTimeout(750)
      }
    }
  }

  throw lastError
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
