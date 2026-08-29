import { expect, type Page } from '@playwright/test'

/** Wait until skeleton/spinner surfaces finish (aria-busy cleared). */
export async function waitForBusyCleared(page: Page, timeout = 20_000) {
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout })
}
