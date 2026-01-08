/// <reference types="vite/client" />

declare module "*.mdx" {
  const Component: import("solid-js").Component;
  export default Component;
}
