import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(process.env.MAG_APP_REPOSITORY || resolve(root, '../aplikacija'))
const baseline = JSON.parse(readFileSync(resolve(root, 'baseline.json'), 'utf8'))
if (!existsSync(resolve(source, '.git'))) throw new Error('Clone mag-app first and set MAG_APP_REPOSITORY to its directory.')
execFileSync('git', ['cat-file', '-e', `${baseline.commit}^{commit}`], { cwd: source })
mkdirSync(resolve(root, '.work'), { recursive: true })
const archive = resolve(root, '.work/baseline.tar')
execFileSync('git', ['archive', '--format=tar', '--output', archive, baseline.commit], { cwd: source })
for (const folder of ['baseline', 'reference']) {
  const destination = resolve(root, '.work', folder)
  rmSync(destination, { recursive: true, force: true })
  mkdirSync(destination, { recursive: true })
  execFileSync('tar', ['-xf', archive, '-C', destination])
}
cpSync(resolve(root, 'reference/P01/overlay'), resolve(root, '.work/reference'), { recursive: true })
rmSync(archive)
console.log(`Prepared baseline ${baseline.commit} and separate P01 reference.`)
