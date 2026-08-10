import type { Locator } from '@playwright/test'

type RetryOptions = {
  attempts?: number
  delayMs?: number
}

/** Repeat an action until `done()` returns true or attempts are exhausted. */
export async function retryUntil(
  done: () => Promise<boolean>,
  { attempts = 5, delayMs = 250 }: RetryOptions = {},
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await done()) return true
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return false
}

/** Click a locator until `isReady()` becomes true. */
export async function clickUntilReady(
  trigger: Locator,
  isReady: () => Promise<boolean>,
  options?: RetryOptions,
): Promise<boolean> {
  const ok = await retryUntil(async () => {
    if (!(await trigger.isVisible())) return false
    await trigger.click({ timeout: 3_000 })
    return isReady()
  }, options)
  if (!ok) await isReady()
  return ok || (await isReady())
}
