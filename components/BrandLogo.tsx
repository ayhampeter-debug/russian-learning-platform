import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="YazkUp home"
      className={`inline-flex min-w-0 items-center leading-none transition-opacity hover:opacity-90 ${className}`}
    >
      <span className="select-none whitespace-nowrap text-[1.65rem] font-black tracking-[-0.055em] sm:text-[1.85rem]">
        <span style={{ color: "var(--yazkup-logo-text, #11203B)" }}>
          Yazk
        </span>
        <span className="bg-gradient-to-r from-[var(--brand-teal,#14B8A6)] to-[var(--brand-cyan,#57D4E8)] bg-clip-text text-transparent">
          Up
        </span>
      </span>
    </Link>
  );
}

export default BrandLogo;