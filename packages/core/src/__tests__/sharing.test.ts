import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SHARE_CATEGORIES, ShareCategory } from '../sharing';

describe('Access Grant & Sharing Rules', () => {
  it('defines the required 6 core privacy sharing categories', () => {
    const keys = SHARE_CATEGORIES.map((c) => c.key);
    assert.strictEqual(keys.length, 6);
    assert.ok(keys.includes('summary'));
    assert.ok(keys.includes('vaccinations'));
    assert.ok(keys.includes('medications'));
    assert.ok(keys.includes('timeline'));
    assert.ok(keys.includes('weight'));
    assert.ok(keys.includes('documents'));
  });

  it('verifies valid category keys match ShareCategory type', () => {
    const validCategory: ShareCategory = 'vaccinations';
    assert.strictEqual(typeof validCategory, 'string');
  });
});
