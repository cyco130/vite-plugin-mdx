# @cyco130/vite-plugin-mdx

`@cyco130/vite-plugin-mdx` is a [Vite](https://vitejs.dev/) plugin for [MDX](https://mdxjs.com/). It is tested with React, Preact, Vue, and Solid but should work with any JSX implementation.

> [!IMPORTANT]  
> If you're on Vite 8 or later, you don't need this plugin. Use `@mdx-js/rollup` directly. In some cases you may have to force it to be processed before other plugins as follows:
>
> ```js
> // vite.config.js
> import mdx from "@mdx-js/rollup";
>
> export default {
>   plugins: [
>     {
>       ...mdx(),
>       enforce: "pre",
>     },
>     // other plugins...
>   ],
> };
> ```

## Why not [`@mdx-js/rollup`](https://mdxjs.com/packages/rollup/)?

Before Vite version 8, Vite's dependency scanning could be interrupted because ESBuild doesn't understand MDX files. This plugin uses an additional ESBuild plugin to make sure dependency scanning works correctly.

However, if you're on Vite 8 or later, you can use `@mdx-js/rollup` directly. See the note at the top of this README for more details.

## Why not [`vite-plugin-mdx`](https://github.com/brillout/vite-plugin-mdx)?

`vite-plugin-mdx` is currently unmaintained and only supports MDX version 1 whereas `@cyco130/vite-plugin-mdx` supports later MDX versions.

## Examples

`@cyco130/vite-plugin-mdx` supports React, Preact, Vue out of the box, and Solid.js through the `solid-jsx` package:

- [React](./examples/react) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/react))
- [Preact](./examples/preact) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/preact))
- [Vue](./examples/vue) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/vue))
- [Solid](./examples/solid) ([StackBlitz](https://stackblitz.com/github/cyco130/vite-plugin-mdx/tree/main/examples/solid))

Please note that using standard JSX might not be the most efficient way of using Markdown-based content in Vue in Solid.js. Also note that, on Vue, hot reloading works by reloading the containing component and not the MDX file itself.

## Credits

This plugin is heavily based on [`@mdx-js/rollup`](https://mdxjs.com/packages/rollup/).
