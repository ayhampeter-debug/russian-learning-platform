import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";

const baseUrl = process.env.QA_BASE_URL ?? "http://localhost:3000";
const lessonPath = "/lesson/body-parts";
const outputDir = join(process.cwd(), "qa-screenshots", "body-parts");
const themeStorageKey = "rusquest-theme";
const readinessTimeoutMs = 60_000;
const navigationTimeoutMs = 60_000;
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
const themes = ["light", "dark"];

let devServerProcess;

async function isServerReady() {
  try {
    const response = await fetch(baseUrl, { method: "HEAD" });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < readinessTimeoutMs) {
    if (await isServerReady()) {
      return;
    }

    await delay(1_000);
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function ensureDevServer() {
  if (await isServerReady()) {
    console.log(`Using existing dev server at ${baseUrl}`);
    return;
  }

  console.log(`Starting dev server at ${baseUrl}`);
  const devCommand = process.platform === "win32" ? "npm.cmd run dev" : "npm run dev";

  devServerProcess = spawn(devCommand, [], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: "3000" },
    shell: true,
    stdio: "inherit",
  });

  await waitForServer();
}

async function captureScreenshots() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport: { width: viewports[0].width, height: viewports[0].height },
      colorScheme: "light",
    });

    await context.addInitScript(
      ({ storageKey }) => {
        window.localStorage.setItem(storageKey, "light");
      },
      { storageKey: themeStorageKey },
    );

    const page = await context.newPage();
    await page.goto(`${baseUrl}${lessonPath}`, {
      waitUntil: "domcontentloaded",
      timeout: navigationTimeoutMs,
    });
    await page.locator("main").waitFor({ state: "visible", timeout: 30_000 });

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const theme of themes) {
        await page.evaluate(
          ({ storageKey, selectedTheme }) => {
            window.localStorage.setItem(storageKey, selectedTheme);
            document.documentElement.dataset.theme = selectedTheme;
            document.documentElement.classList.toggle("dark", selectedTheme === "dark");
            document.documentElement.style.colorScheme = selectedTheme;
            window.dispatchEvent(new Event("rusquest-theme-change"));
          },
          { storageKey: themeStorageKey, selectedTheme: theme },
        );
        await page.waitForTimeout(250);

        const screenshotPath = join(outputDir, `body-parts-${viewport.name}-${theme}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        console.log(`Saved ${screenshotPath}`);
      }
    }

    await context.close();
  } finally {
    await browser.close();
  }
}

function stopDevServer() {
  if (devServerProcess && !devServerProcess.killed) {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(devServerProcess.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      return;
    }

    devServerProcess.kill();
  }
}

process.on("SIGINT", () => {
  stopDevServer();
  process.exit(130);
});
process.on("SIGTERM", () => {
  stopDevServer();
  process.exit(143);
});

try {
  await ensureDevServer();
  await captureScreenshots();
  console.log(`Saved Body Parts QA screenshots to ${outputDir}`);
} finally {
  stopDevServer();
}
