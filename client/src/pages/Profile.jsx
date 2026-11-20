import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ErrorState, Loading } from '../components/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userApi, getErrorMessage } from '../api';
import useFetch from '../utils/useFetch';
import { plural } from '../utils/format';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const profile = useFetch(() => userApi.profile());
  const [username, setUsername] = useState(user.username);
  const [image, setImage] = useState(user.profileImage || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(user.username);
    setImage(user.profileImage || '');
  }, [user]);

  async function save(e) {
    e.preventDefault();
    setError('');
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username.trim())) return setError('Username must be 3-30 characters: letters, numbers, . _ -');
    setSaving(true);
    try {
      const d = await userApi.update({ username: username.trim(), profileImage: image.trim() });
      setUser(d.user);
      toast('Profile updated');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    toast('Logged out');
    navigate('/login');
  }

  const stats = profile.data?.stats;

  return (
    <div className="fade-in pt-2">
      <div className="-mx-4 mb-8 flex flex-col items-center gap-5 bg-gradient-to-b from-slate-700/60 to-transparent px-4 pb-6 pt-6 sm:flex-row sm:items-end md:-mx-8 md:px-8">
        <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated text-6xl font-bold shadow-2xl md:h-48 md:w-48">
          {user.profileImage ? <img src={user.profileImage} alt={`${user.username}'s avatar`} className="h-full w-full object-cover" /> : user.username[0].toUpperCase()}
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-xs font-bold uppercase">Profile · {user.role === 'artist' ? 'Artist' : 'Listener'}</p>
          <h1 className="break-words text-3xl font-extrabold md:text-6xl">{user.username}</h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
        </div>
      </div>

      <h2 className="mb-3 text-xl font-bold">Listening activity</h2>
      {profile.loading ? <Loading /> : profile.error ? <ErrorState message={profile.error} onRetry={profile.reload} /> : (
        <>
          <div className="mb-4 grid max-w-xl grid-cols-3 gap-3">
            {[['Liked songs', stats.likedSongs], ['Playlists', stats.playlists], ['Recently played', stats.recentlyPlayed]].map(([label, n]) => (
              <div key={label} className="rounded-lg bg-panel p-4 text-center">
                <p className="text-2xl font-extrabold">{n}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
          {profile.data.topGenres.length > 0 ? (
            <p className="mb-8 text-sm text-muted">
              Top genres lately:{' '}
              {profile.data.topGenres.map((g) => (
                <span key={g.genre} className="mr-2 inline-block rounded-full bg-elevated px-3 py-1 text-white">{g.genre} · {plural(g.count, 'play')}</span>
              ))}
            </p>
          ) : (
            <p className="mb-8 text-sm text-muted">Play some songs to see your top genres here.</p>
          )}
        </>
      )}

      <h2 className="mb-3 text-xl font-bold">Edit profile</h2>
      <form onSubmit={save} className="mb-8 max-w-md space-y-4" noValidate>
        <label className="block text-sm font-semibold">
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-md bg-hover px-3 py-2.5 font-normal outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white" />
        </label>
        <label className="block text-sm font-semibold">
          Profile image URL <span className="font-normal text-muted">(optional)</span>
          <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="mt-1 w-full rounded-md bg-hover px-3 py-2.5 font-normal outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white" />
        </label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button disabled={saving} className="rounded-full bg-brand px-6 py-2.5 font-bold text-black transition hover:scale-105 hover:bg-brand-light disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        {user.role === 'artist' && <Link to="/artist" className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold hover:border-white">Upload music</Link>}
        <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold hover:border-red-400 hover:text-red-400">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </div>
  );
}
