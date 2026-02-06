import { describe, test, expect, beforeAll, afterAll } from "vitest";
import puppeteer, { ElementHandle } from "puppeteer";
import path from "path";
import fs from "fs";
import { spawn, ChildProcess } from "child_process";
import { launchAndTest, LaunchAndTestCleanupFunction } from "kill-em-all";

const PORT = 5173;
const TEST_HOST = `http://localhost:${PORT}`;

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1200, height: 800 },
});

const pages = await browser.pages();
const page = pages[0];

const cases: Array<{
  framework: "React" | "Preact" | "Vue" | "Solid";
  env: "development" | "production";
  preservesState?: boolean;
}> = [
  { framework: "React", env: "development" },
  { framework: "React", env: "production" },

  { framework: "Preact", env: "development" },
  { framework: "Preact", env: "production" },

  { framework: "Vue", env: "development", preservesState: false },
  { framework: "Vue", env: "production" },

  { framework: "Solid", env: "development" },
  { framework: "Solid", env: "production" },
];

describe.each(cases)(
  "$framework - $env",
  ({ framework, env, preservesState = true }) => {
    const dir = path.resolve(
      __dirname,
      "..",
      "examples",
      framework.toLowerCase(),
    );

    let kill: LaunchAndTestCleanupFunction | undefined;

    beforeAll(async () => {
      const command =
        env === "development"
          ? `pnpm exec vite serve --strictPort --port ${PORT}`
          : `pnpm exec vite build && pnpm exec vite preview --strictPort --port ${PORT}`;

      const cp = spawn(command, {
        shell: true,
        stdio: "inherit",
        cwd: dir,
      });

      kill = await launchAndTest(cp, TEST_HOST);
    }, 60_000);

    afterAll(async () => {
      await kill?.();
    });

    test("renders MDX", async () => {
      await page.goto(TEST_HOST + "/");
      await page.waitForFunction(
        (framework) => document.body.innerText.includes(`Hello ${framework}!`),
        undefined,
        framework,
      );
    });

    if (env === "development") {
      test("hot reloads page", async () => {
        await page.goto(TEST_HOST);

        const button: ElementHandle<HTMLButtonElement> =
          (await page.waitForSelector("button"))!;

        await button.click();

        await page.waitForFunction(
          () => document.querySelector("button")?.textContent === "Clicked: 1",
        );

        const filePath = path.resolve(dir, "src/Sample.mdx");
        const oldContent = await fs.promises.readFile(filePath, "utf8");
        const newContent = oldContent.replace("Hello", "Hot reloadin'");

        if (process.platform === "win32") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        await fs.promises.writeFile(filePath, newContent);

        try {
          await page.waitForFunction(
            () => document.body.textContent?.includes("Hot reloadin'"),
            { timeout: 60_000 },
          );

          if (preservesState) {
            await page.waitForFunction(
              () =>
                document.querySelector("button")?.textContent === "Clicked: 1",
            );
          }
        } finally {
          await fs.promises.writeFile(filePath, oldContent);
        }
      }, 60_000);
    }
  },
);

afterAll(async () => {
  await browser.close();
});
