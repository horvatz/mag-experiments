import { createHash } from 'node:crypto'
import { lstatSync, readdirSync, readFileSync, readlinkSync } from 'node:fs'
import { resolve } from 'node:path'

export const editable = (name) => ['src/', 'tests/agent/', 'docs/agent/'].some((prefix) => name.startsWith(prefix))
export const generated = (name) => ['.tmp/', '.vite/', 'dist/', 'test-results/', 'playwright-report/', 'node_modules/.vite/', 'node_modules/.vite-temp/'].some((prefix) => name.startsWith(prefix))
export const digest = (value) => createHash('sha256').update(value).digest('hex')

export function clientEnvironment(config) {
  const inherited = Object.fromEntries(['HOME', 'USER', 'LOGNAME', 'LANG', 'LC_ALL', 'TERM', 'TZ']
    .filter((key) => process.env[key] !== undefined).map((key) => [key, process.env[key]]))
  return { ...inherited, ...config['shell_environment_policy.set'] }
}

export function inventory(root) {
  const files = {}
  function walk(relative = '') {
    for (const name of readdirSync(resolve(root, relative)).sort()) {
      const path = relative ? `${relative}/${name}` : name
      if (generated(`${path}/`)) continue
      const full = resolve(root, path)
      const stat = lstatSync(full)
      if (stat.isSymbolicLink()) files[path] = { kind: 'symlink', target: readlinkSync(full) }
      else if (stat.isDirectory()) walk(path)
      else if (stat.isFile()) files[path] = { kind: 'file', sha256: digest(readFileSync(full)) }
      else throw new Error(`Unsupported filesystem entry: ${path}`)
    }
  }
  walk()
  return files
}

export function changes(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
    .filter((path) => JSON.stringify(before[path]) !== JSON.stringify(after[path]))
    .map((path) => ({ path, allowed: editable(path), kind: !before[path] ? 'added' : !after[path] ? 'deleted' : 'modified' }))
}

// All settings are passed explicitly; neither a personal config file nor a new
// credential file is needed. Values below are TOML, not shell fragments.
export function configArguments(config) {
  return Object.entries(config).flatMap(([key, value]) => ['-c', `${key}=${toml(value)}`])
}
function toml(value) {
  if (Array.isArray(value)) return `[${value.map(toml).join(',')}]`
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}=${toml(item)}`).join(',')}}`
  return JSON.stringify(value)
}
