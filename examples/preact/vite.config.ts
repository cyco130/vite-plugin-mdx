import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import mdx from "@cyco130/vite-plugin-mdx";

export default defineConfig({
  plugins: [
    // This should come _before_ preact
    mdx({
      jsxRuntime: "classic",
      pragma: "preact.createElement",
      pragmaFrag: "preact.Fragment",
    }),
    preact(),
  ],
});
