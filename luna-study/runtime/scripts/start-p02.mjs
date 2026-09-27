import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.env.BASELINE_UNDER_TEST = resolve(root, '.work/P02/baseline')
process.env.APP_UNDER_TEST ||= resolve(root, '.work/P02/reference')
process.env.API_PORT ||= '3113'
process.env.WEB_PORT ||= '5185'
await import('./start-app.mjs')
