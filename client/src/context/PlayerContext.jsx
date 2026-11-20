import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { musicApi } from '../api';

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

const loadVolume = () => {
  try {
    const v = parseFloat(localStorage.getItem('player:volume'));
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), 1) : 0.8;
  } catch {
    return 0.8;
  }
};

/**
 * One <audio> element lives here, above the router outlet, so playback continues while
 * the user navigates between pages.
 */
export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const recordedRef = useRef(null); // song id whose play has been reported
  const historyRef = useRef([]); // previously played indexes (used by shuffle + previous)

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(loadVolume);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'
  const [error, setError] = useState(null);

  // Event handlers are registered once, so they read the latest state from this ref.
  const live = useRef({});
  live.current = { queue, index, shuffle, repeat };
  const current = index >= 0 ? queue[index] : null;

  const startTrack = useCallback((song) => {
    const audio = audioRef.current;
    recordedRef.current = null;
    setError(null);
    setCurrentTime(0);
    setDuration(song.duration || 0);
    setBuffering(true);
    audio.src = song.uri;
    audio.play().catch((err) => {
      if (err.name === 'AbortError') return; // a newer track replaced this one
      setBuffering(false);
      setIsPlaying(false);
      setError(
        err.name === 'NotAllowedError'
          ? 'Playback was blocked by the browser. Press play to start.'
          : 'This track could not be played (audio unavailable).'
      );
    });
  }, []);

  const goTo = useCallback(
    (i, list = live.current.queue, { remember = true } = {}) => {
      if (remember && live.current.index >= 0) historyRef.current.push(live.current.index);
      setQueue(list);
      setIndex(i);
      live.current = { ...live.current, queue: list, index: i };
      startTrack(list[i]);
    },
    [startTrack]
  );

  const pickNext = useCallback((auto) => {
    const { queue: q, index: i, shuffle: sh, repeat: rep } = live.current;
    if (!q.length) return -1;
    if (sh && q.length > 1) {
      let n;
      do n = Math.floor(Math.random() * q.length);
      while (n === i);
      return n;
    }
    if (i < q.length - 1) return i + 1;
    if (rep === 'all' || !auto) return 0; // manual "next" at the end wraps around
    return -1; // reached the end with repeat off
  }, []);

  const next = useCallback(() => {
    const n = pickNext(false);
    if (n >= 0) goTo(n);
  }, [pickNext, goTo]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    const { queue: q, index: i, repeat: rep } = live.current;
    if (!q.length) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (historyRef.current.length) {
      goTo(historyRef.current.pop(), q, { remember: false });
    } else if (i > 0) {
      goTo(i - 1, q, { remember: false });
    } else if (rep === 'all') {
      goTo(q.length - 1, q, { remember: false });
    } else {
      audio.currentTime = 0;
    }
  }, [goTo]);

  const playSong = useCallback(
    (song, list = [song]) => {
      const { queue: q, index: i } = live.current;
      const isCurrent = i >= 0 && q[i]?._id === song._id;
      if (isCurrent && !audioRef.current.error) {
        const audio = audioRef.current;
        audio.paused ? audio.play().catch(() => {}) : audio.pause();
        return;
      }
      const idx = Math.max(list.findIndex((s) => s._id === song._id), 0);
      historyRef.current = [];
      goTo(idx, list, { remember: false });
    },
    [goTo]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const { queue: q, index: i } = live.current;
    if (i < 0) return;
    if (audio.error || !audio.src) {
      startTrack(q[i]);
      return;
    }
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }, [startTrack]);

  const seek = useCallback((t) => {
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    setMuted(v === 0);
    try {
      localStorage.setItem('player:volume', String(v));
    } catch {
      /* storage unavailable: ignore */
    }
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')),
    []
  );

  // Create the audio element once and wire up its events
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const on = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => Number.isFinite(audio.duration) && setDuration(audio.duration),
      durationchange: () => Number.isFinite(audio.duration) && setDuration(audio.duration),
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      waiting: () => setBuffering(true),
      canplay: () => setBuffering(false),
      playing: () => {
        setBuffering(false);
        const { queue: q, index: i } = live.current;
        const song = q[i];
        if (song && recordedRef.current !== song._id) {
          recordedRef.current = song._id;
          musicApi.recordPlay(song._id, audio.duration).catch(() => {});
        }
      },
      ended: () => {
        if (live.current.repeat === 'one') {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return;
        }
        const n = pickNext(true);
        if (n >= 0) goTo(n);
        else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      },
      error: () => {
        if (!audio.getAttribute('src')) return;
        setBuffering(false);
        setIsPlaying(false);
        setError('This track could not be played (audio unavailable).');
      },
    };
    Object.entries(on).forEach(([e, fn]) => audio.addEventListener(e, fn));

    return () => {
      Object.entries(on).forEach(([e, fn]) => audio.removeEventListener(e, fn));
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, [goTo, pickNext]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  // OS-level media controls (lock screen, media keys)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (current && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.artist,
        album: current.album || '',
        artwork: current.coverImage ? [{ src: current.coverImage }] : [],
      });
    }
    navigator.mediaSession.setActionHandler('play', togglePlay);
    navigator.mediaSession.setActionHandler('pause', togglePlay);
    navigator.mediaSession.setActionHandler('previoustrack', previous);
    navigator.mediaSession.setActionHandler('nexttrack', next);
  }, [current, togglePlay, previous, next]);

  // Space toggles play/pause unless the user is typing or focused on a control
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat) return;
      const tag = e.target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(tag) || e.target?.isContentEditable) return;
      if (live.current.index < 0) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  const value = useMemo(
    () => ({
      current, queue, isPlaying, buffering, currentTime, duration, volume, muted, shuffle, repeat, error,
      playSong, togglePlay, next, previous, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat,
    }),
    [current, queue, isPlaying, buffering, currentTime, duration, volume, muted, shuffle, repeat, error,
      playSong, togglePlay, next, previous, seek, setVolume, toggleMute, toggleShuffle, cycleRepeat]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
