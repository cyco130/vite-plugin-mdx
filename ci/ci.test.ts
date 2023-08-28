import { describe, test, expect, beforeAll, afterAll } from "vitest";
import puppeteer, { ElementHandle } from "puppeteer";
import path from "path";
import fs from "fs";
import { spawn, ChildProcess } from "child_process";
import fetch from "node-fetch";
import psTreeCb from "ps-tree";
import { promisify } from "util";
import { kill } from "process";

const psTree = promisify(psTreeCb);

const TEST_HOST = "http://localhost:5174";

const browser = await puppeteer.launch({
  headless: "new",
  defaultViewport: { width: 1200, height: 800 },
});

const pages = await browser.pages();
const page = pages[0];

const cases = [
  { framework: "React", env: "development" },
  { framework: "React", env: "production" },

  { framework: "Preact", env: "development" },
  { framework: "Preact", env: "production" },

  { framework: "Solid", env: "development" },
  { framework: "Solid", env: "production" },
] as const;

describe.each(cases)("$framework - $env", ({ framework, env }) => {
  const dir = path.resolve(
    __dirname,
    "..",
    "examples",
    framework.toLowerCase(),
  );

  let cp: ChildProcess | undefined;

  beforeAll(async () => {
    const command =
      env === "development"
        ? "pnpm exec vite serve --strictPort --port 5174"
        : "pnpm exec vite build && pnpm exec vite preview --strictPort --port 5174";

    cp = spawn(command, {
      shell: true,
      stdio: "inherit",
      cwd: dir,
    });

    // eslint-disable-next-line no-async-promise-executor
    await new Promise<void>(async (resolve, reject) => {
      cp!.on("error", (error) => {
        cp = undefined;
        reject(error);
      });

      cp!.on("exit", (code) => {
        if (code !== 0) {
          cp = undefined;
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      for (;;) {
        let doBreak = false;
        await fetch(TEST_HOST)
          .then(async (r) => {
            if (r.status === 200) {
              resolve();
              doBreak = true;
            }
          })
          .catch(() => {
            // Ignore error
          });

        if (doBreak) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }, 60_000);

  afterAll(async () => {
    if (!cp || cp.exitCode || !cp.pid) {
      return;
    }

    const tree = await psTree(cp.pid);
    const pids = [cp.pid, ...tree.map((p) => +p.PID)];

    for (const pid of pids) {
      kill(+pid, "SIGINT");
    }

    await new Promise((resolve) => {
      cp!.on("exit", resolve);
    });
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
        await page.waitForFunction(
          () => document.querySelector("button")?.textContent === "Clicked: 1",
        );
      } finally {
        await fs.promises.writeFile(filePath, oldContent);
      }
    }, 60_000);
  }
});

afterAll(async () => {
  await browser.close();
});
