/// <reference types="vite/client" />

declare module "*.mdx" {
	const Component: import("vue").Component;
	export default Component;
}
