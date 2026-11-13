export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-parchment-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-parchment-200" />
        <div className="h-3 w-5/6 rounded bg-parchment-200" />
        <div className="h-3 w-4/6 rounded bg-parchment-200" />
      </div>
    </div>
  );
}

export function VerseSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-1 h-4 w-6 shrink-0 rounded bg-parchment-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full rounded bg-parchment-200" />
            <div className="h-4 w-5/6 rounded bg-parchment-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="card h-full p-6 animate-pulse">
      <div className="h-5 w-3/4 rounded bg-parchment-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-parchment-200" />
        <div className="h-3 w-2/3 rounded bg-parchment-200" />
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-parchment-200" />
    </div>
  );
}
