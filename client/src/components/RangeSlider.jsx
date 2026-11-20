export default function RangeSlider({ value, max, onChange, label, step = 'any', className = '', disabled = false }) {
  const safeMax = max > 0 ? max : 1;
  const fill = Math.min(100, Math.max(0, (value / safeMax) * 100));
  return (
    <input
      type="range"
      aria-label={label}
      min={0}
      max={safeMax}
      step={step}
      value={Math.min(value, safeMax)}
      disabled={disabled}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`slider ${disabled ? 'opacity-40' : ''} ${className}`}
      style={{ '--fill': `${fill}%` }}
    />
  );
}
