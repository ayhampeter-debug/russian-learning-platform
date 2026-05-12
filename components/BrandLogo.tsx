type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <span className="flex min-w-0 items-center gap-2" aria-label="YazkUp">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-900 text-sm font-black text-cyan-100 shadow-sm shadow-cyan-950/20 ring-1 ring-cyan-300/40">
        Y
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-sm border-r-2 border-t-2 border-yellow-300" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black leading-5 text-white">
          Yazk
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Up
          </span>
        </span>
        {!compact ? (
          <span className="hidden text-[0.65rem] font-bold uppercase leading-3 tracking-[0.16em] text-cyan-300 sm:block">
            Level up languages
          </span>
        ) : null}
      </span>
    </span>
  );
}
