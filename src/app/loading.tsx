export default function Loading() {
  return (
    <div className="container-full py-10 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-8">
        <div className="skeleton h-3 w-12 rounded" />
        <div className="skeleton h-3 w-3 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>

      {/* Hero skeleton */}
      <div className="skeleton h-10 w-64 rounded-lg mb-4" />
      <div className="skeleton h-5 w-96 rounded-lg mb-10" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="skeleton aspect-product" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-5 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
