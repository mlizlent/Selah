import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  Star,
  Play,
} from 'lucide-react';
import {
  BIBLE_BOOKS,
  BIBLE_TRANSLATIONS,
  fetchChapter,
  fetchReference,
  getTranslation,
  parseReference,
  type BibleBook,
  type BibleVerse,
} from '@/lib/bible';
import { VerseSkeleton } from '@/components/Skeletons';

const OT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === 'OT');
const NT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === 'NT');

interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
}

export default function Bible() {
  const [translationId, setTranslationId] = useState('kjv');
  const [selectedBook, setSelectedBook] = useState<BibleBook>(BIBLE_BOOKS[18]); // Psalm
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [lastRead, setLastRead] = useState<{ book: string; chapter: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const versesRef = useRef<HTMLDivElement>(null);
  const userNavigated = useRef(false);
  const { t } = useTranslation();

  const translation = getTranslation(translationId);

  const loadChapter = useCallback(async (book: BibleBook, ch: number, tr: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChapter(book.name, ch, tr);
      setVerses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this chapter.');
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapter(selectedBook, chapter, translationId);
    if (userNavigated.current) saveLastRead(selectedBook.name, chapter);
    if (versesRef.current) versesRef.current.scrollTop = 0;
    setProgress(0);
  }, [selectedBook, chapter, translationId, loadChapter]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('selah-bible-bookmarks');
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('selah-bible-last-read');
      if (stored) setLastRead(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const el = versesRef.current;
      if (!el) return;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
      }
    };
    const el = versesRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [verses]);

  const saveLastRead = (book: string, ch: number) => {
    const entry = { book, chapter: ch };
    setLastRead(entry);
    localStorage.setItem('selah-bible-last-read', JSON.stringify(entry));
  };

  const saveBookmarks = (next: Bookmark[]) => {
    setBookmarks(next);
    localStorage.setItem('selah-bible-bookmarks', JSON.stringify(next));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const data = await fetchReference(searchQuery, translationId);
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
    userNavigated.current = true;
    setSelectedBook(book);
    setChapter(ch);
    setSearchResults(null);
    setSearchQuery('');
    setShowBookPicker(false);
    setShowChapterPicker(false);
  };

  const toggleBookmark = (v: BibleVerse) => {
    const exists = bookmarks.find((b) => b.book === selectedBook.name && b.chapter === chapter && b.verse === v.verse);
    if (exists) {
      saveBookmarks(bookmarks.filter((b) => b.id !== exists.id));
    } else {
      saveBookmarks([
        ...bookmarks,
        {
          id: crypto.randomUUID(),
          book: selectedBook.name,
          chapter,
          verse: v.verse,
          text: v.text,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const removeBookmark = (id: string) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const goToBookmark = (book: BibleBook, ch: number) => {
    setSelectedBook(book);
    setChapter(ch);
    setShowBookmarks(false);
  };

  const copyVerse = async (v: BibleVerse) => {
    const text = `${selectedBook.name} ${chapter}:${v.verse} (${translation.short}) — ${v.text}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(v.verse);
      setTimeout(() => setCopiedVerse(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const isBookmarked = (v: BibleVerse) => {
    return bookmarks.some((b) => b.book === selectedBook.name && b.chapter === chapter && b.verse === v.verse);
  };

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="relative -mt-px overflow-hidden border-b border-parchment-200/60">
        <img
          src="https://images.pexels.com/photos/34923397/pexels-photo-34923397.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="An open Bible under warm lamp light"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/55 to-parchment-50" />
        <div className="relative mx-auto flex min-h-[345px] max-w-5xl flex-col items-center justify-center px-6 pb-20 pt-16 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-d-label font-medium uppercase tracking-[0.2em] text-parchment-50 backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5" />
            {translation.label}
          </span>
          <h1 className="font-display text-d-headline font-semibold text-parchment-50 drop-shadow-sm sm:text-d-display">
            {t('bible.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-d-body leading-relaxed text-parchment-100/90">
            {t('bible.subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-5xl px-6">
        <div className="card relative z-10 mb-8 p-4 shadow-lg shadow-ink-900/5 sm:p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('bible.searchPlaceholder')}
                className="input-field h-12 pl-11"
              />
            </div>
            <div className="flex gap-2">
              <select
                id="bible-translation"
                aria-label="Bible translation"
                value={translationId}
                onChange={(e) => {
                  setTranslationId(e.target.value);
                  setSearchResults(null);
                  setSearchError(null);
                }}
                className="input-field h-12 min-w-[170px] py-0 sm:min-w-[210px]"
              >
                {BIBLE_TRANSLATIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary h-12 shrink-0 px-5" disabled={searchLoading}>
                {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="hidden sm:inline">{t('common.go')}</span>
              </button>
            </div>
          </form>
          {searchError && (
            <p className="mt-3 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-d-body text-red-700">{searchError}</p>
          )}
        </div>

        {/* Search results */}
        {searchResults && (
          <div className="card mb-8 overflow-hidden">
            <div className="flex items-center justify-between border-b border-parchment-200 bg-parchment-100/50 px-6 py-4">
              <div>
                <p className="eyebrow mb-1">{t('bible.searchResult')}</p>
                <h2 className="font-display text-d-title font-semibold text-ink-800">
                  {searchQuery.trim()} <span className="text-d-body font-normal text-ink-400">({translation.short})</span>
                </h2>
              </div>
              <button
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-parchment-200 bg-parchment-50 px-3 py-1.5 text-d-label font-medium text-ink-500 transition-colors hover:border-lavender-300 hover:text-lavender-700"
              >
                <X className="h-3.5 w-3.5" />
                {t('common.clear')}
              </button>
            </div>
            <div className="space-y-3 p-6">
              {searchResults.map((v, i) => (
                <div key={i} className="verse-card flex items-start gap-4">
                  <span className="mt-0.5 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-gold-500/15 px-2 text-d-label font-semibold text-gold-600">{v.verse}</span>
                  <p className="flex-1 font-display text-d-title leading-relaxed text-ink-700">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px,minmax(0,1fr)] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card p-4 sm:p-5">
              <p className="eyebrow mb-3">{t('bible.reading')}</p>
              <button
                onClick={() => {
                  setShowBookPicker((s) => !s);
                  setShowChapterPicker(false);
                  setShowBookmarks(false);
                }}
                className="group w-full rounded-xl border border-parchment-200 bg-parchment-100/40 p-4 text-left transition-all hover:border-lavender-300 hover:bg-lavender-50/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-d-label font-medium uppercase tracking-wide text-ink-400">{t('bible.currentPassage')}</span>
                  <BookOpen className="h-4 w-4 text-lavender-600" />
                </div>
                <p className="mt-2 font-display text-d-headline font-semibold leading-tight text-ink-800">{selectedBook.name}</p>
                <p className="mt-1 text-d-body text-ink-500">Chapter {chapter} · {translation.short}</p>
              </button>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowChapterPicker((s) => !s);
                    setShowBookPicker(false);
                    setShowBookmarks(false);
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-d-label font-medium transition-colors ${
                    showChapterPicker
                      ? 'border-lavender-300 bg-lavender-50 text-lavender-700'
                      : 'border-parchment-200 bg-parchment-50 text-ink-600 hover:border-lavender-300 hover:text-lavender-700'
                  }`}
                >
                  {t('common.chapters')}
                </button>
                <button
                  onClick={() => {
                    setShowBookmarks((s) => !s);
                    setShowBookPicker(false);
                    setShowChapterPicker(false);
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-d-label font-medium transition-colors ${
                    showBookmarks
                      ? 'border-gold-400/60 bg-gold-400/10 text-gold-600'
                      : 'border-parchment-200 bg-parchment-50 text-ink-600 hover:border-gold-400/60 hover:text-gold-600'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" fill={showBookmarks ? 'currentColor' : 'none'} />
                  {t('common.saved')}
                </button>
              </div>

              {lastRead && (
                <button
                  onClick={() => {
                    const book = BIBLE_BOOKS.find((b) => b.name === lastRead.book);
                    if (book) goToChapter(book, lastRead.chapter);
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lavender-600/10 px-4 py-2.5 text-d-body font-medium text-lavender-700 transition-colors hover:bg-lavender-600/15"
                >
                  <Play className="h-4 w-4" />
                  {t('bible.continueReading', { book: lastRead.book, chapter: lastRead.chapter })}
                </button>
              )}
            </div>

            <div className="card p-4 sm:p-5">
              <p className="eyebrow mb-3">{t('bible.quickPassages')}</p>
              <div className="flex flex-wrap gap-2">
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-parchment-200 bg-parchment-50/60 px-3 py-1.5 text-d-label font-medium text-ink-500 transition-colors hover:border-lavender-300 hover:text-lavender-700"
                  >
                    {q.label}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            {showBookPicker && (
              <div className="card mb-6 max-h-[460px] overflow-y-auto p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-d-title font-semibold text-ink-800">{t('bible.chooseBook')}</h2>
                  <button
                    onClick={() => setShowBookPicker(false)}
                    className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100"
                    aria-label={t('bible.closeBookPicker')}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className="eyebrow mb-3">{t('bible.oldTestament')}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {OT_BOOKS.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => goToChapter(book, 1)}
                        className={`rounded-xl px-3 py-2.5 text-left text-d-body transition-all ${
                          book.name === selectedBook.name
                            ? 'bg-lavender-600 text-parchment-50 shadow-sm shadow-lavender-600/20'
                            : 'border border-parchment-200 bg-parchment-50 text-ink-600 hover:border-lavender-300 hover:bg-lavender-50'
                        }`}
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="eyebrow mb-3">{t('bible.newTestament')}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {NT_BOOKS.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => goToChapter(book, 1)}
                        className={`rounded-xl px-3 py-2.5 text-left text-d-body transition-all ${
                          book.name === selectedBook.name
                            ? 'bg-lavender-600 text-parchment-50 shadow-sm shadow-lavender-600/20'
                            : 'border border-parchment-200 bg-parchment-50 text-ink-600 hover:border-lavender-300 hover:bg-lavender-50'
                        }`}
                      >
                        {book.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showChapterPicker && (
              <div className="card mb-6 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-d-title font-semibold text-ink-800">
                    {t('bible.selectChapter', { book: selectedBook.name })}
                  </h3>
                  <button
                    onClick={() => setShowChapterPicker(false)}
                    className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => goToChapter(selectedBook, ch)}
                      className={`rounded-xl px-3 py-2.5 text-d-body font-medium transition-all ${
                        ch === chapter
                          ? 'bg-lavender-600 text-parchment-50 shadow-sm shadow-lavender-600/20'
                          : 'border border-parchment-200 bg-parchment-50 text-ink-600 hover:border-lavender-300 hover:bg-lavender-50'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showBookmarks && (
              <div className="card mb-6 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-d-title font-semibold text-ink-800">{t('bible.yourBookmarks')}</h2>
                  <button
                    onClick={() => setShowBookmarks(false)}
                    className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {bookmarks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-parchment-300 bg-parchment-100/40 px-5 py-8 text-center">
                    <Bookmark className="mx-auto mb-3 h-6 w-6 text-ink-300" />
                    <p className="text-d-body text-ink-500">{t('bible.noBookmarks')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map((bm) => {
                      const book = BIBLE_BOOKS.find((b) => b.name === bm.book);
                      return (
                        <div key={bm.id} className="group flex items-start gap-3 rounded-xl border border-parchment-200 bg-parchment-50/60 p-4 transition-colors hover:border-lavender-200 hover:bg-parchment-50">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15">
                            <Star className="h-4 w-4 text-gold-500" fill="currentColor" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => book && goToBookmark(book, bm.chapter)}
                              className="text-d-body font-medium text-lavender-700 hover:text-lavender-800"
                            >
                              {bm.book} {bm.chapter}:{bm.verse}
                            </button>
                            <p className="mt-1 font-display text-d-body leading-relaxed text-ink-600 line-clamp-2">{bm.text}</p>
                          </div>
                          <button
                            onClick={() => removeBookmark(bm.id)}
                            className="shrink-0 rounded-full p-2 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={t('bible.removeBookmark')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="card p-6 sm:p-10">
                <VerseSkeleton />
              </div>
            ) : error ? (
              <div className="card border-red-200/60 bg-red-50/40 px-6 py-10 text-center">
                <p className="text-d-body text-red-700">{error}</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="border-b border-parchment-200 bg-gradient-to-b from-parchment-100/70 to-parchment-50 px-6 py-6 text-center sm:px-10 sm:py-8">
                  <p className="eyebrow mb-2">{selectedBook.testament === 'OT' ? t('bible.oldTestament') : t('bible.newTestament')}</p>
                  <h2 className="font-display text-d-headline font-semibold text-ink-800">
                    {selectedBook.name} {chapter}
                  </h2>
                  <p className="mt-1 text-d-label uppercase tracking-[0.18em] text-ink-400">{translation.label}</p>
                  <div className="mx-auto mt-5 flex max-w-md items-center gap-3">
                    <span className="text-d-label text-ink-400">{t('bible.progress')}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-parchment-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-lavender-500 to-gold-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-d-label font-medium text-ink-500">{progress}%</span>
                  </div>
                </div>

                <div ref={versesRef} className="max-h-[65vh] overflow-y-auto px-3 py-4 sm:px-8 sm:py-6">
                  <div className="space-y-1">
                    {verses.map((v) => (
                      <div
                        key={v.verse}
                        className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-all hover:bg-parchment-100/70 sm:gap-4 sm:px-4 ${
                          isBookmarked(v) ? 'bg-gold-400/10 ring-1 ring-inset ring-gold-400/30' : ''
                        }`}
                      >
                        <span className="mt-1 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-parchment-200/70 px-2 text-d-label font-semibold text-ink-500 group-hover:bg-lavender-100 group-hover:text-lavender-700">
                          {v.verse}
                        </span>
                        <p className="flex-1 font-display text-d-title leading-[1.8] text-ink-700">
                          {v.text}
                        </p>
                        <div className="mt-0.5 flex shrink-0 items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                          <button
                            onClick={() => toggleBookmark(v)}
                            className={`rounded-full p-2 transition-colors ${
                              isBookmarked(v)
                                ? 'bg-gold-400/15 text-gold-600 opacity-100'
                                : 'text-ink-400 hover:bg-parchment-200 hover:text-gold-600'
                            }`}
                            aria-label={isBookmarked(v) ? t('bible.removeBookmark') : t('bible.addBookmark')}
                          >
                            <Bookmark className="h-4 w-4" fill={isBookmarked(v) ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => copyVerse(v)}
                            className="rounded-full p-2 text-ink-400 transition-colors hover:bg-parchment-200 hover:text-lavender-700"
                            aria-label={t('bible.copyVerse')}
                          >
                            {copiedVerse === v.verse ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-parchment-200 bg-parchment-100/30 px-4 py-4 sm:px-8">
                  <button
                    onClick={() => {
                      userNavigated.current = true;
                      if (chapter > 1) {
                        setChapter(chapter - 1);
                      } else {
                        const idx = BIBLE_BOOKS.findIndex((b) => b.name === selectedBook.name);
                        if (idx > 0) {
                          const prevBook = BIBLE_BOOKS[idx - 1];
                          setSelectedBook(prevBook);
                          setChapter(prevBook.chapters);
                        }
                      }
                    }}
                    disabled={loading || (selectedBook.name === 'Genesis' && chapter === 1)}
                    className="inline-flex items-center gap-2 rounded-full border border-parchment-200 bg-parchment-50 px-4 py-2.5 text-d-body font-medium text-ink-600 transition-all hover:border-lavender-300 hover:text-lavender-700 disabled:opacity-30 disabled:hover:border-parchment-200 disabled:hover:text-ink-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('common.previous')}
                  </button>
                  <p className="hidden text-d-label font-medium uppercase tracking-wide text-ink-400 sm:block">
                    {selectedBook.name} {chapter}
                  </p>
                  <button
                    onClick={() => {
                      userNavigated.current = true;
                      if (chapter < selectedBook.chapters) {
                        setChapter(chapter + 1);
                      } else {
                        const idx = BIBLE_BOOKS.findIndex((b) => b.name === selectedBook.name);
                        if (idx < BIBLE_BOOKS.length - 1) {
                          const nextBook = BIBLE_BOOKS[idx + 1];
                          setSelectedBook(nextBook);
                          setChapter(1);
                        }
                      }
                    }}
                    disabled={loading || (selectedBook.name === 'Revelation' && chapter === selectedBook.chapters)}
                    className="inline-flex items-center gap-2 rounded-full border border-parchment-200 bg-parchment-50 px-4 py-2.5 text-d-body font-medium text-ink-600 transition-all hover:border-lavender-300 hover:text-lavender-700 disabled:opacity-30 disabled:hover:border-parchment-200 disabled:hover:text-ink-600"
                  >
                    {t('common.next')}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
