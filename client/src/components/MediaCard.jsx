import { Link } from 'react-router-dom';
import CoverImage from './CoverImage';

// Generic card for playlists, artists and albums (links somewhere).
export default function MediaCard({ to, image, title, subtitle, round = false, seed }) {
  return (
    <Link to={to} className="group block rounded-lg bg-panel p-3 transition hover:bg-elevated focus-visible:outline-2 focus-visible:outline-brand">
      <CoverImage src={image} alt="" seed={seed || title} round={round} className="mb-3 aspect-square w-full shadow-lg" />
      <h3 className="truncate text-sm font-bold">{title}</h3>
      <p className="truncate text-xs text-muted">{subtitle}</p>
    </Link>
  );
}
