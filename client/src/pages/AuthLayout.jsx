import { Music2 } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-emerald-950/60 to-black px-4 py-10">
      <div className="fade-in w-full max-w-md rounded-2xl bg-panel p-8 shadow-2xl ring-1 ring-white/5">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Music2 size={40} className="text-brand" />
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-muted">{footer}</div>
      </div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <div className="mt-1">{children}</div>
      {error && <span role="alert" className="mt-1 block text-xs font-normal text-red-400">{error}</span>}
    </label>
  );
}

export const inputClass = (hasError) =>
  `w-full rounded-md bg-hover px-3 py-2.5 font-normal outline-none ring-1 transition focus:ring-2 focus:ring-white ${hasError ? 'ring-red-500' : 'ring-white/10'}`;
