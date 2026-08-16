import { describe, it } from 'node:test';
import assert from 'node:assert';
import { normalisePhone, isValidE164, formatPhoneDisplay } from '../index';

describe('Phone Number Normalisation & Validation', () => {
  it('normalises standard Sri Lankan 07-format numbers', () => {
    const result = normalisePhone('0771234567');
    assert.strictEqual(result, '+94771234567');
  });

  it('normalises numbers with spaces and hyphens', () => {
    const result = normalisePhone('077-123 4567');
    assert.strictEqual(result, '+94771234567');
  });

  it('normalises numbers with international 00 prefix', () => {
    const result = normalisePhone('0094771234567');
    assert.strictEqual(result, '+94771234567');
  });

  it('preserves valid E.164 numbers', () => {
    const result = normalisePhone('+94771234567');
    assert.strictEqual(result, '+94771234567');
  });

  it('rejects invalid inputs', () => {
    assert.strictEqual(normalisePhone('invalid'), null);
    assert.strictEqual(normalisePhone('123'), null);
  });

  it('validates E.164 strings correctly', () => {
    assert.strictEqual(isValidE164('+94771234567'), true);
    assert.strictEqual(isValidE164('0771234567'), false);
    assert.strictEqual(isValidE164('+1234567890123456'), false); // too long
  });

  it('formats Sri Lankan phone numbers for clean display', () => {
    assert.strictEqual(formatPhoneDisplay('+94771234567'), '+94 77 123 4567');
  });
});
