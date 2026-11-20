import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, Home, Library, Music2, Plus, Search, Upload } from 'lucide-react';
import CoverImage from './CoverImage';
import PlaylistFormModal from './PlaylistFormModal';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { playlistApi } from '../api';

const link = ({ isActive }) =>
  `flex items-center gap-4 rounded-md px-3 py-2 text-sm font-bold transition ${isActive ? 'text-white' : 'text-muted hover:text-white'}`;

export default function Sidebar() {
  const { user } = useAuth();
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
    <aside className="hidden w-64 shrink-0 flex-col gap-2 p-2 md:flex lg:w-72">
      <nav className="rounded-lg bg-panel p-3" aria-label="Main">
        <div className="mb-3 flex items-center gap-2 px-3 py-1 text-lg font-extrabold">
          <Music2 className="text-brand" /> Potify
        </div>
        <NavLink to="/" end className={link}><Home size={22} /> Home</NavLink>
        <NavLink to="/search" className={link}><Search size={22} /> Search</NavLink>
        {user?.role === 'artist' && <NavLink to="/artist" className={link}><Upload size={22} /> Upload music</NavLink>}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-panel p-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <NavLink to="/library" className={link}><Library size={22} /> Your Library</NavLink>
          <button onClick={() => setCreating(true)} aria-label="Create playlist" className="rounded-full p-2 text-muted transition hover:bg-hover hover:text-white">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          <NavLink to="/liked" className={({ isActive }) => `flex items-center gap-3 rounded-md p-2 hover:bg-hover ${isActive ? 'bg-hover' : ''}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded bg-gradient-to-br from-indigo-600 to-slate-300">
              <Heart size={20} fill="white" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">Liked Songs</span>
              <span className="block text-xs text-muted">{likedIds.size} songs</span>
            </span>
          </NavLink>
          {playlists.map((p) => (
            <NavLink key={p._id} to={`/playlist/${p._id}`} className={({ isActive }) => `flex items-center gap-3 rounded-md p-2 hover:bg-hover ${isActive ? 'bg-hover' : ''}`}>
              <CoverImage src={p.coverImage} alt="" seed={p.name} className="h-12 w-12 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{p.name}</span>
                <span className="block text-xs text-muted">Playlist · {p.songCount} songs</span>
              </span>
            </NavLink>
          ))}
          {playlists.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted">Create your first playlist with the + button.</p>
          )}
        </div>
      </div>
      {creating && <PlaylistFormModal onSubmit={create} onClose={() => setCreating(false)} />}
    </aside>
  );
}
