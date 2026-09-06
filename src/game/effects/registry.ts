import type { DeclarativeEffect, EffectOperation } from '../schema/content';

export const EFFECT_TYPES: EffectOperation['type'][] = [
  'ADD_CAPACITY', 'ADD_COMPLEXITY', 'ADD_OPS_CAPACITY', 'ADD_RECURRING_COST', 'MULTIPLY_THROUGHPUT',
  'MODIFY_RELIABILITY', 'MODIFY_INFORMATION', 'MODIFY_QUEUE_LIMIT', 'MODIFY_RISK_DISTRIBUTION',
  'ROUTE_OUTPUT', 'UNLOCK_POLICY', 'UNLOCK_CONTENT', 'ADD_ELIGIBILITY_TAG', 'MODIFY_FINANCE_TERMS',
  'MODIFY_ROT_RATE', 'MODIFY_RECOVERY',
];

export function validateEffect(effect: DeclarativeEffect): string[] {
  const issues: string[] = [];
  if (!EFFECT_TYPES.includes(effect.operation.type)) issues.push(`Unknown effect type ${(effect.operation as { type: string }).type}`);
  if (!Number.isInteger(effect.precedence)) issues.push(`Effect ${effect.id} has non-integer precedence`);
  if (effect.duration.type === 'QUARTERS' && effect.duration.quarters < 1) issues.push(`Effect ${effect.id} has invalid duration`);
  if (effect.duration.type === 'TICKS' && effect.duration.ticks < 1) issues.push(`Effect ${effect.id} has invalid duration`);
  return issues;
}
