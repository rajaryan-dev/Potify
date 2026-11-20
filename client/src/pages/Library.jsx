import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Heart, ListMusic, Plus } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import SongList from '../components/SongList';
import PlaylistFormModal from '../components/PlaylistFormModal';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { likeApi, musicApi, playlistApi } from '../api';
import useFetch from '../utils/useFetch';
import { plural } from '../utils/format';

const TABS = [['playlists', 'Playlists'], ['liked', 'Liked Songs'], ['recent', 'Recently played']];

export default function Library() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'playlists';

  return (
    <div className="pt-2">
      <h1 className="mb-4 text-3xl font-extrabold">Your Library</h1>
      <div className="mb-6 flex gap-2 overflow-x-auto" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setParams({ tab: key })}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === key ? 'bg-white text-black' : 'bg-elevated hover:bg-hover'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'playlists' && <PlaylistsTab />}
      {tab === 'liked' && <LikedTab />}
      {tab === 'recent' && <RecentTab />}
    </div>
  );
}

function PlaylistsTab() {
  const { playlists, likedIds, refreshPlaylists } = useLibrary();
  const toast = useToast();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  async function create(values) {
    const { playlist } = await playlistApi.create(values);
    await refreshPlaylists();
    toast('Playlist created');
    navigate(`/playlist/${playlist._id}`);
  }

  return (
    <>
      <button onClick={() => setCreating(true)} className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-bold text-black transition hover:scale-105 hover:bg-brand-light">
        <Plus size={18} /> Create playlist
      </button>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MediaCard to="/liked" title="Liked Songs" subtitle={`Playlist · ${plural(likedIds.size, 'song')}`} image="" seed="liked" />
        {playlists.map((p) => (
          <MediaCard key={p._id} to={`/playlist/${p._id}`} image={p.coverImage} title={p.name} subtitle={`${p.isPublic ? 'Public' : 'Private'} · ${plural(p.songCount, 'song')}`} />
        ))}
      </div>
      {playlists.length === 0 && (
        <EmptyState icon={ListMusic} title="No playlists yet" hint="Create a playlist, then add songs with the + button on any song." />
      )}
      {creating && <PlaylistFormModal onSubmit={create} onClose={() => setCreating(false)} />}
    </>
  );
}

function LikedTab() {
  const { likedIds, ready } = useLibrary();
  const liked = useFetch(() => likeApi.list());
  if (liked.loading) return <Loading />;
  if (liked.error) return <ErrorState message={liked.error} onRetry={liked.reload} />;
  const songs = liked.data.songs.filter((s) => !ready || likedIds.has(s._id));
  return songs.length ? <SongList songs={songs} /> : <EmptyState icon={Heart} title="No liked songs yet" hint="Tap the heart on a song to save it here." />;
}

function RecentTab() {
  const recent = useFetch(() => musicApi.recent());
  if (recent.loading) return <Loading />;
  if (recent.error) return <ErrorState message={recent.error} onRetry={recent.reload} />;
  const songs = recent.data.songs;
  return songs.length ? <SongList songs={songs} /> : <EmptyState icon={Clock} title="Nothing played yet" hint="Songs you play will appear here." />;
}
