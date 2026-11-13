import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-parchment-200 bg-parchment-100/50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-lavender-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lavender-600 text-parchment-50">
              <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <span className="font-display text-title font-semibold text-ink-800">Selah</span>
          </div>
          <p className="max-w-md text-body text-ink-500">
            A pause for the soul. Selah is a place to be heard, prayed for, and gently pointed
            toward something steadying.
          </p>
          <p className="text-label text-ink-400">
            Selah is not a substitute for professional counseling, medical care, or emergency
            services. If you are in crisis, please reach out to a crisis line or emergency
            services near you.
          </p>
        </div>
      </div>
    </footer>
  );
}
