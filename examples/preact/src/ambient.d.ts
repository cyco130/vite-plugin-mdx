/// <reference types="vite/client" />

import JSX = preact.JSX;

declare module "*.mdx" {
  const Component: preact.ComponentType<{ children?: never }>;
  export default Component;
}
