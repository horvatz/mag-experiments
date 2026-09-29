import { resolve } from 'node:path'
const task = process.env.MAG_TASK
if (!task || !/^P(?:0[3-9]|10)$/.test(task)) throw Error('Set MAG_TASK=P03..P10')
process.env.BASELINE_UNDER_TEST ||= resolve(`.work/${task}/baseline`)
process.env.APP_UNDER_TEST ||= resolve(`.work/${task}/reference`)
process.env.WEB_PORT ||= '5187'
process.env.API_PORT ||= '3115'
await import('./start-app.mjs')
