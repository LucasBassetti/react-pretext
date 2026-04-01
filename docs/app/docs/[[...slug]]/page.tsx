import { source } from "@/lib/source";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import type { MDXContent } from "mdx/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- fumadocs-mdx returns lazy files, type inference is lost
type PageData = { body: MDXContent; toc: any; title: string; description: string };

export default async function Page(props: {
	params: Promise<{ slug?: string[] }>;
}) {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const { body: MDX, toc, title, description } = page.data as PageData;

	return (
		<DocsPage toc={toc}>
			<DocsTitle>{title}</DocsTitle>
			<DocsDescription>{description}</DocsDescription>
			<DocsBody>
				<MDX
					components={getMDXComponents({
						a: createRelativeLink(source, page),
					})}
				/>
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata(props: {
	params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
	const params = await props.params;
	const page = source.getPage(params.slug);
	if (!page) notFound();

	const { title, description } = page.data as PageData;

	return { title, description };
}
