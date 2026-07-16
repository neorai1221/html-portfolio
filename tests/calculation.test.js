import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseIbkrDemoCsv } from '../src/core/parser.js';
import { matchLotsFifo } from '../src/core/lotEngine.js';
import { calculateDisposal, summarize } from '../src/core/calculation.js';
import { D } from '../src/core/decimal.js';

test('one purchase and one full sale uses decimal arithmetic', () => {
  const trades = [
    { id: 'b1', type: 'buy', tradeDate: '2024-01-01', security: { symbol: 'XYZ' }, quantity: '1', price: '10.10', currency: 'USD', commission: { amount: '0.10', currency: 'USD' } },
    { id: 's1', type: 'sell', tradeDate: '2024-02-01', security: { symbol: 'XYZ' }, quantity: '-1', price: '12.10', currency: 'USD', commission: { amount: '0.10', currency: 'USD' } }
  ];
  const { allocations, exceptions } = matchLotsFifo(trades);
  assert.equal(exceptions.length, 0);
  const result = calculateDisposal(allocations[0], { '2024-01-01': { USD: '3.7' }, '2024-02-01': { USD: '3.8' } }, 'test');
  assert.equal(D(result.reportableGainIls).toFixed(2), '7.86');
});

test('multiple purchases followed by one partial sale allocates FIFO', () => {
  const trades = parseIbkrDemoCsv(readFileSync('samples/ibkr-demo-trades.csv', 'utf8')).filter(t => t.type !== 'dividend');
  const { allocations, exceptions } = matchLotsFifo(trades);
  assert.equal(exceptions.length, 0);
  assert.deepEqual(allocations.map(a => a.quantity), ['10', '2']);
});

test('missing acquisition lot becomes a critical exception', () => {
  const { exceptions } = matchLotsFifo([{ id: 's1', type: 'sell', tradeDate: '2024-01-01', security: { symbol: 'MSFT' }, quantity: '-5', price: '1', currency: 'USD' }]);
  assert.equal(exceptions[0].code, 'MISSING_ACQUISITION_LOT');
});

test('summed detailed results equal summary totals', () => {
  const rows = [{ reportableGainIls: '10.123456789123' }, { reportableGainIls: '-2.123456789123' }];
  const summary = summarize(rows);
  assert.equal(summary.net.toString(), '8');
  assert.equal(summary.gains.toString(), '10.123456789123');
  assert.equal(summary.losses.toString(), '2.123456789123');
});
