import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testsDir = path.dirname(fileURLToPath(import.meta.url))

/** Absolute path to Playwright storage state (shared by setup + chromium project). */
export const authStoragePath = path.join(
  testsDir,
  '../../playwright/.auth/user.json',
)
