// User-approved budget-only amendment. Unknown bills remain in the audit.
import assert from 'node:assert/strict'

export function prepaidHeadroom({ balance, authorization, amendment, maximumRequestCost, inFlightUSD = 0, now = Date.now() }) {
  assert.equal(amendment.status, 'approved')
  assert.equal(amendment.id, 'O/1.0-budget-amendment-1')
  assert.equal(amendment.automaticTopUp, false)
  assert.equal(amendment.authorizedTotalCreditsUSD, authorization.initialAvailableUSD)
  assert.ok(Number.isFinite(maximumRequestCost) && maximumRequestCost > 0)
  assert.ok(Number.isFinite(inFlightUSD) && inFlightUSD >= 0)
  for (const n of [balance.totalCreditsUSD, balance.totalUsageUSD, balance.remainingUSD]) assert.ok(Number.isFinite(n) && n >= 0, 'Account balance cannot be verified')
  assert.ok(Number.isFinite(Date.parse(balance.at)) && now - Date.parse(balance.at) >= 0 && now - Date.parse(balance.at) <= 30000, 'Fresh balance required')
  assert.ok(Math.abs(balance.remainingUSD - (balance.totalCreditsUSD - balance.totalUsageUSD)) < 1e-7, 'Inconsistent account balance')
  // A later top-up does not expand this authorization: total usage is capped
  // at the original credit ceiling as well as at actual remaining credit.
  const availableUSD = Math.min(balance.remainingUSD, amendment.authorizedTotalCreditsUSD - balance.totalUsageUSD) - inFlightUSD
  assert.ok(availableUSD >= maximumRequestCost, 'Existing authorized prepaid credit cannot cover the pinned endpoint maximum request')
  return { amendment: amendment.id, authorizedCreditCeilingUSD: amendment.authorizedTotalCreditsUSD, availableUSD, inFlightUSD, maximumRequestCost, unknownBills: 'retained separately, never replaced with zero' }
}
