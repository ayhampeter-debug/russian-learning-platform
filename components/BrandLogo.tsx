import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const logoWidth = compact ? 96 : 120;

  return (
    <span className="flex min-w-0 items-center" aria-label="YazkUp">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm shadow-cyan-950/15 ring-1 ring-[color:rgb(17_32_59_/_0.08)] sm:hidden">
        <Image
          src="/brand/yazkup-icon.svg"
          alt="YazkUp"
          width={512}
          height={512}
          className="h-full w-full object-contain"
          sizes="40px"
        />
      </span>
      <span className="hidden shrink-0 rounded-xl bg-white px-2.5 py-1.5 shadow-sm shadow-cyan-950/15 ring-1 ring-[color:rgb(17_32_59_/_0.08)] sm:flex">
        <Image
          src="/brand/yazkup-logo.svg"
          alt="YazkUp"
          width={980}
          height={260}
          className="h-auto max-w-full object-contain"
          style={{ width: logoWidth, height: "auto" }}
          sizes={`${logoWidth}px`}
        />
      </span>
    </span>
  );
}
