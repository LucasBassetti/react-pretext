import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { TextFlowDemo } from "./text-flow-demo";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		TextFlowDemo,
		...components,
	} satisfies MDXComponents;
}
