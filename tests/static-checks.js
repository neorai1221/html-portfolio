import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const index = readFileSync('index.html', 'utf8');
assert.match(index, /<html lang="he" dir="rtl">/);
assert.match(index, /טיוטת חישוב והכנה לדיווח/);
assert.match(index, /הצג מקור/);
const rules = JSON.parse(readFileSync('tax-rules/israel/2024/rules.json', 'utf8'));
assert.equal(rules.status, 'draft_requires_professional_review');
console.log('static checks passed');
