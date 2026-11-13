export interface BibleBook {
  name: string;
  abbrev: string;
  chapters: number;
  testament: 'OT' | 'NT';
}

export const BIBLE_BOOKS: BibleBook[] = [
  { name: 'Genesis', abbrev: 'GEN', chapters: 50, testament: 'OT' },
  { name: 'Exodus', abbrev: 'EXO', chapters: 40, testament: 'OT' },
  { name: 'Leviticus', abbrev: 'LEV', chapters: 27, testament: 'OT' },
  { name: 'Numbers', abbrev: 'NUM', chapters: 36, testament: 'OT' },
  { name: 'Deuteronomy', abbrev: 'DEU', chapters: 34, testament: 'OT' },
  { name: 'Joshua', abbrev: 'JOS', chapters: 24, testament: 'OT' },
  { name: 'Judges', abbrev: 'JDG', chapters: 21, testament: 'OT' },
  { name: 'Ruth', abbrev: 'RUT', chapters: 4, testament: 'OT' },
  { name: '1 Samuel', abbrev: '1SA', chapters: 31, testament: 'OT' },
  { name: '2 Samuel', abbrev: '2SA', chapters: 24, testament: 'OT' },
  { name: '1 Kings', abbrev: '1KI', chapters: 22, testament: 'OT' },
  { name: '2 Kings', abbrev: '2KI', chapters: 25, testament: 'OT' },
  { name: '1 Chronicles', abbrev: '1CH', chapters: 29, testament: 'OT' },
  { name: '2 Chronicles', abbrev: '2CH', chapters: 36, testament: 'OT' },
  { name: 'Ezra', abbrev: 'EZR', chapters: 10, testament: 'OT' },
  { name: 'Nehemiah', abbrev: 'NEH', chapters: 13, testament: 'OT' },
  { name: 'Esther', abbrev: 'EST', chapters: 10, testament: 'OT' },
  { name: 'Job', abbrev: 'JOB', chapters: 42, testament: 'OT' },
  { name: 'Psalm', abbrev: 'PSA', chapters: 150, testament: 'OT' },
  { name: 'Proverbs', abbrev: 'PRO', chapters: 31, testament: 'OT' },
  { name: 'Ecclesiastes', abbrev: 'ECC', chapters: 12, testament: 'OT' },
  { name: 'Song of Solomon', abbrev: 'SNG', chapters: 8, testament: 'OT' },
  { name: 'Isaiah', abbrev: 'ISA', chapters: 66, testament: 'OT' },
  { name: 'Jeremiah', abbrev: 'JER', chapters: 52, testament: 'OT' },
  { name: 'Lamentations', abbrev: 'LAM', chapters: 5, testament: 'OT' },
  { name: 'Ezekiel', abbrev: 'EZK', chapters: 48, testament: 'OT' },
  { name: 'Daniel', abbrev: 'DAN', chapters: 12, testament: 'OT' },
  { name: 'Hosea', abbrev: 'HOS', chapters: 14, testament: 'OT' },
  { name: 'Joel', abbrev: 'JOL', chapters: 3, testament: 'OT' },
  { name: 'Amos', abbrev: 'AMO', chapters: 9, testament: 'OT' },
  { name: 'Obadiah', abbrev: 'OBA', chapters: 1, testament: 'OT' },
  { name: 'Jonah', abbrev: 'JON', chapters: 4, testament: 'OT' },
  { name: 'Micah', abbrev: 'MIC', chapters: 7, testament: 'OT' },
  { name: 'Nahum', abbrev: 'NAM', chapters: 3, testament: 'OT' },
  { name: 'Habakkuk', abbrev: 'HAB', chapters: 3, testament: 'OT' },
  { name: 'Zephaniah', abbrev: 'ZEP', chapters: 3, testament: 'OT' },
  { name: 'Haggai', abbrev: 'HAG', chapters: 2, testament: 'OT' },
  { name: 'Zechariah', abbrev: 'ZEC', chapters: 14, testament: 'OT' },
  { name: 'Malachi', abbrev: 'MAL', chapters: 4, testament: 'OT' },
  { name: 'Matthew', abbrev: 'MAT', chapters: 28, testament: 'NT' },
  { name: 'Mark', abbrev: 'MRK', chapters: 16, testament: 'NT' },
  { name: 'Luke', abbrev: 'LUK', chapters: 24, testament: 'NT' },
  { name: 'John', abbrev: 'JHN', chapters: 21, testament: 'NT' },
  { name: 'Acts', abbrev: 'ACT', chapters: 28, testament: 'NT' },
  { name: 'Romans', abbrev: 'ROM', chapters: 16, testament: 'NT' },
  { name: '1 Corinthians', abbrev: '1CO', chapters: 16, testament: 'NT' },
  { name: '2 Corinthians', abbrev: '2CO', chapters: 13, testament: 'NT' },
  { name: 'Galatians', abbrev: 'GAL', chapters: 6, testament: 'NT' },
  { name: 'Ephesians', abbrev: 'EPH', chapters: 6, testament: 'NT' },
  { name: 'Philippians', abbrev: 'PHP', chapters: 4, testament: 'NT' },
  { name: 'Colossians', abbrev: 'COL', chapters: 4, testament: 'NT' },
  { name: '1 Thessalonians', abbrev: '1TH', chapters: 5, testament: 'NT' },
  { name: '2 Thessalonians', abbrev: '2TH', chapters: 3, testament: 'NT' },
  { name: '1 Timothy', abbrev: '1TI', chapters: 6, testament: 'NT' },
  { name: '2 Timothy', abbrev: '2TI', chapters: 4, testament: 'NT' },
  { name: 'Titus', abbrev: 'TIT', chapters: 3, testament: 'NT' },
  { name: 'Philemon', abbrev: 'PHM', chapters: 1, testament: 'NT' },
  { name: 'Hebrews', abbrev: 'HEB', chapters: 13, testament: 'NT' },
  { name: 'James', abbrev: 'JAS', chapters: 5, testament: 'NT' },
  { name: '1 Peter', abbrev: '1PE', chapters: 5, testament: 'NT' },
  { name: '2 Peter', abbrev: '2PE', chapters: 3, testament: 'NT' },
  { name: '1 John', abbrev: '1JN', chapters: 5, testament: 'NT' },
  { name: '2 John', abbrev: '2JN', chapters: 1, testament: 'NT' },
  { name: '3 John', abbrev: '3JN', chapters: 1, testament: 'NT' },
  { name: 'Jude', abbrev: 'JUD', chapters: 1, testament: 'NT' },
  { name: 'Revelation', abbrev: 'REV', chapters: 22, testament: 'NT' },
];

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleTranslation {
  id: string;
  label: string;
  short: string;
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  { id: 'kjv', label: 'King James Version', short: 'KJV' },
  { id: 'web', label: 'World English Bible', short: 'WEB' },
  { id: 'bsb', label: 'Berean Standard Bible', short: 'BSB' },
  { id: 'swahili', label: 'Swahili (Biblia Takatifu)', short: 'SWA' },
];

const BIBLE_API_BASE = 'https://bible-api.com';
const HELLOAO_BASE = 'https://bible.helloao.org/api';

export function getTranslation(id: string): BibleTranslation {
  return BIBLE_TRANSLATIONS.find((t) => t.id === id) ?? BIBLE_TRANSLATIONS[0];
}

function extractHelloAoText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map(extractHelloAoText).join('');
  if (content && typeof content === 'object') {
    const obj = content as { text?: unknown; content?: unknown; noteId?: unknown };
    if (typeof obj.text === 'string') return obj.text;
    if (obj.content !== undefined) return extractHelloAoText(obj.content);
    if (obj.noteId !== undefined) return '';
  }
  return '';
}

async function fetchSwahiliChapter(book: BibleBook, chapter: number): Promise<BibleVerse[]> {
  const res = await fetch(`${HELLOAO_BASE}/swh_ulb/${book.abbrev}/${chapter}.json`);
  if (!res.ok) throw new Error(`Failed to load ${book.name} ${chapter}`);
  const data = await res.json();
  const items = Array.isArray(data?.chapter?.content) ? data.chapter.content : [];
  const verses = items
    .filter((item: { type?: string }) => item && item.type === 'verse')
    .map((item: { number: number; content?: unknown }) => ({
      verse: Number(item.number),
      text: extractHelloAoText(item.content).replace(/\s+/g, ' ').trim(),
    }))
    .filter((v: BibleVerse) => Number.isFinite(v.verse) && v.text.length > 0);
  if (verses.length === 0) throw new Error(`No verses found for ${book.name} ${chapter}`);
  return verses;
}

export async function fetchChapter(
  book: string,
  chapter: number,
  translationId = 'kjv',
): Promise<BibleVerse[]> {
  const b = findBook(book);
  if (!b) throw new Error(`Unknown book: ${book}`);
  if (translationId === 'swahili') return fetchSwahiliChapter(b, chapter);
  const ref = `${b.name} ${chapter}`;
  const res = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(ref)}?translation=${encodeURIComponent(translationId)}`);
  if (!res.ok) throw new Error(`Failed to load ${ref}`);
  const data = await res.json();
  if (!data.verses || data.verses.length === 0) throw new Error(`No verses found for ${ref}`);
  return data.verses.map((v: { verse: number; text: string }) => ({
    verse: v.verse,
    text: v.text.trim(),
  }));
}

export async function fetchReference(ref: string, translationId = 'kjv'): Promise<BibleVerse[]> {
  const parsed = parseReference(ref);
  if (!parsed) throw new Error(`Could not understand reference "${ref}"`);
  const b = findBook(parsed.book);
  if (!b) throw new Error(`Unknown book in reference "${ref}"`);
  if (translationId === 'swahili') {
    const chapterVerses = await fetchSwahiliChapter(b, parsed.chapter);
    if (parsed.verse == null) return chapterVerses;
    const start = parsed.verse;
    const end = parsed.endVerse ?? parsed.verse;
    const filtered = chapterVerses.filter((v) => v.verse >= start && v.verse <= end);
    if (filtered.length === 0) throw new Error(`No verses found for "${ref}"`);
    return filtered;
  }
  const suffix = parsed.verse ? `:${parsed.verse}${parsed.endVerse ? `-${parsed.endVerse}` : ''}` : '';
  const q = `${b.name} ${parsed.chapter}${suffix}`;
  const res = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(q)}?translation=${encodeURIComponent(translationId)}`);
  if (!res.ok) throw new Error(`Failed to load ${ref}`);
  const data = await res.json();
  if (!data.verses || data.verses.length === 0) throw new Error(`No verses found for "${ref}"`);
  return data.verses.map((v: { verse: number; text: string }) => ({
    verse: v.verse,
    text: v.text.trim(),
  }));
}

export function findBook(query: string): BibleBook | undefined {
  const q = query.trim().toLowerCase();
  return BIBLE_BOOKS.find(
    (b) =>
      b.name.toLowerCase() === q ||
      b.abbrev.toLowerCase() === q ||
      b.name.toLowerCase().startsWith(q),
  );
}

export function parseReference(input: string): { book: string; chapter: number; verse?: number; endVerse?: number } | null {
  const match = input.trim().match(/^([\d]?\s?[A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;
  const [, bookName, ch, v, ev] = match;
  const book = findBook(bookName);
  if (!book) return null;
  return {
    book: book.name,
    chapter: parseInt(ch, 10),
    verse: v ? parseInt(v, 10) : undefined,
    endVerse: ev ? parseInt(ev, 10) : undefined,
  };
}
