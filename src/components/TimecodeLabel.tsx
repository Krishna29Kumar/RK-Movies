function toTimecode(n: number) {
  const h = String(Math.floor(n / 3600) % 24).padStart(2, "0");
  const m = String(Math.floor(n / 60) % 60).padStart(2, "0");
  const s = String(n % 60).padStart(2, "0");
  const f = String((n * 7) % 24).padStart(2, "0");
  return `${h}:${m}:${s}:${f}`;
}

export default function TimecodeLabel({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs tabular-nums text-orange">
        {toTimecode(index * 137)}
      </span>
      <span className="h-px flex-1 bg-line" />
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {children}
      </span>
    </div>
  );
}
