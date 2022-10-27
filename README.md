# @cyco130/vite-plugin-mdx

This is a plugin for using [MDX](https://mdxjs.com/) in [Vite](https://vitejs.dev/) applications.

**This plugin requires Vite v3 which is currently in alpha.**

## Why not use [`@mdx-js/rollup`](https://mdxjs.com/packages/rollup/)?

`@cyco130/vite-plugin-mdx` configures the MDX compiler to keep the JSX in the generated files so that you can use `@vitejs/plugin-react` or `@preact/preset-vite` for the JSX transformation. This also enables **Fast refresh**.

`@cyco130/vite-plugin-mdx` also comes with a CJS build (in addition to the ESM build) while `@mdx-js/rollup` is ESM only.

## Examples

- [React](./examples/react) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/react))
- [Preact](./examples/preact) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/preact))
- [Solid](./examples/solid) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/solid))

## Credits

Plugin code is heavily based on [`@mdx-js/rollup`](https://mdxjs.com/packages/rollup/).
