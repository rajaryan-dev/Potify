import { useState } from 'react';
import { Music } from 'lucide-react';

const GRADIENTS = [
  'from-emerald-700 to-emerald-950', 'from-indigo-600 to-indigo-950', 'from-rose-600 to-rose-950',
  'from-amber-600 to-amber-950', 'from-sky-600 to-sky-950', 'from-fuchsia-700 to-fuchsia-950',
];
const pick = (s = '') => GRADIENTS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];

// Shows the cover, or a coloured placeholder when there is no image or it fails to load.
export default function CoverImage({ src, alt = '', seed = '', className = '', round = false }) {
  const [failed, setFailed] = useState(false);
  const shape = round ? 'rounded-full' : 'rounded-md';
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${pick(seed || alt)} ${shape} ${className}`} aria-label={alt}>
        <Music className="h-1/3 w-1/3 text-white/60" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${shape} ${className}`} />;
}
