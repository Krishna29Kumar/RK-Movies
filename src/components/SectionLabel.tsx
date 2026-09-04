export default function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
                {children}
            </span>
            <span className="h-px flex-1 bg-line" />
        </div>
    );
}