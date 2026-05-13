type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-2" aria-label="YazkUp">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-sm font-black text-[var(--brand-cyan)] shadow-sm shadow-cyan-950/20 ring-1 ring-[color:rgb(87_212_232_/_0.45)]">
        Y
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-sm border-r-2 border-t-2 border-[var(--brand-lime)]" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black leading-5 text-[var(--brand-navy)] dark:text-[var(--brand-light)]">
          Yazk
          <span className="bg-gradient-to-r from-[var(--brand-teal)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
            Up
          </span>
        </span>
        {!compact ? (
          <span className="hidden text-[0.65rem] font-bold uppercase leading-3 tracking-[0.16em] text-[var(--app-primary-strong)] sm:block">
            Level up languages
          </span>
        ) : null}
      </span>
    </span>
  );
}
