# @cyco130/vite-plugin-mdx

This is a plugin for using [MDX](https://mdxjs.com/) in [Vite](https://vitejs.dev/) applications. It is tested with React, Preact and Solid but should work with any JSX implementation.

## Why not [`vite-plugin-mdx`](https://github.com/brillout/vite-plugin-mdx)?

`vite-plugin-mdx` is currently unmaintained and only supports MDX version 1 whereas `@cyco130/vite-plugin-mdx` supports MDX version 3. In fact, this plugin may one day replace `vite-plugin-mdx`.

## Why not [`@mdx-js/rollup`](https://mdxjs.com/packages/rollup/)?

In some cases it can interfere with Vite's dependency scanning.

## Examples

`@cyco130/vite-plugin-mdx` supports React and Preact out of the box:

- [React](./examples/react) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/react))
- [Preact](./examples/preact) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/preact))

`@cyco130/vite-plugin-mdx` also supports Vue and Solid.js (through the `solid-jsx` package). But please note that using standard JSX might not be the most efficient way of using Markdown-based content in these frameworks. Also note that, on Vue, hot reloading works by reloading the containing component and not the MDX file itself.

- [Vue](./examples/vue) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/vue))
- [Solid](./examples/solid) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/solid))

## Credits

This plugin is heavily based on [`@mdx-js/rollup`](https://mdxjs.com/packages/rollup/).
