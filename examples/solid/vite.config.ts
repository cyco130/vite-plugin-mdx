import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { mdx } from "@cyco130/vite-plugin-mdx";

export default defineConfig({
  plugins: [
    // This should come _before_ solid
    mdx({ jsxImportSource: "solid-jsx" }),
    solid(),
  ],
});
