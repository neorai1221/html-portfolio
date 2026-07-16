import { D } from './decimal.js';

export function matchLotsFifo(trades) {
  const lotsBySecurity = new Map();
  const allocations = [];
  const exceptions = [];
  for (const trade of trades) {
    const key = trade.security.conid || trade.security.isin || trade.security.symbol;
    if (!lotsBySecurity.has(key)) lotsBySecurity.set(key, []);
    const lots = lotsBySecurity.get(key);
    if (trade.type === 'buy') {
      lots.push({ ...trade, remainingQuantity: D(trade.quantity) });
    } else if (trade.type === 'sell') {
      let remaining = D(trade.quantity).abs();
      for (const lot of lots) {
        if (remaining.lte('0')) break;
        if (lot.remainingQuantity.lte('0')) continue;
        const allocated = lot.remainingQuantity.lt(remaining) ? lot.remainingQuantity : remaining;
        lot.remainingQuantity = lot.remainingQuantity.sub(allocated);
        remaining = remaining.sub(allocated);
        allocations.push({ saleId: trade.id, purchaseId: lot.id, securityKey: key, quantity: allocated.toString(), sale: trade, purchase: lot });
      }
      if (!remaining.lte('0')) exceptions.push({ code: 'MISSING_ACQUISITION_LOT', severity: 'critical', transactionId: trade.id, missingQuantity: remaining.toString(), messageHe: 'נמצאה מכירה ללא רכישה תואמת.' });
    }
  }
  return { allocations, exceptions };
}
