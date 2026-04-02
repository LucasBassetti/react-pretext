import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { MasonryDemo } from "./masonry-demo";
import { TextFlowDemo } from "./text-flow-demo";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		MasonryDemo,
		TextFlowDemo,
		...components,
	} satisfies MDXComponents;
}
