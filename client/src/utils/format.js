export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Stored durations are 0 until a track has been played once.
export const formatDuration = (seconds) => (seconds > 0 ? formatTime(seconds) : '–:––');

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
