import { AlertCircle, Loader2 } from 'lucide-react';

export function Loading({ label = 'Loading…', className = 'py-16' }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-muted ${className}`} role="status">
      <Loader2 className="animate-spin" size={20} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-panel px-6 py-10 text-center" role="alert">
      <AlertCircle className="text-red-400" size={28} />
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-full border border-white/30 px-5 py-1.5 text-sm font-semibold hover:border-white">
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg px-6 py-12 text-center">
      {Icon && <Icon size={36} className="text-muted" />}
      <h3 className="text-lg font-bold">{title}</h3>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      {children}
    </div>
  );
}
