const SCALE = 12n;
const FACTOR = 10n ** SCALE;

export class DecimalAmount {
  constructor(value) { this.value = BigInt(value); }
  static from(input) {
    if (input instanceof DecimalAmount) return input;
    const text = String(input).trim();
    const sign = text.startsWith('-') ? -1n : 1n;
    const clean = text.replace(/^[+-]/, '');
    const [whole, fraction = ''] = clean.split('.');
    const padded = (fraction + '0'.repeat(Number(SCALE))).slice(0, Number(SCALE));
    return new DecimalAmount(sign * (BigInt(whole || '0') * FACTOR + BigInt(padded || '0')));
  }
  add(other) { return new DecimalAmount(this.value + DecimalAmount.from(other).value); }
  sub(other) { return new DecimalAmount(this.value - DecimalAmount.from(other).value); }
  mul(other) { return new DecimalAmount((this.value * DecimalAmount.from(other).value) / FACTOR); }
  div(other) { return new DecimalAmount((this.value * FACTOR) / DecimalAmount.from(other).value); }
  neg() { return new DecimalAmount(-this.value); }
  abs() { return this.value < 0n ? this.neg() : this; }
  lt(other) { return this.value < DecimalAmount.from(other).value; }
  lte(other) { return this.value <= DecimalAmount.from(other).value; }
  eq(other) { return this.value === DecimalAmount.from(other).value; }
  toFixed(decimals = 2) {
    const d = BigInt(decimals);
    const sign = this.value < 0n ? '-' : '';
    const abs = this.value < 0n ? -this.value : this.value;
    const roundFactor = 10n ** (SCALE - d);
    const rounded = (abs + roundFactor / 2n) / roundFactor;
    const whole = rounded / (10n ** d);
    const fraction = String(rounded % (10n ** d)).padStart(decimals, '0');
    return decimals === 0 ? `${sign}${whole}` : `${sign}${whole}.${fraction}`;
  }
  toString() {
    const sign = this.value < 0n ? '-' : '';
    const abs = this.value < 0n ? -this.value : this.value;
    const whole = abs / FACTOR;
    const fraction = String(abs % FACTOR).padStart(Number(SCALE), '0').replace(/0+$/, '');
    return `${sign}${whole}${fraction ? `.${fraction}` : ''}`;
  }
}
export const D = DecimalAmount.from;
