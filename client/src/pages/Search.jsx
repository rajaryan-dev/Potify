import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, SearchX, X } from 'lucide-react';
import SongList from '../components/SongList';
import MediaCard from '../components/MediaCard';
import Section from '../components/Section';
import { EmptyState, ErrorState, Loading } from '../components/States';
import { musicApi } from '../api';
import useFetch from '../utils/useFetch';
import { plural } from '../utils/format';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const genre = params.get('genre') || '';
  const [input, setInput] = useState(q);

  // keep the box in sync when the URL changes (e.g. clicking an artist card)
  useEffect(() => setInput(q), [q]);

  // live search: update the URL 300ms after the user stops typing
  useEffect(() => {
    if (input === q) return;
    const t = setTimeout(() => setParams(input.trim() ? { q: input.trim() } : {}, { replace: true }), 300);
    return () => clearTimeout(t);
  }, [input, q, setParams]);

  const results = useFetch(() => (q ? musicApi.search(q) : musicApi.list({ genre: genre || undefined, limit: 50 })), [q, genre]);
  const genres = useFetch(() => musicApi.genres());

  const songs = results.data?.songs || [];
  const artists = q ? results.data?.artists || [] : [];
  const albums = q ? results.data?.albums || [] : [];
  const noResults = q && !results.loading && !results.error && !songs.length && !artists.length && !albums.length;

  return (
    <div className="pt-2">
      <div className="relative mb-6 max-w-xl">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search songs, artists or albums"
          aria-label="Search"
          autoFocus
          className="w-full rounded-full bg-elevated py-3 pl-12 pr-10 outline-none ring-1 ring-white/10 transition focus:ring-2 focus:ring-white [&::-webkit-search-cancel-button]:hidden"
        />
        {input && (
          <button onClick={() => { setInput(''); setParams({}); }} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {!q && genres.data?.genres.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Genres">
          {['', ...genres.data.genres].map((g) => (
            <button
              key={g || 'all'}
              onClick={() => setParams(g ? { genre: g } : {})}
              aria-pressed={genre === g}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${genre === g ? 'bg-white text-black' : 'bg-elevated hover:bg-hover'}`}
            >
              {g || 'All'}
            </button>
          ))}
        </div>
      )}

      {results.loading ? (
        <Loading label="Searching…" />
      ) : results.error ? (
        <ErrorState message={results.error} onRetry={results.reload} />
      ) : noResults ? (
        <EmptyState icon={SearchX} title={`No results for “${q}”`} hint="Check the spelling or try a different title, artist or album." />
      ) : (
        <>
          {artists.length > 0 && (
            <Section title="Artists">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {artists.map((a) => (
                  <MediaCard key={a.name} round to={`/search?q=${encodeURIComponent(a.name)}`} image={a.coverImage} title={a.name} subtitle={`Artist · ${plural(a.songCount, 'song')}`} />
                ))}
              </div>
            </Section>
          )}
          {albums.length > 0 && (
            <Section title="Albums">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {albums.map((a) => (
                  <MediaCard key={`${a.name}-${a.artist}`} to={`/search?q=${encodeURIComponent(a.name)}`} image={a.coverImage} title={a.name} subtitle={`${a.artist} · ${plural(a.songCount, 'song')}`} />
                ))}
              </div>
            </Section>
          )}
          <Section title={q ? 'Songs' : genre ? genre : 'Browse all'}>
            {songs.length ? <SongList songs={songs} /> : <EmptyState title="No songs found" hint={q ? undefined : 'Run npm run seed to load demo songs.'} />}
          </Section>
        </>
      )}
    </div>
  );
}
