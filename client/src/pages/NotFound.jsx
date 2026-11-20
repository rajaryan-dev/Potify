import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-7xl font-extrabold text-brand">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <Link to="/" className="mt-2 rounded-full bg-white px-6 py-2.5 font-bold text-black transition hover:scale-105">Back to Home</Link>
    </div>
  );
}
