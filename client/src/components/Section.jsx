import { Loading, ErrorState } from './States';

// Titled block that handles its own loading/error state. `children` renders when data is ready.
export default function Section({ title, action, loading, error, onRetry, children }) {
  return (
    <section className="fade-in mb-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {action}
      </div>
      {loading ? <Loading className="py-8" /> : error ? <ErrorState message={error} onRetry={onRetry} /> : children}
    </section>
  );
}

// Horizontal scroller for card rows
export function CardRow({ children }) {
  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      {Array.isArray(children)
        ? children.map((c, i) => (
            <div key={c?.key ?? i} className="w-36 shrink-0 sm:w-44">
              {c}
            </div>
          ))
        : children}
    </div>
  );
}
