import type { BalancePack } from '../src/game/schema/balance';
import type { ContentPack } from '../src/game/schema/content';
import { validateEffect } from '../src/game/effects/registry';

export function validateContentPack(content: ContentPack, balance: BalancePack): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  if (content.schemaVersion !== 1 || !content.version || !content.cultureVersion) issues.push('Content pack requires schema, content, and culture versions.');
  for (const entry of content.entries) {
    if (ids.has(entry.id)) issues.push(`Duplicate content ID ${entry.id}`);
    ids.add(entry.id);
    if (!entry.assetKey) issues.push(`Missing asset key for ${entry.id}`);
    if (!entry.provenance) issues.push(`Missing provenance for ${entry.id}`);
    if ('effects' in entry) entry.effects.forEach((effect) => issues.push(...validateEffect(effect)));
    if (entry.kind === 'SKILL_RANK') entry.prerequisiteIds.forEach((id) => { if (!content.entries.some((candidate) => candidate.id === id)) issues.push(`Unknown prerequisite ${id} on ${entry.id}`); });
  }
  if (balance.schemaVersion !== 1 || !balance.version || !balance.systemOrderVersion) issues.push('Balance pack requires schema, balance, and system-order versions.');
  const calibrationValues = [balance.ticksPerSecond, balance.ticksPerQuarter, balance.startingArr, balance.startingCash, balance.baseOpsCapacity,
    balance.founderWorkPerAction, balance.demandExpiryTicks, balance.pricingOpportunityExpiryTicks, balance.growthMultipleBps,
    balance.customerCollectionsPpmPerQuarter, balance.skillBaseCostCents, balance.unicornValuationDollars, balance.bankruptcyFloorCents,
    balance.rotPerAgentTickPpm, balance.strainBands, ...Object.values(balance.tuning)];
  calibrationValues.forEach((value, index) => {
    if (!value.status || !value.unit || !value.rationale) issues.push(`Unmarked balance value at index ${index}`);
    if (value.status !== 'CANONICAL' && !value.dependencyId) issues.push(`Non-canonical balance value at index ${index} lacks dependency ID`);
  });
  return issues;
}
