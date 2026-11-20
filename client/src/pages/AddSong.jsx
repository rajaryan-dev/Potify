import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, Upload } from 'lucide-react';
import SongList from '../components/SongList';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { musicApi, getErrorMessage } from '../api';
import useFetch from '../utils/useFetch';

const EMPTY = { title: '', artist: '', album: '', genre: '', uri: '', coverImage: '' };
const input = 'mt-1 w-full rounded-md bg-hover px-3 py-2.5 font-normal outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white';

// Artists add songs by audio URL (no file hosting in this project) and manage their own uploads.
export default function AddSong() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ ...EMPTY, artist: user.username });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const mine = useFetch(() => musicApi.mine());
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (user.role !== 'artist') return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!/^https?:\/\//i.test(form.uri.trim())) return setError('Audio URL must start with http:// or https://');
    setSaving(true);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
      await musicApi.add(body);
      toast('Song added');
      setForm({ ...EMPTY, artist: user.username });
      mine.reload();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(song) {
    if (!window.confirm(`Delete “${song.title}” from the library for everyone?`)) return;
    try {
      await musicApi.remove(song._id);
      toast('Song deleted');
      mine.reload();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="fade-in pt-2">
      <h1 className="mb-1 text-3xl font-extrabold">Upload music</h1>
      <p className="mb-6 text-sm text-muted">Add a song by linking to a legally usable audio file (mp3, ogg, wav). Only add audio you have the rights to share.</p>

      <form onSubmit={submit} className="mb-10 grid max-w-2xl gap-4 sm:grid-cols-2" noValidate>
        <label className="text-sm font-semibold">Title *<input value={form.title} onChange={set('title')} className={input} /></label>
        <label className="text-sm font-semibold">Artist<input value={form.artist} onChange={set('artist')} className={input} /></label>
        <label className="text-sm font-semibold">Album<input value={form.album} onChange={set('album')} className={input} /></label>
        <label className="text-sm font-semibold">Genre<input value={form.genre} onChange={set('genre')} className={input} /></label>
        <label className="text-sm font-semibold sm:col-span-2">Audio URL *<input value={form.uri} onChange={set('uri')} placeholder="https://…/song.mp3" className={input} /></label>
        <label className="text-sm font-semibold sm:col-span-2">Cover image URL<input value={form.coverImage} onChange={set('coverImage')} placeholder="https://…" className={input} /></label>
        {error && <p role="alert" className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        <button disabled={saving} className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 font-bold text-black transition hover:scale-105 hover:bg-brand-light disabled:opacity-60 sm:col-span-2 sm:w-fit">
          <Upload size={18} /> {saving ? 'Adding…' : 'Add song'}
        </button>
      </form>

      <h2 className="mb-3 text-xl font-bold">Your uploads</h2>
      {mine.loading ? <Loading /> : mine.error ? <ErrorState message={mine.error} onRetry={mine.reload} /> : mine.data.songs.length ? (
        <SongList songs={mine.data.songs} onRemove={remove} removeLabel="Delete" />
      ) : (
        <EmptyState icon={Trash2} title="No uploads yet" hint="Songs you add will be listed here." />
      )}
    </div>
  );
}
