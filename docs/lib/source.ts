import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import type { InferPageType } from "fumadocs-core/source";

// fumadocs-mdx v11 returns files as a lazy function, fumadocs-core v15 expects an array
const fumadocsSource = docs.toFumadocsSource() as { files: unknown };
const files = typeof fumadocsSource.files === "function"
	? (fumadocsSource.files as () => unknown[])()
	: fumadocsSource.files as unknown[];

export const source = loader({
	baseUrl: "/docs",
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	source: { files } as any,
});

export type Page = InferPageType<typeof source>;
