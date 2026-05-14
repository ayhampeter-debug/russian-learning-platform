import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const iconClassName = compact
    ? "h-[26px] w-[26px]"
    : "h-7 w-7";
  const textClassName = compact
    ? "text-[1.25rem]"
    : "text-[1.3rem] sm:text-[1.4rem]";

  return (
    <span className="flex min-w-0 items-center gap-1.5" aria-label="YazkUp">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--app-text)_7%,transparent)]">
        <Image
          src="/brand/yazkup-icon.svg"
          alt=""
          width={512}
          height={512}
          className={`${iconClassName} object-contain`}
          sizes={compact ? "26px" : "28px"}
          aria-hidden="true"
        />
      </span>
      <span
        className={`${textClassName} shrink-0 font-extrabold leading-none tracking-normal`}
        aria-hidden="true"
      >
        <span className="text-[var(--foreground)]">Yazk</span>
        <span className="bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
          Up
        </span>
      </span>
    </span>
  );
}
