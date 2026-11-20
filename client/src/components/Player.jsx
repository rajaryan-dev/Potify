import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react';
import CoverImage from './CoverImage';
import LikeButton from './LikeButton';
import RangeSlider from './RangeSlider';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/format';

const iconBtn = 'rounded-full p-2 transition hover:scale-110 disabled:opacity-40 disabled:hover:scale-100';

export default function Player() {
  const p = usePlayer();
  const { current } = p;
  if (!current) return null;

  const VolumeIcon = p.muted || p.volume === 0 ? VolumeX : p.volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = p.repeat === 'one' ? Repeat1 : Repeat;
  const repeatLabel = p.repeat === 'off' ? 'Repeat off' : p.repeat === 'all' ? 'Repeat all' : 'Repeat one';

  const shuffleBtn = (
    <button onClick={p.toggleShuffle} aria-label="Shuffle" aria-pressed={p.shuffle} className={`${iconBtn} ${p.shuffle ? 'text-brand' : 'text-muted hover:text-white'}`}>
      <Shuffle size={18} />
    </button>
  );
  const repeatBtn = (
    <button onClick={p.cycleRepeat} aria-label={repeatLabel} title={repeatLabel} className={`${iconBtn} ${p.repeat !== 'off' ? 'text-brand' : 'text-muted hover:text-white'}`}>
      <RepeatIcon size={18} />
    </button>
  );
  const prevBtn = (
    <button onClick={p.previous} aria-label="Previous track" className={`${iconBtn} text-muted hover:text-white`}>
      <SkipBack size={20} fill="currentColor" />
    </button>
  );
  const nextBtn = (
    <button onClick={p.next} aria-label="Next track" className={`${iconBtn} text-muted hover:text-white`}>
      <SkipForward size={20} fill="currentColor" />
    </button>
  );
  const playBtn = (
    <button
      onClick={p.togglePlay}
      aria-label={p.isPlaying ? 'Pause' : 'Play'}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
    >
      {p.buffering && p.isPlaying !== false && !p.error ? (
        <Loader2 size={20} className="animate-spin" />
      ) : p.isPlaying ? (
        <Pause size={20} fill="currentColor" />
      ) : (
        <Play size={20} fill="currentColor" className="ml-0.5" />
      )}
    </button>
  );
  const seekBar = (
    <RangeSlider label="Seek" value={p.currentTime} max={p.duration} onChange={p.seek} disabled={!p.duration || Boolean(p.error)} />
  );

  return (
    <div role="region" aria-label="Music player" className="fixed inset-x-0 bottom-14 z-50 border-t border-white/10 bg-black/95 px-3 py-2 backdrop-blur md:bottom-0 md:px-4 md:py-3">
      {p.error && (
        <div role="alert" className="mb-2 flex items-center gap-2 rounded-md bg-red-950/70 px-3 py-1.5 text-xs text-red-200">
          <AlertCircle size={14} className="shrink-0" />
          {p.error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto] items-center gap-3 md:grid-cols-[1fr_minmax(0,2fr)_1fr]">
        {/* Now playing */}
        <div className="flex min-w-0 items-center gap-3">
          <CoverImage src={current.coverImage} alt="" seed={current.title} className="h-12 w-12 shrink-0 md:h-14 md:w-14" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{current.title}</p>
            <Link to={`/search?q=${encodeURIComponent(current.artist)}`} className="block truncate text-xs text-muted hover:text-white hover:underline">
              {current.artist}
            </Link>
          </div>
          <LikeButton song={current} className="hidden sm:block" />
        </div>

        {/* Transport: mobile = prev/play/next only; desktop = full controls + seek */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 md:gap-3">
            <span className="hidden md:block">{shuffleBtn}</span>
            {prevBtn}
            {playBtn}
            {nextBtn}
            <span className="hidden md:block">{repeatBtn}</span>
          </div>
          <div className="hidden w-full items-center gap-2 md:flex">
            <span className="w-10 text-right text-xs tabular-nums text-muted">{formatTime(p.currentTime)}</span>
            {seekBar}
            <span className="w-10 text-xs tabular-nums text-muted">{formatTime(p.duration)}</span>
          </div>
        </div>

        {/* Volume (desktop) */}
        <div className="hidden items-center justify-end gap-2 md:flex">
          <button onClick={p.toggleMute} aria-label={p.muted ? 'Unmute' : 'Mute'} className={`${iconBtn} text-muted hover:text-white`}>
            <VolumeIcon size={18} />
          </button>
          <div className="w-28">
            <RangeSlider label="Volume" value={p.muted ? 0 : p.volume} max={1} step={0.01} onChange={p.setVolume} />
          </div>
        </div>
      </div>

      {/* Mobile: shuffle, time, seek, time, repeat in one compact row */}
      <div className="mt-1 flex items-center gap-1 md:hidden">
        {shuffleBtn}
        <span className="w-9 text-right text-[11px] tabular-nums text-muted">{formatTime(p.currentTime)}</span>
        {seekBar}
        <span className="w-9 text-[11px] tabular-nums text-muted">{formatTime(p.duration)}</span>
        {repeatBtn}
      </div>
    </div>
  );
}
