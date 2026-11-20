import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, Globe, ListMusic, Lock, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import CoverImage from '../components/CoverImage';
import SongList from '../components/SongList';
import PlaylistFormModal from '../components/PlaylistFormModal';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { musicApi, playlistApi, getErrorMessage } from '../api';
import useFetch from '../utils/useFetch';
import { plural } from '../utils/format';

export default function PlaylistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshPlaylists } = useLibrary();
  const { playSong } = usePlayer();
  const [editing, setEditing] = useState(false);
  const detail = useFetch(() => playlistApi.get(id), [id]);

  if (detail.loading) return <Loading />;
  if (detail.error) return <ErrorState message={detail.error} onRetry={detail.reload} />;

  const playlist = detail.data.playlist;
  const songs = playlist.songs;

  async function removeSong(song) {
    try {
      await playlistApi.removeSong(id, song._id);
      toast(`Removed ${song.title}`);
      detail.reload();
      refreshPlaylists();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  }

  async function save(values) {
    await playlistApi.update(id, values);
    toast('Playlist updated');
    detail.reload();
    refreshPlaylists();
  }

  async function remove() {
    if (!window.confirm(`Delete “${playlist.name}”? This cannot be undone.`)) return;
    try {
      await playlistApi.remove(id);
      await refreshPlaylists();
      toast('Playlist deleted');
      navigate('/library');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="fade-in">
      <div className="-mx-4 mb-6 flex flex-col items-center gap-5 bg-gradient-to-b from-emerald-900/60 to-transparent px-4 pb-6 pt-6 sm:flex-row sm:items-end md:-mx-8 md:px-8">
        <CoverImage src={playlist.coverImage} alt="" seed={playlist.name} className="h-40 w-40 shrink-0 shadow-2xl md:h-52 md:w-52" />
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-xs font-bold uppercase">{playlist.isPublic ? 'Public playlist' : 'Private playlist'}</p>
          <h1 className="break-words text-3xl font-extrabold md:text-6xl">{playlist.name}</h1>
          {playlist.description && <p className="mt-2 text-sm text-muted">{playlist.description}</p>}
          <p className="mt-2 text-sm">
            <span className="font-semibold">{playlist.owner.username}</span>
            <span className="text-muted"> · {plural(songs.length, 'song')}</span>
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => songs.length && playSong(songs[0], songs)}
          disabled={!songs.length}
          aria-label="Play playlist"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-black transition hover:scale-105 hover:bg-brand-light disabled:opacity-40 disabled:hover:scale-100"
        >
          <Play size={26} fill="currentColor" className="ml-1" />
        </button>
        {playlist.isOwner && (
          <>
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:border-white">
              <Pencil size={16} /> Edit details
            </button>
            <button onClick={remove} className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:border-red-400 hover:text-red-400">
              <Trash2 size={16} /> Delete
            </button>
            <span className="flex items-center gap-1 text-xs text-muted">
              {playlist.isPublic ? <Globe size={14} /> : <Lock size={14} />} {playlist.isPublic ? 'Visible to everyone' : 'Only you can see this'}
            </span>
          </>
        )}
      </div>

      {songs.length ? (
        <SongList songs={songs} onRemove={playlist.isOwner ? removeSong : undefined} removeLabel="Remove from playlist:" />
      ) : (
        <EmptyState icon={ListMusic} title="This playlist is empty" hint={playlist.isOwner ? 'Add some songs below.' : undefined} />
      )}

      {playlist.isOwner && <AddSongsPanel playlistId={id} existingIds={songs.map((s) => s._id)} onChanged={() => { detail.reload(); refreshPlaylists(); }} />}
      {!playlist.isOwner && <Link to="/library" className="mt-6 inline-block text-sm text-muted hover:text-white">← Back to your library</Link>}
      {editing && <PlaylistFormModal initial={playlist} onSubmit={save} onClose={() => setEditing(false)} />}
    </div>
  );
}

function AddSongsPanel({ playlistId, existingIds, onChanged }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    let active = true;
    const t = setTimeout(() => {
      musicApi.search(q.trim()).then((d) => active && setResults(d.songs.slice(0, 8))).catch(() => active && setResults([]));
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [q]);

  async function add(song) {
    setBusyId(song._id);
    try {
      await playlistApi.addSong(playlistId, song._id);
      toast(`Added ${song.title}`);
      onChanged();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-10 border-t border-white/10 pt-6">
      <h2 className="mb-1 text-xl font-bold">Let&apos;s find something for your playlist</h2>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for songs to add"
        aria-label="Search songs to add"
        className="mt-3 w-full max-w-md rounded-full bg-elevated px-4 py-2.5 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white"
      />
      <ul className="mt-3 max-w-2xl">
        {results.map((s) => {
          const added = existingIds.includes(s._id);
          return (
            <li key={s._id} className="flex items-center gap-3 rounded-md p-2 hover:bg-white/10">
              <CoverImage src={s.coverImage} alt="" seed={s.title} className="h-10 w-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <p className="truncate text-xs text-muted">{s.artist}</p>
              </div>
              <button
                disabled={added || busyId === s._id}
                onClick={() => add(s)}
                className="flex items-center gap-1 rounded-full border border-white/30 px-4 py-1 text-sm font-semibold hover:border-white disabled:opacity-50"
              >
                {added ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add</>}
              </button>
            </li>
          );
        })}
        {q.trim() && results.length === 0 && <li className="p-2 text-sm text-muted">No matching songs.</li>}
      </ul>
    </section>
  );
}
