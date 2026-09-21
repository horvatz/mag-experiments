import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const baseline = resolve(process.env.BASELINE_UNDER_TEST || resolve(root, '.work/baseline'))
const candidate = resolve(process.env.APP_UNDER_TEST || resolve(root, '.work/reference'))
if (!existsSync(resolve(candidate, 'index.html'))) throw new Error('Run npm run prepare:reference first.')
// Infrastructure and fixtures always come from the pinned baseline, never the candidate.
const { createMockServer } = await import(pathToFileURL(resolve(baseline, 'server/http.ts')).href)
const apiPort = Number(process.env.API_PORT || 3111)
const webPort = Number(process.env.WEB_PORT || 5183)
const testControl = process.env.MOCK_CONTROL === '1'
const { server, store } = createMockServer({ testControl })
await new Promise((accept, reject) => {
  server.once('error', reject)
  server.listen(apiPort, '127.0.0.1', accept)
})
try {
  const proxy = { '/api': `http://127.0.0.1:${apiPort}` }
  if (testControl) proxy['/__test'] = `http://127.0.0.1:${apiPort}`
  const web = await createServer({
    root: candidate,
    configFile: resolve(baseline, 'vite.config.ts'),
    cacheDir: resolve(candidate, '.vite'),
    server: { host: '127.0.0.1', port: webPort, strictPort: true, proxy },
  })
  await web.listen()
  web.printUrls()
  const stop = async () => {
    store.reset()
    await web.close()
    server.closeAllConnections()
    server.close()
  }
  process.once('SIGTERM', () => { void stop() })
  process.once('SIGINT', () => { void stop() })
} catch (error) { server.close(); throw error }
