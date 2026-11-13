import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-parchment-200 bg-parchment-100/50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-lavender-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lavender-600 text-parchment-50">
              <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <span className="font-display text-d-title font-semibold text-ink-800">{t('common.appName')}</span>
          </div>
          <p className="max-w-md text-d-body text-ink-500">
            {t('footer.tagline')}
          </p>
          <p className="text-d-label text-ink-400">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
