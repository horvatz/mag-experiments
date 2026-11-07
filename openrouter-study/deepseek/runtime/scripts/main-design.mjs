import { createHash } from 'node:crypto'
export const seed = 'mag-main-M1-2026-09-21'
export function random(seedText) {
  let state = createHash('sha256').update(seedText).digest().readUInt32LE()
  return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}
export function schedule() {
  const rng = random(seed), blocks = []
  for (let task = 3; task <= 10; task++) for (let repetition = 1; repetition <= 3; repetition++) {
    const base = task % 2 ? ['A', 'B', 'C'] : ['A', 'C', 'B'], start = repetition - 1
    const order = [...base.slice(start), ...base.slice(0, start)]
    blocks.push({ task: 'P' + String(task).padStart(2, '0'), repetition, order })
  }
  for (let i = blocks.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [blocks[i], blocks[j]] = [blocks[j], blocks[i]] }
  return { version: "O-DS/1.0", seed, blocks, runs: blocks.flatMap((block, index) => block.order.map((procedure, position) => ({ id: `${block.task}-${procedure}-${String(block.repetition).padStart(3, '0')}`, task: block.task, procedure, repetition: block.repetition, block: index + 1, position: position + 1 }))) }
}
export function requirementScore(summary) {
  const requirements = Array.from({ length: 12 }, (_, i) => {
    const scenario = 'E' + String(i + 1).padStart(2, '0') + ':'
    const tests = (summary.tests || []).filter(t => t.title.startsWith(scenario) && t.project.startsWith('evaluation-'))
    const observed = tests.length === 2 && new Set(tests.map(t => t.project)).size === 2
    return { id: 'R' + String(i + 1).padStart(2, '0'), demonstrated: Boolean(summary.allowedChanges && observed && tests.every(t => t.status === 'expected')), observed }
  })
  return { requirements, passed: requirements.filter(r => r.demonstrated).length, observed: requirements.filter(r => r.observed).length, total: 12, fraction: requirements.filter(r => r.demonstrated).length / 12 }
}
export function pairedInterval(differences) {
  if (differences.length !== 8 || differences.some(x => !Number.isFinite(x))) return null
  const rng = random(seed + '-bootstrap'), samples = []
  for (let iteration = 0; iteration < 20_000; iteration++) { let sum = 0; for (let i = 0; i < 8; i++) sum += differences[Math.floor(rng() * 8)]; samples.push(sum / 8) }
  samples.sort((a, b) => a - b)
  return { meanDifference: differences.reduce((a, b) => a + b, 0) / 8, lower: samples[499], upper: samples[19499], resamples: 20_000, unit: 'task', seed: seed + '-bootstrap' }
}
export function serviceLimitInEvents(text) {
  return text.split('\n').some(line => {
    let event; try { event = JSON.parse(line) } catch { return false }
    return ['error', 'turn.failed'].includes(event.type) && /usage.?limit|rate.?limit|quota.{0,30}(exceed|exhaust)|insufficient.{0,20}(credit|quota)|try again at/i.test(JSON.stringify(event))
  })
}
