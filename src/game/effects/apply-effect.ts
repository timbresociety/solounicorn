import type { DeclarativeEffect } from '../schema/content';
import { asEntityId } from '../schema/ids';
import type { RunState } from '../schema/state';
import { cents, ppm, pressureUnits, workUnits } from '../schema/units';

export function applyEffect(state: RunState, effect: DeclarativeEffect, sourceId: string): void {
  const operation = effect.operation;
  const scopedFunctions = effect.scope.type === 'FUNCTION' ? [state.functions[effect.scope.functionId]] : Object.values(state.functions);
  if (operation.type === 'ADD_CAPACITY') scopedFunctions.forEach((fn) => { fn.capacity = workUnits(fn.capacity + operation.amount); });
  if (operation.type === 'ADD_COMPLEXITY') {
    state.pressure.complexityContributions.push({ id: asEntityId(`complexity-${sourceId}-${effect.id}`), sourceId: asEntityId(sourceId), reason: effect.id.includes('skill') ? 'SKILL_EFFECT' : effect.id.includes('relic') ? 'RELIC_EFFECT' : 'STRATEGY_EFFECT', amount: operation.amount, removable: effect.reversible });
    state.pressure.complexity = pressureUnits(state.pressure.complexity + operation.amount);
  }
  if (operation.type === 'ADD_OPS_CAPACITY') state.pressure.opsCapacity = pressureUnits(state.pressure.opsCapacity + operation.amount);
  if (operation.type === 'ADD_RECURRING_COST') state.economy.burnPerQuarter = cents(state.economy.burnPerQuarter + operation.amountCents);
  if (operation.type === 'MODIFY_QUEUE_LIMIT') scopedFunctions.forEach((fn) => { fn.queueLimit = Math.max(1, fn.queueLimit + operation.amount); });
  if (operation.type === 'MODIFY_RELIABILITY') scopedFunctions.forEach((fn) => { fn.localRiskPpm = ppm(Math.max(0, fn.localRiskPpm - operation.amountPpm)); });
  if (operation.type === 'UNLOCK_CONTENT') state.progression.eligibilityTags.push(`CONTENT:${operation.contentId}`);
  if (operation.type === 'UNLOCK_POLICY') state.progression.eligibilityTags.push(`POLICY:${operation.policyId}`);
  if (operation.type === 'ADD_ELIGIBILITY_TAG' && !state.progression.eligibilityTags.includes(operation.tag)) state.progression.eligibilityTags.push(operation.tag);
  if (operation.type === 'MODIFY_FINANCE_TERMS') state.progression.eligibilityTags.push(`FINANCE_TERMS:${operation.amountBps}`);
  if (operation.type === 'MODIFY_ROT_RATE') state.progression.eligibilityTags.push(`ROT_RATE:${operation.multiplierPpm}`);
  if (operation.type === 'MODIFY_RECOVERY') state.progression.eligibilityTags.push(`RECOVERY:${operation.amount}`);
  if (operation.type === 'MULTIPLY_THROUGHPUT') state.progression.eligibilityTags.push(`THROUGHPUT:${operation.multiplierPpm}`);
  if (operation.type === 'MODIFY_INFORMATION') state.progression.eligibilityTags.push(`INFORMATION:${operation.amountPpm}`);
  if (operation.type === 'MODIFY_RISK_DISTRIBUTION') state.progression.eligibilityTags.push(`RISK:${operation.amountPpm}`);
  if (operation.type === 'ROUTE_OUTPUT') state.progression.eligibilityTags.push(`ROUTE:${operation.from}:${operation.to}`);
}
