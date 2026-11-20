import { useState } from 'react';
import { ListPlus, Pause, Play, Trash2 } from 'lucide-react';
import CoverImage from './CoverImage';
import LikeButton from './LikeButton';
import AddToPlaylistModal from './AddToPlaylistModal';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/format';

export default function SongList({ songs, onRemove, removeLabel = 'Remove' }) {
  return (
    <div role="list">
      {songs.map((song, i) => (
        <SongRow key={song._id} song={song} index={i} queue={songs} onRemove={onRemove} removeLabel={removeLabel} />
      ))}
    </div>
  );
}

function SongRow({ song, index, queue, onRemove, removeLabel }) {
  const { current, isPlaying, playSong, duration } = usePlayer();
  const [adding, setAdding] = useState(false);
  const active = current?._id === song._id;
  const playing = active && isPlaying;

  return (
    <div
      role="listitem"
      onDoubleClick={() => playSong(song, queue)}
      className={`group flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-white/10 ${active ? 'bg-white/5' : ''}`}
    >
      <button
        onClick={() => playSong(song, queue)}
        aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-sm text-muted"
      >
        <span className={`${active ? 'hidden' : 'group-hover:hidden'}`}>{index + 1}</span>
        <span className={`${active ? 'flex' : 'hidden group-hover:flex'} text-white`}>
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </span>
      </button>
      <CoverImage src={song.coverImage} alt="" seed={song.title} className="h-10 w-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${active ? 'text-brand' : ''}`}>{song.title}</p>
        <p className="truncate text-xs text-muted">{song.artist}</p>
      </div>
      <p className="hidden w-1/4 truncate text-sm text-muted md:block">{song.album}</p>
      <LikeButton song={song} />
      <button onClick={() => setAdding(true)} aria-label={`Add ${song.title} to a playlist`} className="rounded-full p-1.5 text-muted hover:text-white">
        <ListPlus size={18} />
      </button>
      {onRemove && (
        <button onClick={() => onRemove(song)} aria-label={`${removeLabel} ${song.title}`} className="rounded-full p-1.5 text-muted hover:text-red-400">
          <Trash2 size={18} />
        </button>
      )}
      <span className="hidden w-12 text-right text-sm tabular-nums text-muted sm:block">{formatDuration(active && duration ? duration : song.duration)}</span>
      {adding && <AddToPlaylistModal song={song} onClose={() => setAdding(false)} />}
    </div>
  );
}
