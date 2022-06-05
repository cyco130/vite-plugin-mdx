import { describe, test, expect, beforeAll, afterAll } from "vitest";
import puppeteer, { ElementHandle } from "puppeteer";
import path from "path";
import fs from "fs";
import { spawn, ChildProcess } from "child_process";
import fetch from "node-fetch";
import kill from "kill-port";

const TEST_HOST = "http://localhost:5173";

const browser = await puppeteer.launch({
  // headless: false,
  defaultViewport: { width: 1200, height: 800 },
});

const pages = await browser.pages();
const page = pages[0];

const cases = [
  { framework: "React", env: "development" },
  { framework: "React", env: "production" },
  { framework: "Preact", env: "development" },
  // @preact/preset-vite isn't Vite 3 compatible in production yet
  // { framework: "Preact", env: "production" },
] as const;

describe.each(cases)("$framework - $env", ({ framework, env }) => {
  const dir = path.resolve(
    __dirname,
    "..",
    "examples",
    framework.toLowerCase(),
  );

  let cp: ChildProcess;

  beforeAll(async () => {
    await kill(5173, "tcp").catch(() => {
      // Do nothing
    });

    const command =
      env === "development"
        ? "pnpm exec vite serve --strictPort --port 5173"
        : "pnpm exec vite build && pnpm exec vite preview --strictPort --port 5173";

    cp = spawn(command, {
      shell: true,
      stdio: "inherit",
      cwd: dir,
    });

    // Wait until server is ready
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        fetch(TEST_HOST)
          .then(async (r) => {
            if (r.status === 200) {
              clearInterval(interval);
              resolve();
            }
          })
          .catch(() => {
            // Ignore error
          });
      }, 250);
    });
  }, 60_000);

  test("renders MDX", async () => {
    await page.goto(TEST_HOST + "/");
    await page.waitForFunction(
      (framework) => document.body.innerText.includes(`Hello ${framework}!`),
      undefined,
      framework,
    );
  });

  test.skipIf(env !== "development")(
    "hot reloads page",
    async () => {
      await page.goto(TEST_HOST);

      const button: ElementHandle<HTMLButtonElement> =
        await page.waitForSelector("button");

      await button.click();

      await page.waitForFunction(
        () => document.querySelector("button")?.textContent === "Clicked: 1",
      );

      const filePath = path.resolve(dir, "src/Sample.mdx");
      const oldContent = await fs.promises.readFile(filePath, "utf8");
      const newContent = oldContent.replace("Hello", "Hot reloadin'");

      await fs.promises.writeFile(filePath, newContent);

      try {
        await page.waitForFunction(
          () => document.body.textContent?.includes("Hot reloadin'"),
          { timeout: 60_000 },
        );
        await page.waitForFunction(
          () => document.querySelector("button")?.textContent === "Clicked: 1",
        );
      } finally {
        await fs.promises.writeFile(filePath, oldContent);
      }
    },
    60_000,
  );

  afterAll(async () => {
    await kill(5173, "tcp").catch(() => {
      // Do nothing
    });
  });
});

afterAll(async () => {
  await browser.close();
});
