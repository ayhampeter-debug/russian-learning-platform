import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "YazkUp - Gamified Language Learning",
    template: "%s | YazkUp",
  },
  description:
    "YazkUp helps learners build daily language momentum with quests, XP, worlds, and saved progress.",
  applicationName: "YazkUp",
  icons: {
    icon: [
      {
        url: "/brand/yazkup-icon.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/brand/yazkup-icon.png",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "YazkUp - Gamified Language Learning",
    description:
      "Practice languages through short quests, boss challenges, XP, and clear next steps.",
    siteName: "YazkUp",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YazkUp - Gamified Language Learning",
    description:
      "Practice languages through short quests, boss challenges, XP, and clear next steps.",
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
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          <ThemeProvider>
            <UserSync />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
