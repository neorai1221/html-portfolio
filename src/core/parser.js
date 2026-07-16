export function parseIbkrDemoCsv(csvText) {
  const [headerLine, ...lines] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  return lines.map((line, index) => {
    const row = Object.fromEntries(line.split(',').map((value, i) => [headers[i], value]));
    const typeMap = { BUY: 'buy', SELL: 'sell', DIVIDEND: 'dividend' };
    return {
      id: `row-${index + 2}-${row.TransactionID}`,
      broker: 'IBKR',
      externalIds: [row.TransactionID],
      type: typeMap[row.Type] || 'unsupported',
      tradeDate: row.TradeDate,
      settlementDate: row.SettlementDate,
      security: { symbol: row.Symbol, conid: row.Conid, description: row.Symbol },
      quantity: row.Quantity,
      price: row.Price,
      currency: row.Currency,
      commission: { amount: row.Commission, currency: row.Currency },
      raw: row,
      normalized: true,
      sourceLocation: { fileId: 'sample', kind: 'csv_row', pointer: String(index + 2) },
      reviewStatus: 'needs_review'
    };
  });
}
