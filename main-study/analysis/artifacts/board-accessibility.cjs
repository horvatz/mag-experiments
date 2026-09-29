// Exploratory reading check of archived components; never part of the frozen score.
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { createHash } = require('node:crypto')
const { createRequire } = require('node:module')
const { chromium } = require('playwright')
const root = path.resolve(__dirname, '../../..')
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  })
  module._compile(result.outputText, filename)
}
async function main() {
  const candidates = [
    ['baseline', path.resolve(root, '../aplikacija/src/TaskBoard.tsx')],
    ['P10-A-001', path.resolve(root, 'runs/P10-A-001/submission/src/TaskBoard.tsx')],
    ['P10-C-001', path.resolve(root, 'runs/P10-C-001/submission/src/TaskBoard.tsx')],
  ]
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    const page = await browser.newPage()
    for (const [candidate, component] of candidates) {
      const componentRequire = createRequire(component)
      const React = componentRequire('react')
      const { renderToStaticMarkup } = componentRequire('react-dom/server')
      const { TaskBoard } = require(component)
      for (const id of ['id-without-space', 'id with space']) {
        const task = { id, projectId: 'web', title: 'Enak naslov', description: 'Opis opravila', status: 'todo', assignee: 'Živa Čop', dueDate: '2026-10-02' }
        const html = renderToStaticMarkup(React.createElement(TaskBoard, { tasks: [task], onMove: () => {} }))
        await page.setContent(html)
        const link = page.locator('a.board-card')
        results.push({ candidate, id, source: path.relative(root, component), sourceSha256: createHash('sha256').update(fs.readFileSync(component)).digest('hex'),
          labelledby: await link.getAttribute('aria-labelledby'), label: await link.getAttribute('aria-label'),
          intendedLabelMatches: await page.getByRole('link', { name: `${task.title} ${id}`, exact: true }).count(),
          accessibleSnapshot: await link.ariaSnapshot(),
          unresolvedLabelTokens: await link.evaluate(element => (element.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).filter(id => !document.getElementById(id))),
        })
      }
    }
    const output = { generatedAt: new Date().toISOString(), kind: 'exploratory-static-component-accessibility', browser: await browser.version(),
      method: 'Archived TaskBoard rendered with React server rendering into an isolated, offline Chromium page. No application or evaluation server; no changes to archived submissions or primary scores.',
      limitation: 'This checks accessible link naming and unresolved ID references only, not navigation, application state or a screen reader.', results }
    const destination = path.resolve(root, 'main-study/analysis/diagnostics/board-accessibility.json')
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, JSON.stringify(output, null, 2) + '\n')
    console.log(JSON.stringify(output, null, 2))
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
