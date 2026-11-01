// NONACTIVE PROPOSAL. No live operator imports this module.
// Approval and actual prepaid funding are required before any activation.
import assert from 'node:assert/strict'

export function prepaidHeadroomCandidate({ balance, authorization, amendment, maximumRequestCost, inFlightUSD = 0, now = Date.now() }) {
  assert.equal(amendment.status, 'approved')
  assert.equal(amendment.automaticTopUp, false)
  if (amendment.id === 'O/1.0-budget-amendment-1') {
    assert.equal(amendment.authorizedTotalCreditsUSD, authorization.initialAvailableUSD)
  } else {
    assert.equal(amendment.id, 'O/1.0-budget-amendment-2')
    assert.equal(amendment.baseAmendment, 'O/1.0-budget-amendment-1')
    assert.equal(authorization.initialAvailableUSD, 40)
    assert.equal(amendment.manualFundingOnly, true)
    assert.equal(amendment.maximumAdditionalAuthorizedFundingUSD, 10)
    assert.equal(amendment.authorizedTotalCreditsUSD, 50)
    assert.equal(amendment.authorizedTotalCreditsUSD,
      authorization.initialAvailableUSD + amendment.maximumAdditionalAuthorizedFundingUSD)
    assert.ok(balance.totalCreditsUSD >= amendment.authorizedTotalCreditsUSD,
      'Approved manual prepaid funding must actually be visible')
  }
  assert.ok(Number.isFinite(maximumRequestCost) && maximumRequestCost > 0)
  assert.ok(Number.isFinite(inFlightUSD) && inFlightUSD >= 0)
  for (const n of [balance.totalCreditsUSD, balance.totalUsageUSD, balance.remainingUSD]) assert.ok(Number.isFinite(n) && n >= 0, 'Account balance cannot be verified')
  assert.ok(Number.isFinite(Date.parse(balance.at)) && now - Date.parse(balance.at) >= 0 && now - Date.parse(balance.at) <= 30000, 'Fresh balance required')
  assert.ok(Math.abs(balance.remainingUSD - (balance.totalCreditsUSD - balance.totalUsageUSD)) < 1e-7, 'Inconsistent account balance')
  const availableUSD = Math.min(balance.remainingUSD, amendment.authorizedTotalCreditsUSD - balance.totalUsageUSD) - inFlightUSD
  assert.ok(availableUSD >= maximumRequestCost, 'Existing authorized prepaid credit cannot cover the pinned endpoint maximum request')
  return { amendment: amendment.id, authorizedCreditCeilingUSD: amendment.authorizedTotalCreditsUSD, availableUSD, inFlightUSD, maximumRequestCost, unknownBills: 'retained separately, never replaced with zero' }
}
