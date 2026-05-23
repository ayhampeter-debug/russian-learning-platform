import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Alexandria, Geist, Geist_Mono } from "next/font/google";
import { OnboardingSetup } from "@/components/OnboardingSetup";
import { ThemeProvider, themeStorageKey } from "@/components/ThemeProvider";
import { UserSync } from "@/components/UserSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "YazkUp | Learn Russian with XP, worlds, and daily quests",
    template: "%s | YazkUp",
  },
  description:
    "YazkUp is a beta language learning app for Russian lessons, XP progress, worlds, mistake review, and daily goals with English or Arabic explanations.",
  applicationName: "YazkUp",
  metadataBase: new URL("https://yazkup.com"),
  icons: {
    icon: [
      {
        url: "/brand/yazkup-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "YazkUp | Learn Russian with XP, worlds, and daily quests",
    description:
      "Practice Russian through short quests, XP progress, worlds, mistake review, and daily goals with English or Arabic explanations.",
    siteName: "YazkUp",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YazkUp | Learn Russian with XP, worlds, and daily quests",
    description:
      "Practice Russian through short quests, XP progress, worlds, mistake review, and daily goals with English or Arabic explanations.",
  },
};

const themeScript = `
(() => {
  try {
    const storageKey = ${JSON.stringify(themeStorageKey)};
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : "system";
    const resolvedTheme = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${alexandria.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <ThemeProvider>
            <UserSync />
            {children}
            <OnboardingSetup />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
