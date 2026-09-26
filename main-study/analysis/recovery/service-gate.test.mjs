import assert from 'node:assert/strict'
import { test } from 'node:test'
import { serviceFailure } from './service-gate.mjs'
test('service failures halt subsequent runs, including the observed auth failure', () => {
  assert.equal(serviceFailure(JSON.stringify({ type: 'turn.failed', error: { message: '401 Unauthorized: Incorrect API key provided' } })), true)
  assert.equal(serviceFailure(JSON.stringify({ type: 'error', message: 'You have hit your usage limit' })), true)
  assert.equal(serviceFailure(JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'The app tests a 401 response.' } })), false)
  assert.equal(serviceFailure('not JSON'), false)
})
