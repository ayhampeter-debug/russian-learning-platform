import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const iconClassName = compact
    ? "h-7 w-7 sm:h-7 sm:w-7"
    : "h-7 w-7 sm:h-8 sm:w-8";
  const textClassName = compact
    ? "text-[1.35rem] sm:text-[1.4rem]"
    : "text-[1.4rem] sm:text-[1.55rem]";

  return (
    <span className="flex min-w-0 items-center gap-2" aria-label="YazkUp">
      <Image
        src="/brand/yazkup-icon.svg"
        alt=""
        width={512}
        height={512}
        className={`${iconClassName} shrink-0 object-contain`}
        sizes={compact ? "28px" : "(min-width: 640px) 32px, 28px"}
        aria-hidden="true"
      />
      <span
        className={`${textClassName} shrink-0 font-extrabold leading-none tracking-normal`}
        aria-hidden="true"
      >
        <span className="text-[var(--app-text)]">Yazk</span>
        <span className="bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
          Up
        </span>
      </span>
    </span>
  );
}
