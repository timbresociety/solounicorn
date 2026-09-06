import type { EligibilityPredicate } from '../schema/content';
import type { RunState } from '../schema/state';

export function evaluateEligibility(state: RunState, predicates: EligibilityPredicate[]): { eligible: boolean; reasons: string[] } {
  const reasons = predicates.map((predicate) => {
    if (predicate.type === 'ALWAYS') return null;
    if (predicate.type === 'HAS_TAG') return state.progression.eligibilityTags.includes(predicate.tag) ? null : `Requires ${predicate.tag}`;
    if (predicate.type === 'OWNS_SKILL') return state.progression.purchasedSkillRankIds.includes(predicate.skillRankId) ? null : `Requires skill ${predicate.skillRankId}`;
    if (predicate.type === 'OWNS_RELIC') return state.progression.ownedRelicIds.includes(predicate.relicId) ? null : `Requires relic ${predicate.relicId}`;
    if (predicate.type === 'MIN_AGENTS') return state.automation.agents.length >= predicate.count ? null : `Requires ${predicate.count} agents`;
    if (predicate.type === 'MIN_COMPLEXITY') return state.pressure.complexity >= predicate.amount ? null : `Requires Complexity ${predicate.amount}`;
    if (predicate.type === 'HAS_DEBT') return state.capital.debt.some((debt) => debt.status === 'ACTIVE') ? null : 'Requires active debt';
    return state.progression.skillRanksByFunction[predicate.functionId][predicate.branch] >= predicate.rank ? null : `Requires ${predicate.functionId} ${predicate.branch} ${predicate.rank}`;
  }).filter((reason): reason is string => Boolean(reason));
  return { eligible: reasons.length === 0, reasons };
}
