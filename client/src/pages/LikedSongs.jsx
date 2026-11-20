import { Heart, Play } from 'lucide-react';
import SongList from '../components/SongList';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { likeApi } from '../api';
import useFetch from '../utils/useFetch';
import { plural } from '../utils/format';

export default function LikedSongs() {
  const { likedIds, ready } = useLibrary();
  const { playSong } = usePlayer();
  const liked = useFetch(() => likeApi.list());

  if (liked.loading) return <Loading />;
  if (liked.error) return <ErrorState message={liked.error} onRetry={liked.reload} />;

  // un-liking a song here removes it from the list straight away
  const songs = liked.data.songs.filter((s) => !ready || likedIds.has(s._id));

  return (
    <div className="fade-in">
      <div className="-mx-4 mb-6 flex items-end gap-5 bg-gradient-to-b from-indigo-800/70 to-transparent px-4 pb-6 pt-6 md:-mx-8 md:px-8">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-slate-300 shadow-2xl md:h-48 md:w-48">
          <Heart size={64} fill="white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase">Playlist</p>
          <h1 className="text-3xl font-extrabold md:text-6xl">Liked Songs</h1>
          <p className="mt-2 text-sm text-muted">{plural(songs.length, 'song')}</p>
        </div>
      </div>
      {songs.length ? (
        <>
          <button onClick={() => playSong(songs[0], songs)} aria-label="Play all liked songs" className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-black transition hover:scale-105 hover:bg-brand-light">
            <Play size={26} fill="currentColor" className="ml-1" />
          </button>
          <SongList songs={songs} />
        </>
      ) : (
        <EmptyState icon={Heart} title="Songs you like will appear here" hint="Tap the heart on any song to save it." />
      )}
    </div>
  );
}
