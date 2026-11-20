import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { likeApi, playlistApi, getErrorMessage } from '../api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const LibraryContext = createContext(null);
export const useLibrary = () => useContext(LibraryContext);

// Holds the user's liked-song ids and playlists so every page can show like state / playlist menus.
export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [playlists, setPlaylists] = useState([]);
  const [ready, setReady] = useState(false);

  const refreshPlaylists = useCallback(async () => {
    const d = await playlistApi.mine();
    setPlaylists(d.playlists);
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([likeApi.list(), playlistApi.mine()])
      .then(([likes, pls]) => {
        if (!active) return;
        setLikedIds(new Set(likes.songs.map((s) => s._id)));
        setPlaylists(pls.playlists);
      })
      .catch((err) => active && toast(getErrorMessage(err, 'Could not load your library'), 'error'))
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [user, toast]);

  // Optimistic like/unlike with rollback on failure
  const toggleLike = useCallback(
    async (song) => {
      const wasLiked = likedIds.has(song._id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(song._id) : next.add(song._id);
        return next;
      });
      try {
        await (wasLiked ? likeApi.unlike(song._id) : likeApi.like(song._id));
        toast(wasLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs');
      } catch (err) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(song._id) : next.delete(song._id);
          return next;
        });
        toast(getErrorMessage(err), 'error');
      }
    },
    [likedIds, toast]
  );

  const value = useMemo(
    () => ({ likedIds, playlists, ready, toggleLike, refreshPlaylists }),
    [likedIds, playlists, ready, toggleLike, refreshPlaylists]
  );
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
