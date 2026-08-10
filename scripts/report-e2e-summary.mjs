#!/usr/bin/env node
/**
 * Print a GitHub Actions job summary from playwright-report/results.json.
 * Usage: node scripts/report-e2e-summary.mjs [path/to/results.json]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const resultsPath = process.argv[2]
  ?? path.join(root, '..', 'playwright-report', 'results.json')

if (!fs.existsSync(resultsPath)) {
  console.log('## E2E coverage\n\n_No Playwright results file found._')
  process.exit(0)
}

const report = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
const stats = report.stats ?? {}
const suites = report.suites ?? []

/** @type {{ id: string, title: string, ok: boolean }[]} */
const cases = []

function walkSuite(suite, prefix = '') {
  const title = prefix ? `${prefix} › ${suite.title}` : suite.title
  for (const spec of suite.specs ?? []) {
    const id = spec.title.match(/^[A-Z]+\d+/)?.[0] ?? spec.title
    const ok = (spec.tests ?? []).every(
      (t) => (t.results ?? []).every((r) => r.status === 'passed' || r.status === 'skipped'),
    )
    cases.push({ id, title: `${title} › ${spec.title}`, ok })
  }
  for (const child of suite.suites ?? []) {
    walkSuite(child, title)
  }
}

for (const suite of suites) walkSuite(suite)

const passed = cases.filter((c) => c.ok).length
const total = cases.length
const pct = total ? Math.round((passed / total) * 100) : 0

console.log('## E2E test coverage (forum-test-automation)')
console.log()
console.log(
  `**${passed}/${total}** scenarios passed (**${pct}%**) `
  + `— duration ${Math.round((stats.duration ?? 0) / 1000)}s`,
)
console.log()
console.log('| ID / scenario | Status |')
console.log('| --- | --- |')
for (const c of cases) {
  console.log(`| ${c.title.replace(/\|/g, '\\|')} | ${c.ok ? 'pass' : 'fail'} |`)
}
