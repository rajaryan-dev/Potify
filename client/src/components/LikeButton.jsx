import { Heart } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

export default function LikeButton({ song, size = 18, className = '' }) {
  const { likedIds, toggleLike } = useLibrary();
  const liked = likedIds.has(song._id);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(song);
      }}
      aria-pressed={liked}
      aria-label={liked ? `Remove ${song.title} from Liked Songs` : `Add ${song.title} to Liked Songs`}
      className={`rounded-full p-1.5 transition hover:scale-110 ${liked ? 'text-brand' : 'text-muted hover:text-white'} ${className}`}
    >
      <Heart size={size} fill={liked ? 'currentColor' : 'none'} />
    </button>
  );
}
