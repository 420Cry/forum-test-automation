import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const LOCK_ROOT = join(tmpdir(), 'forum-e2e-locks')
/** A worker that dies without cleanup must not block the suite forever. */
const STALE_AFTER_MS = 120_000
const WAIT_TIMEOUT_MS = 120_000
const POLL_MS = 200

async function acquire(path: string): Promise<void> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS
  for (;;) {
    try {
      // `wx` fails when the file exists, which is the mutual exclusion.
      await writeFile(path, String(process.pid), { flag: 'wx' })
      return
    }
    catch {
      const heldForMs = await stat(path)
        .then(info => Date.now() - info.mtimeMs)
        .catch(() => Number.POSITIVE_INFINITY)
      if (heldForMs > STALE_AFTER_MS) {
        await rm(path, { force: true })
        continue
      }
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for e2e lock "${path}"`)
      }
      await new Promise(resolve => setTimeout(resolve, POLL_MS))
    }
  }
}

/**
 * Serialize work across Playwright workers, which are separate processes and so
 * cannot share an in-memory mutex. Use for tests that mutate shared backend
 * state (the seeded accounts are shared by the whole suite).
 */
export async function withResourceLock<T>(
  name: string,
  run: () => Promise<T>,
): Promise<T> {
  await mkdir(LOCK_ROOT, { recursive: true })
  const path = join(LOCK_ROOT, `${name}.lock`)
  await acquire(path)
  try {
    return await run()
  }
  finally {
    await rm(path, { force: true })
  }
}
