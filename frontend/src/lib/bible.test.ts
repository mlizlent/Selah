import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATIONS,
  findBook,
  getTranslation,
  parseReference,
} from './bible.ts';

test('BIBLE_TRANSLATIONS includes expected versions', () => {
  const ids = BIBLE_TRANSLATIONS.map((t) => t.id);
  assert.deepEqual(ids, ['kjv', 'web', 'bsb', 'swahili']);
  assert.equal(getTranslation('kjv').short, 'KJV');
  assert.equal(getTranslation('unknown').id, 'kjv');
});

test('BIBLE_BOOKS covers OT and NT', () => {
  assert.equal(BIBLE_BOOKS.length, 66);
  assert.ok(BIBLE_BOOKS.some((b) => b.name === 'Genesis' && b.testament === 'OT'));
  assert.ok(BIBLE_BOOKS.some((b) => b.name === 'Revelation' && b.testament === 'NT'));
});

test('findBook matches names, abbreviations, and prefixes', () => {
  assert.equal(findBook('John')?.name, 'John');
  assert.equal(findBook('1co')?.name, '1 Corinthians');
  assert.equal(findBook('psa')?.name, 'Psalm');
  assert.equal(findBook('gen')?.name, 'Genesis');
  assert.equal(findBook('notabook'), undefined);
});

test('parseReference parses book chapter and verse ranges', () => {
  assert.deepEqual(parseReference('John 3:16'), { book: 'John', chapter: 3, verse: 16, endVerse: undefined });
  assert.deepEqual(parseReference('Psalm 23'), { book: 'Psalm', chapter: 23, verse: undefined, endVerse: undefined });
  assert.deepEqual(parseReference('Romans 8:28-30'), { book: 'Romans', chapter: 8, verse: 28, endVerse: 30 });
  assert.deepEqual(parseReference('1 Corinthians 13'), { book: '1 Corinthians', chapter: 13, verse: undefined, endVerse: undefined });
  assert.equal(parseReference('nonsense 1:1'), null);
  assert.equal(parseReference('John'), null);
});
