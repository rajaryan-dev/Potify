import { Pause, Play } from 'lucide-react';
import CoverImage from './CoverImage';
import { usePlayer } from '../context/PlayerContext';

// Card that plays the song (within `queue`) when clicked.
export default function SongCard({ song, queue }) {
  const { current, isPlaying, playSong } = usePlayer();
  const active = current?._id === song._id;
  const playing = active && isPlaying;
  return (
    <div className="group relative rounded-lg bg-panel p-3 transition hover:bg-elevated">
      <div className="relative mb-3">
        <CoverImage src={song.coverImage} alt="" seed={song.title} className="aspect-square w-full shadow-lg" />
        <button
          onClick={() => playSong(song, queue)}
          aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
          className={`absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-black shadow-xl transition hover:scale-105 hover:bg-brand-light ${
            playing ? 'opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:opacity-100'
          } max-md:translate-y-0 max-md:opacity-100`}
        >
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>
      <h3 className={`truncate text-sm font-bold ${active ? 'text-brand' : ''}`}>{song.title}</h3>
      <p className="truncate text-xs text-muted">{song.artist}</p>
    </div>
  );
}
