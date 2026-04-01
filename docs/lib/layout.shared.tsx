import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "react-pretext",
		},
		githubUrl: "https://github.com/LucasBassetti/react-pretext",
		links: [
			{
				text: "npm",
				url: "https://www.npmjs.com/package/react-pretext",
			},
		],
	};
}
