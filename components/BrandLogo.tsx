import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="YazkUp home"
      className={`group inline-flex items-center gap-2.5 rounded-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-cyan)] opacity-95" />
        <span className="absolute inset-[3px] rounded-full bg-[var(--background)]" />

        <span className="relative flex h-7 w-7 items-center justify-center rounded-full">
          <svg
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="h-7 w-7"
            fill="none"
          >
            <path
              d="M13.5 15.5L24 29.5L34.5 15.5"
              stroke="currentColor"
              strokeWidth="5.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--foreground)]"
            />
            <path
              d="M24 29V38"
              stroke="currentColor"
              strokeWidth="5.2"
              strokeLinecap="round"
              className="text-[var(--foreground)]"
            />
            <path
              d="M24 6.8L12.5 11.4L24 16L35.5 11.4L24 6.8Z"
              className="fill-[var(--foreground)]"
            />
            <path
              d="M17.8 14.2V18.7C17.8 21.1 20.6 23.2 24 23.2C27.4 23.2 30.2 21.1 30.2 18.7V14.2"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="text-[var(--foreground)]"
            />
          </svg>
        </span>

        <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--brand-lime)] ring-2 ring-[var(--background)]" />
      </span>

      <span className="select-none text-[1.45rem] font-black tracking-[-0.04em] leading-none">
        <span className="text-[var(--foreground)]">Yazk</span>
        <span className="bg-gradient-to-r from-[var(--brand-teal)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
          Up
        </span>
      </span>
    </Link>
  );
}

export default BrandLogo;