export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Top Banner Skeleton */}
      <div className="h-24 rounded-2xl bg-slate-200/70" />

      {/* Hero Stats Card Skeleton */}
      <div className="h-56 rounded-3xl bg-slate-200/80" />

      {/* Quick Action Bar Skeleton */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="h-12 rounded-2xl bg-slate-200/60" />
        <div className="h-12 rounded-2xl bg-slate-200/60" />
        <div className="h-12 rounded-2xl bg-slate-200/60" />
      </div>

      {/* Chart Skeleton */}
      <div className="h-60 rounded-3xl bg-slate-200/70" />

      {/* Activity Feed Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 rounded-xl bg-slate-200/60" />
        <div className="h-11 rounded-xl bg-slate-200/50" />
        <div className="space-y-2">
          <div className="h-16 rounded-2xl bg-slate-200/60" />
          <div className="h-16 rounded-2xl bg-slate-200/60" />
          <div className="h-16 rounded-2xl bg-slate-200/60" />
        </div>
      </div>
    </div>
  );
}
