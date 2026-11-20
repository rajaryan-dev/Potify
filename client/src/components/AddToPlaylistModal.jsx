import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';
import CoverImage from './CoverImage';
import { playlistApi, getErrorMessage } from '../api';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';

export default function AddToPlaylistModal({ song, onClose }) {
  const { playlists, refreshPlaylists } = useLibrary();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(playlistId, playlistName) {
    setBusy(true);
    try {
      await playlistApi.addSong(playlistId, song._id);
      toast(`Added to ${playlistName}`);
      await refreshPlaylists();
      onClose();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
      setBusy(false);
    }
  }

  async function createAndAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const { playlist } = await playlistApi.create({ name: newName.trim() });
      await playlistApi.addSong(playlist._id, song._id);
      toast(`Added to ${playlist.name}`);
      await refreshPlaylists();
      onClose();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
      setBusy(false);
    }
  }

  return (
    <Modal title="Add to playlist" onClose={onClose}>
      <p className="mb-3 truncate text-sm text-muted">
        {song.title} · {song.artist}
      </p>
      {creating ? (
        <form onSubmit={createAndAdd} className="mb-3 flex gap-2">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New playlist name" maxLength={100}
            className="min-w-0 flex-1 rounded-md bg-hover px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white" />
          <button disabled={busy || !newName.trim()} className="rounded-full bg-brand px-4 text-sm font-bold text-black disabled:opacity-50">
            Create
          </button>
        </form>
      ) : (
        <button onClick={() => setCreating(true)} className="mb-3 flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-hover">
          <span className="flex h-10 w-10 items-center justify-center rounded bg-hover"><Plus size={18} /></span>
          <span className="font-semibold">New playlist</span>
        </button>
      )}
      <ul className="space-y-1">
        {playlists.map((p) => (
          <li key={p._id}>
            <button disabled={busy} onClick={() => add(p._id, p.name)} className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-hover disabled:opacity-60">
              <CoverImage src={p.coverImage} alt="" seed={p.name} className="h-10 w-10 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="block text-xs text-muted">{p.songCount} songs</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {playlists.length === 0 && !creating && <p className="text-sm text-muted">You have no playlists yet. Create one above.</p>}
    </Modal>
  );
}
