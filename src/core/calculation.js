import { D } from './decimal.js';

export function calculateDisposal(allocation, rates, ruleVersion) {
  const q = D(allocation.quantity);
  const purchase = allocation.purchase;
  const sale = allocation.sale;
  const purchaseRate = D(rates[purchase.tradeDate]?.[purchase.currency] || '0');
  const saleRate = D(rates[sale.tradeDate]?.[sale.currency] || '0');
  if (purchaseRate.lte('0') || saleRate.lte('0')) throw new Error('לא נמצא שער יציג לתאריך המבוקש. נדרשת בחירת כלל המרה.');
  const grossCost = q.mul(purchase.price);
  const purchaseCommission = D(purchase.commission?.amount || '0').mul(q.div(purchase.quantity));
  const acquisitionCostIls = grossCost.add(purchaseCommission.abs()).mul(purchaseRate);
  const grossProceeds = q.mul(sale.price);
  const saleCommission = D(sale.commission?.amount || '0').abs().mul(q.div(D(sale.quantity).abs()));
  const proceedsIls = grossProceeds.sub(saleCommission).mul(saleRate);
  const preliminaryGainIls = proceedsIls.sub(acquisitionCostIls);
  return {
    ruleVersion,
    security: sale.security,
    quantitySold: q.toString(),
    purchaseDate: purchase.tradeDate,
    saleDate: sale.tradeDate,
    acquisitionCostIls: acquisitionCostIls.toString(),
    proceedsIls: proceedsIls.toString(),
    preliminaryGainIls: preliminaryGainIls.toString(),
    reportableGainIls: preliminaryGainIls.toString(),
    steps: [
      { ruleId: 'IL-DEMO-GROSS-COST', output: grossCost.toString(), sourceIds: [purchase.id] },
      { ruleId: 'IL-DEMO-ACQUISITION-ILS', output: acquisitionCostIls.toString(), sourceIds: [purchase.id] },
      { ruleId: 'IL-DEMO-PROCEEDS-ILS', output: proceedsIls.toString(), sourceIds: [sale.id] },
      { ruleId: 'IL-DEMO-PRELIMINARY-GAIN', output: preliminaryGainIls.toString(), sourceIds: [purchase.id, sale.id] }
    ]
  };
}

export function summarize(results) {
  return results.reduce((acc, row) => {
    const gain = D(row.reportableGainIls);
    acc.net = acc.net.add(gain);
    if (gain.lt('0')) acc.losses = acc.losses.add(gain.abs()); else acc.gains = acc.gains.add(gain);
    return acc;
  }, { gains: D('0'), losses: D('0'), net: D('0') });
}
