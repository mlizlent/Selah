import test from 'node:test';
import assert from 'node:assert/strict';
import { VERSES } from './verses.ts';

test('VERSES contains curated entries with required fields', () => {
  assert.ok(Array.isArray(VERSES));
  assert.ok(VERSES.length > 0);
  for (const v of VERSES) {
    assert.equal(typeof v.reference, 'string');
    assert.ok(v.reference.length > 0);
    assert.equal(typeof v.text, 'string');
    assert.ok(v.text.length > 0);
    assert.ok(Array.isArray(v.themes));
    assert.ok(v.themes.length > 0);
    for (const t of v.themes) {
      assert.equal(typeof t, 'string');
      assert.ok(t.length > 0);
    }
  }
});

test('VERSES includes core themes for matching', () => {
  const allThemes = new Set(VERSES.flatMap((v) => v.themes));
  for (const theme of ['anxiety', 'grief', 'hope', 'peace', 'guidance']) {
    assert.ok(allThemes.has(theme), `expected theme "${theme}"`);
  }
});
