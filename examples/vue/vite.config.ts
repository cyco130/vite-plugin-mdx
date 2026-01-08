import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { mdx } from "@cyco130/vite-plugin-mdx";

export default defineConfig({
  plugins: [mdx({ jsxImportSource: "vue" }), vue()],
});
