import test from 'node:test'
import assert from 'node:assert/strict'
import { prepaidHeadroom } from '../../prepaid-budget.mjs'
const now = Date.parse('2026-10-30T06:40:00Z')
const setup = () => ({now, balance:{at:new Date(now).toISOString(),totalCreditsUSD:40,totalUsageUSD:26.179245928,remainingUSD:13.820754072}, authorization:{initialAvailableUSD:40}, amendment:{status:'approved',id:'O/1.0-budget-amendment-1',automaticTopUp:false,authorizedTotalCreditsUSD:40}, maximumRequestCost:3.29357586})
test('approved remaining prepaid credit covers a maximum request', () => {const x=prepaidHeadroom(setup());assert.ok(Math.abs(x.availableUSD-13.820754072)<1e-9)})
test('insufficient actual credit stops before upstream', () => {const x=setup();x.balance={...x.balance,totalUsageUSD:39,remainingUSD:1};assert.throws(()=>prepaidHeadroom(x))})
test('top-up cannot increase the authorized credit ceiling', () => {const x=setup();x.balance={...x.balance,totalCreditsUSD:100,totalUsageUSD:39,remainingUSD:61};assert.throws(()=>prepaidHeadroom(x))})
test('in-flight reservations prevent concurrent overspending', () => {const x=setup();x.inFlightUSD=11;assert.throws(()=>prepaidHeadroom(x))})
test('unverified, stale or inconsistent balances are rejected', () => {for (const patch of [{remainingUSD:NaN},{at:'invalid'},{at:new Date(now-30001).toISOString()},{remainingUSD:20}]) {const x=setup();Object.assign(x.balance,patch);assert.throws(()=>prepaidHeadroom(x))}})
test('no unapproved rule, new ceiling or top-up authorization', () => {for (const patch of [{status:'proposed'},{authorizedTotalCreditsUSD:50},{automaticTopUp:true}]) {const x=setup();Object.assign(x.amendment,patch);assert.throws(()=>prepaidHeadroom(x))}})
