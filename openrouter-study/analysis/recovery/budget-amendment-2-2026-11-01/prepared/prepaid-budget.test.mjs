// Offline synthetic fixtures only. These are not actual approval records.
import test from 'node:test'
import assert from 'node:assert/strict'
import { prepaidHeadroom } from '../original/prepaid-budget.mjs'
import { prepaidHeadroom as candidate } from './prepaid-budget.mjs'
const now = Date.parse('2026-11-01T03:00:00Z')
const setup = () => ({ now, balance: { at: new Date(now).toISOString(), totalCreditsUSD: 40, totalUsageUSD: 36.3, remainingUSD: 3.7 }, authorization: { initialAvailableUSD: 40 }, amendment: { status: 'approved', id: 'O/1.0-budget-amendment-1', automaticTopUp: false, authorizedTotalCreditsUSD: 40 }, maximumRequestCost: 3.29357586 })
const syntheticApproved2 = () => {
  const x = setup()
  x.balance.totalCreditsUSD = 50; x.balance.remainingUSD = 13.7
  Object.assign(x.amendment, { id: 'O/1.0-budget-amendment-2', baseAmendment: 'O/1.0-budget-amendment-1', manualFundingOnly: true, fundingObserved: true, maximumAdditionalAuthorizedFundingUSD: 10, authorizedTotalCreditsUSD: 50 })
  return x
}
test('old approval retains exactly the old returned rule', () => assert.deepEqual(candidate(setup()), prepaidHeadroom(setup())))
test('old approval cannot spend a later unapproved top-up', () => { const x = setup(); Object.assign(x.balance, { totalCreditsUSD: 50, totalUsageUSD: 39, remainingUSD: 11 }); assert.throws(() => candidate(x)); assert.throws(() => prepaidHeadroom(x)) })
test('old approval still rejects a silently raised cap', () => { const x = setup(); x.amendment.authorizedTotalCreditsUSD = 50; assert.throws(() => candidate(x)) })
test('synthetic approval2 plus actually visible funding permits only the new ceiling', () => { const r = candidate(syntheticApproved2()); assert.equal(r.authorizedCreditCeilingUSD, 50); assert.equal(r.availableUSD, 13.7); assert.equal(r.maximumRequestCost, 3.29357586) })
test('proposal is never approval', () => { const x = syntheticApproved2(); x.amendment.status = 'proposed-awaiting-explicit-user-approval'; assert.throws(() => candidate(x)) })
test('missing or partial funding cannot activate approval2', () => { for (const n of [40, 45, 49.99]) { const x = syntheticApproved2(); x.balance.totalCreditsUSD = n; x.balance.remainingUSD = n - x.balance.totalUsageUSD; assert.throws(() => candidate(x)) } })
test('extra unrequested credit does not increase the usage ceiling', () => { const x = syntheticApproved2(); Object.assign(x.balance, { totalCreditsUSD: 100, totalUsageUSD: 49, remainingUSD: 51 }); assert.throws(() => candidate(x)) })
test('insufficient actual credit is rejected', () => { const x = syntheticApproved2(); Object.assign(x.balance, { totalUsageUSD: 49, remainingUSD: 1 }); assert.throws(() => candidate(x)) })
test('concurrent maximum reservations are still subtracted', () => { const x = syntheticApproved2(); x.inFlightUSD = 11; assert.throws(() => candidate(x)) })
test('exactly representable maximum coverage passes and one cent less fails', () => { const x = syntheticApproved2(); x.maximumRequestCost = 3.25; x.balance.totalUsageUSD = 46.75; x.balance.remainingUSD = 3.25; assert.ok(candidate(x)); x.balance.totalUsageUSD += .01; x.balance.remainingUSD -= .01; assert.throws(() => candidate(x)) })
test('decimal rounding retains the old conservative rejection with no extra tolerance', () => { const x = setup(); x.balance.totalUsageUSD = 40 - x.maximumRequestCost; x.balance.remainingUSD = x.maximumRequestCost; assert.throws(() => prepaidHeadroom(x)); assert.throws(() => candidate(x)); const y = syntheticApproved2(); y.balance.totalUsageUSD = 50 - y.maximumRequestCost; y.balance.remainingUSD = y.maximumRequestCost; assert.throws(() => candidate(y)) })
test('stale, future, invalid and inconsistent balances are rejected', () => { for (const patch of [{ at: new Date(now - 30001).toISOString() }, { at: new Date(now + 1).toISOString() }, { at: 'invalid' }, { remainingUSD: NaN }, { remainingUSD: 20 }, { totalCreditsUSD: Infinity }]) { const x = syntheticApproved2(); Object.assign(x.balance, patch); assert.throws(() => candidate(x)) } })
test('automatic top-ups, wrong base, wrong funding/cap and unknown versions are rejected', () => { for (const patch of [{ automaticTopUp: true }, { manualFundingOnly: false }, { baseAmendment: 'other' }, { maximumAdditionalAuthorizedFundingUSD: 20 }, { authorizedTotalCreditsUSD: 60 }, { id: 'O/1.0-budget-amendment-3' }]) { const x = syntheticApproved2(); Object.assign(x.amendment, patch); assert.throws(() => candidate(x)) } })
test('unknown bills remain an audit statement, not a calculated zero', () => assert.equal(candidate(syntheticApproved2()).unknownBills, 'retained separately, never replaced with zero'))
test('nonpositive maximum and invalid in-flight reservations are rejected', () => { for (const patch of [{ maximumRequestCost: 0 }, { maximumRequestCost: NaN }, { inFlightUSD: -1 }, { inFlightUSD: Infinity }]) { const x = syntheticApproved2(); Object.assign(x, patch); assert.throws(() => candidate(x)) } })

test('approved draft cannot stand in for documented funding', () => { const x=syntheticApproved2();x.amendment.fundingObserved=false;assert.throws(()=>candidate(x)) })
