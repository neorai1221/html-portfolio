export const REVIEW_STATUS = ['needs_review', 'confirmed', 'professional_reviewed'];
export const TRANSACTION_TYPES = ['buy', 'sell', 'dividend', 'withholding_tax', 'interest', 'fee', 'split', 'unsupported'];

export const canonicalTransactionSchema = {
  id: 'stable internal id',
  broker: 'IBKR',
  externalIds: ['transactionId', 'executionId'],
  type: TRANSACTION_TYPES,
  tradeDate: 'YYYY-MM-DD',
  settlementDate: 'YYYY-MM-DD optional',
  security: { symbol: 'LTR ticker', isin: 'optional', conid: 'optional', description: 'source description' },
  quantity: 'decimal string',
  price: 'decimal string',
  currency: 'ISO 4217',
  commission: { amount: 'decimal string', currency: 'ISO 4217' },
  taxWithheld: { amount: 'decimal string', currency: 'ISO 4217' },
  raw: { untouchedSourceValues: true },
  normalized: { valuesUsedByEngine: true },
  sourceLocation: { fileId: 'sha-linked file', kind: 'csv_row|xml_node|pdf_page|xlsx_row', pointer: 'row/page/node' },
  reviewStatus: REVIEW_STATUS[0]
};
