

interface SkeletonProps {
  className?: string;
  /** Show circular (avatar) skeleton */
  circle?: boolean;
  /** Simple text line width in % or px */
  width?: string;
  height?: string;
  count?: number;
}

function SkeletonItem({ className = '', circle = false, width, height }: SkeletonProps) {
  return (
    <div
      className={[
        'relative overflow-hidden',
        'bg-surface-hover',
        circle ? 'rounded-full' : 'rounded-md',
        className,
      ].join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  );
}

export function Skeleton({ count = 1, className = '', circle, width, height }: SkeletonProps) {
  if (count === 1) return <SkeletonItem className={className} circle={circle} width={width} height={height} />;
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} className={className} circle={circle} width={width} height={height} />
      ))}
    </div>
  );
}

/** Pre-built skeleton for a song card row */
export function SongCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-8 w-8 shrink-0" circle />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3" width="60%" />
        <Skeleton className="h-2.5" width="40%" />
      </div>
    </div>
  );
}
