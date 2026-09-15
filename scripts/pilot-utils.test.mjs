import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { changes, configArguments, inventory } from './pilot-utils.mjs'

test('handoff detects forbidden edits, deletions and new files while allowing task code', () => {
  const root = mkdtempSync(join(tmpdir(), 'mag-handoff-'))
  try {
    for (const folder of ['src', 'server', 'tests/agent', 'test-results/run']) mkdirSync(join(root, folder), { recursive: true })
    writeFileSync(join(root, 'src/App.tsx'), 'baseline')
    writeFileSync(join(root, 'server/http.ts'), 'trusted')
    writeFileSync(join(root, 'package.json'), '{}')
    const before = inventory(root)
    writeFileSync(join(root, 'src/App.tsx'), 'candidate')
    writeFileSync(join(root, 'server/http.ts'), 'forbidden')
    rmSync(join(root, 'package.json'))
    writeFileSync(join(root, 'unexpected.txt'), 'forbidden')
    writeFileSync(join(root, 'tests/agent/extra.spec.ts'), 'allowed')
    writeFileSync(join(root, 'test-results/run/result.json'), 'generated')
    const result = changes(before, inventory(root))
    assert.deepEqual(result.filter((item) => !item.allowed).map((item) => item.path), ['package.json', 'server/http.ts', 'unexpected.txt'])
    assert.equal(result.filter((item) => item.allowed).length, 2)
    assert.ok(!result.some((item) => item.path.startsWith('test-results/')))
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('inventory records symlinks instead of following them outside the submission', () => {
  const root = mkdtempSync(join(tmpdir(), 'mag-links-'))
  try {
    mkdirSync(join(root, 'src'))
    symlinkSync('/a/nonexistent/private/target', join(root, 'src/escape'))
    assert.deepEqual(inventory(root), { 'src/escape': { kind: 'symlink', target: '/a/nonexistent/private/target' } })
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('Codex overrides remain separate arguments, including paths with spaces', () => {
  assert.deepEqual(configArguments({ 'permissions.pilot': { filesystem: { '/path with spaces': 'read' } }, 'features.apps': false }),
    ['-c', 'permissions.pilot={"filesystem"={"/path with spaces"="read"}}', '-c', 'features.apps=false'])
})
