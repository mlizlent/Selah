import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Bookmark,
  Copy,
  Check,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  BIBLE_BOOKS,
  fetchChapter,
  fetchReference,
  parseReference,
  type BibleBook,
  type BibleVerse,
} from '@/lib/bible';

const OT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === 'OT');
const NT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === 'NT');

export default function Bible() {
  const [selectedBook, setSelectedBook] = useState<BibleBook>(BIBLE_BOOKS[18]); // Psalm
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [activeChapter, setActiveChapter] = useState<{ book: BibleBook; chapter: number; verses: BibleVerse[] } | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);

  const loadChapter = useCallback(async (book: BibleBook, ch: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChapter(book.name, ch);
      setVerses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this chapter.');
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapter(selectedBook, chapter);
  }, [selectedBook, chapter, loadChapter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const data = await fetchReference(searchQuery);
      setSearchResults(data);
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : 'Could not find that reference. Try "John 3:16" or "Psalm 23".',
      );
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const goToChapter = (book: BibleBook, ch: number) => {
    setSelectedBook(book);
    setChapter(ch);
    setSearchResults(null);
    setSearchQuery('');
    setShowBookPicker(false);
  };

  const openChapterPopup = async (book: BibleBook, ch: number) => {
    setChapterLoading(true);
    setError(null);
    try {
      const data = await fetchChapter(book.name, ch);
      setActiveChapter({ book, chapter: ch, verses: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this chapter.');
    } finally {
      setChapterLoading(false);
    }
  };

  const closeChapterPopup = () => {
    setActiveChapter(null);
  };

  const prevChapterInPopup = () => {
    if (!activeChapter) return;
    const { book, chapter } = activeChapter;
    if (chapter > 1) {
      openChapterPopup(book, chapter - 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.name === book.name);
      if (idx > 0) {
        const prevBook = BIBLE_BOOKS[idx - 1];
        openChapterPopup(prevBook, prevBook.chapters);
      }
    }
  };

  const nextChapterInPopup = () => {
    if (!activeChapter) return;
    const { book, chapter } = activeChapter;
    if (chapter < book.chapters) {
      openChapterPopup(book, chapter + 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.name === book.name);
      if (idx < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[idx + 1];
        openChapterPopup(nextBook, 1);
      }
    }
  };

  const copyVerse = async (v: BibleVerse) => {
    const text = `${selectedBook.name} ${chapter}:${v.verse} (KJV) — ${v.text}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(v.verse);
      setTimeout(() => setCopiedVerse(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative -mt-px flex min-h-[460px] items-center justify-center overflow-hidden">
        <img
          src="https://images.pexels.com/photos/34923397/pexels-photo-34923397.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="An open Bible under warm lamp light"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/55 to-parchment-50/95" />
        <div className="relative z-10 px-6 pt-8 pb-16 text-center">
          <span className="eyebrow mb-3 text-gold-300">King James Version</span>
          <h1 className="font-display text-4xl font-medium text-white drop-shadow-sm sm:text-6xl">
            The Holy Bible
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/90">
            Read, search, and meditate on scripture. Select a book and chapter,
            or jump straight to a verse reference.
          </p>
        </div>
      </div>

    <div className="mx-auto max-w-4xl px-6 py-12">

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search a reference — "John 3:16", "Psalm 23", "Romans 8:28-30"'
            className="input-field pl-11"
          />
        </div>
        <button type="submit" className="btn-primary shrink-0" disabled={searchLoading}>
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">Go</span>
        </button>
      </form>

      {searchError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchError}</p>
      )}

      {/* Search results */}
      {searchResults && (
        <div className="card mb-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-800">
              {searchQuery.trim()} <span className="text-sm font-normal text-ink-400">(KJV)</span>
            </h2>
            <button
              onClick={() => {
                setSearchResults(null);
                setSearchQuery('');
              }}
              className="text-sm text-lavender-600 hover:text-lavender-700"
            >
              Clear
            </button>
          </div>
          <div className="space-y-3">
            {searchResults.map((v, i) => (
              <div key={i} className="verse-card flex items-start gap-3">
                <span className="mt-0.5 text-xs font-semibold text-gold-600">{v.verse}</span>
                <p className="flex-1 font-display text-lg leading-relaxed text-ink-700">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book picker toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setShowBookPicker((s) => !s)}
          className="inline-flex items-center gap-2 rounded-full bg-lavender-50 px-5 py-2.5 text-sm font-medium text-lavender-700 transition-colors hover:bg-lavender-100"
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.5} />
          {selectedBook.name}
          <span className="text-ink-400">·</span>
          <span className="text-ink-500">Chapter {chapter}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBookPicker(false)}
            disabled={loading}
            className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100 disabled:opacity-30"
            aria-label="Close book picker"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Book picker panel */}
      {showBookPicker && (
        <div className="card mb-8 max-h-[420px] overflow-y-auto p-6">
          <div className="mb-4">
            <p className="eyebrow mb-2">Old Testament</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {OT_BOOKS.map((book) => (
                <button
                  key={book.name}
                  onClick={() => goToChapter(book, 1)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    book.name === selectedBook.name
                      ? 'bg-lavender-600 text-parchment-50'
                      : 'text-ink-600 hover:bg-lavender-50'
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">New Testament</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {NT_BOOKS.map((book) => (
                <button
                  key={book.name}
                  onClick={() => goToChapter(book, 1)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    book.name === selectedBook.name
                      ? 'bg-lavender-600 text-parchment-50'
                      : 'text-ink-600 hover:bg-lavender-50'
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapter quick-select */}
      {!showBookPicker && (
        <div className="mb-6 flex flex-wrap gap-1">
          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => openChapterPopup(selectedBook, ch)}
              className={`min-w-[36px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                ch === chapter
                  ? 'bg-lavender-600 text-parchment-50'
                  : 'text-ink-500 hover:bg-lavender-50'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      {/* Chapter popup modal */}
      {activeChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={closeChapterPopup} />
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-parchment-200 bg-parchment-50 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-parchment-200 bg-parchment-50/95 px-6 py-4 backdrop-blur-sm">
              <h2 className="font-display text-xl font-semibold text-ink-800">
                {activeChapter.book.name} {activeChapter.chapter}
              </h2>
              <button
                onClick={closeChapterPopup}
                className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100 hover:text-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {chapterLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-lavender-500" />
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 px-5 py-4 text-center text-sm text-red-700 m-6">
                {error}
              </div>
            ) : (
              <>
                <div className="px-6 py-4">
                  <p className="text-xs uppercase tracking-wide text-ink-400">King James Version</p>
                </div>
                <div className="space-y-4 px-6 pb-6">
                  {activeChapter.verses.map((v) => (
                    <div
                      key={v.verse}
                      className="group flex items-start gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-parchment-100/60"
                    >
                      <span className="mt-1 min-w-[28px] text-right text-xs font-semibold text-gold-600">
                        {v.verse}
                      </span>
                      <p className="flex-1 font-display text-lg leading-[1.7] text-ink-700">
                        {v.text}
                      </p>
                      <button
                        onClick={() => copyVerse(v)}
                        className="mt-1 shrink-0 rounded-full p-1.5 text-ink-300 opacity-0 transition-all hover:bg-parchment-200 hover:text-lavender-600 group-hover:opacity-100"
                        aria-label="Copy verse"
                      >
                        {copiedVerse === v.verse ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer nav */}
                <div className="flex items-center justify-between border-t border-parchment-200 px-6 py-4">
                  <button
                    onClick={prevChapterInPopup}
                    disabled={chapterLoading || (activeChapter.book.name === 'Genesis' && activeChapter.chapter === 1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-lavender-600 transition-colors hover:text-lavender-700 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={nextChapterInPopup}
                    disabled={chapterLoading || (activeChapter.book.name === 'Revelation' && activeChapter.chapter === activeChapter.book.chapters)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-lavender-600 transition-colors hover:text-lavender-700 disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {[
          { ref: 'John 3:16', label: 'John 3:16' },
          { ref: 'Psalm 23', label: 'Psalm 23' },
          { ref: '1 Corinthians 13', label: '1 Cor 13' },
          { ref: 'Romans 8', label: 'Romans 8' },
          { ref: 'Genesis 1', label: 'Genesis 1' },
        ].map((q) => (
          <button
            key={q.ref}
            onClick={() => {
              setSearchQuery(q.ref);
              const parsed = parseReference(q.ref);
              if (parsed) {
                const book = BIBLE_BOOKS.find((b) => b.name === parsed.book);
                if (book) goToChapter(book, parsed.chapter);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-parchment-200 bg-parchment-50/60 px-4 py-2 text-xs font-medium text-ink-500 transition-colors hover:border-lavender-300 hover:text-lavender-600"
          >
            <Bookmark className="h-3 w-3" strokeWidth={1.5} />
            {q.label}
            <ArrowRight className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
    </div>
  );
}
