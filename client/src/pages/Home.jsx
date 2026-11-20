import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Section, { CardRow } from '../components/Section';
import SongCard from '../components/SongCard';
import MediaCard from '../components/MediaCard';
import { EmptyState } from '../components/States';
import { useAuth } from '../context/AuthContext';
import { musicApi, playlistApi } from '../api';
import useFetch from '../utils/useFetch';
import { greeting, plural } from '../utils/format';

export default function Home() {
  const { user } = useAuth();
  const recent = useFetch(() => musicApi.recent());
  const recommended = useFetch(() => musicApi.recommended());
  const artists = useFetch(() => musicApi.artists());
  const featured = useFetch(() => playlistApi.featured());

  const recentSongs = recent.data?.songs || [];
  const recSongs = recommended.data?.songs || [];

  return (
    <div className="pt-2">
      <h1 className="mb-6 text-3xl font-extrabold">{greeting()}, {user.username}</h1>

      <Section title="Recently played" loading={recent.loading} error={recent.error} onRetry={recent.reload}>
        {recentSongs.length ? (
          <CardRow>{recentSongs.slice(0, 10).map((s) => <SongCard key={s._id} song={s} queue={recentSongs} />)}</CardRow>
        ) : (
          <EmptyState icon={Clock} title="Nothing played yet" hint="Play a song and it will show up here." />
        )}
      </Section>

      <Section
        title="Recommended for you"
        loading={recommended.loading}
        error={recommended.error}
        onRetry={recommended.reload}
        action={<button onClick={recommended.reload} className="text-sm font-semibold text-muted hover:text-white">Shuffle picks</button>}
      >
        {recSongs.length ? (
          <CardRow>{recSongs.map((s) => <SongCard key={s._id} song={s} queue={recSongs} />)}</CardRow>
        ) : (
          <EmptyState title="No songs yet" hint="Run npm run seed to load demo songs." />
        )}
      </Section>

      <Section title="Popular artists" loading={artists.loading} error={artists.error} onRetry={artists.reload}>
        {artists.data?.artists.length ? (
          <CardRow>
            {artists.data.artists.map((a) => (
              <MediaCard key={a.name} round to={`/search?q=${encodeURIComponent(a.name)}`} image={a.coverImage} title={a.name} subtitle={`Artist · ${plural(a.songCount, 'song')}`} />
            ))}
          </CardRow>
        ) : (
          <EmptyState title="No artists yet" />
        )}
      </Section>

      <Section title="Featured playlists" loading={featured.loading} error={featured.error} onRetry={featured.reload}
        action={<Link to="/library" className="text-sm font-semibold text-muted hover:text-white">Your library</Link>}>
        {featured.data?.playlists.length ? (
          <CardRow>
            {featured.data.playlists.map((p) => (
              <MediaCard key={p._id} to={`/playlist/${p._id}`} image={p.coverImage} title={p.name} subtitle={`${p.owner?.username ? `By ${p.owner.username} · ` : ''}${plural(p.songCount, 'song')}`} />
            ))}
          </CardRow>
        ) : (
          <EmptyState title="No featured playlists" hint="Public playlists with songs show up here." />
        )}
      </Section>
    </div>
  );
}
