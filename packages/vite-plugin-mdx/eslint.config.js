import config from "@cyco130/eslint-config/node";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tsconfigRootDir =
  import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

/** @type {typeof config} */
export default [
  ...config,
  {
    ignores: ["dist/", "node_modules/"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
];
