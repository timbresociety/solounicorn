import { expect, it } from 'vitest';
import { measureOperationsTickets } from '../../src/game/founder/toys';

it('reports manual selection and automated whole-ticket returns',()=>{
  const samples=Number(process.env.OPERATIONS_SAMPLES??100_000);
  if(!Number.isSafeInteger(samples)||samples<1)throw new Error('OPERATIONS_SAMPLES must be a positive integer.');
  const report={
    profile:'founder-candidate.9',
    seedStrategy:`company seeds 1..${samples}; ticket id 1; named operations-ticket-v1 stream`,
    interpretation:'Returns use persisted modeled operational-value cents. Cash effects remain exact cash; strain, rot and incident effects use the same signed value only for cross-effect EV reporting.',
    freeInspectionPolicy:'Inspect every paid patch, settle positive modeled values only, then abandon any remainder. Ticket price is never refunded.',
    wholeTicketPolicy:'Settle every patch, including negatives. Upkeep is allocated from current Operations automation rank and throughput.',
    rankZero:measureOperationsTickets(samples,0,0,1),
    scaledLuck4:measureOperationsTickets(samples,4,4,4),
  };
  console.log(`OPERATIONS_TICKET_REPORT ${JSON.stringify(report)}`);
  expect(report.rankZero.automated.meanAfterPriceAndUpkeep).toBeGreaterThan(0);
  expect(report.scaledLuck4.automated.meanAfterPriceAndUpkeep).toBeGreaterThan(0);
  expect(report.scaledLuck4.automated.variance).toBeGreaterThan(report.rankZero.automated.variance);
  expect(report.scaledLuck4.automated.minimum).toBeLessThan(0);
});
