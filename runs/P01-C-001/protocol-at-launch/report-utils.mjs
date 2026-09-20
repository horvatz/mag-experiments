import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

export function collectSpecs(suites) {
  return suites.flatMap((suite) => [...(suite.specs || []), ...collectSpecs(suite.suites || [])])
}

export function sourceHashes(root) {
  const paths = ['baseline.json', 'package-lock.json', 'playwright.config.ts', 'tasks', 'evaluation', 'reference', 'support', 'scripts', 'vendor']
  const hashes = {}
  function add(file) {
    hashes[relative(root, file)] = createHash('sha256').update(readFileSync(file)).digest('hex')
  }
  function walk(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const file = resolve(folder, entry.name)
      if (entry.isDirectory()) walk(file)
      else add(file)
    }
  }
  for (const item of paths) {
    const target = resolve(root, item)
    if (item.includes('.')) add(target)
    else walk(target)
  }
  return Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)))
}
