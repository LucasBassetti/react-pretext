import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<>
					<img
						src="/react-pretext.svg"
						alt=""
						width={24}
						height={24}
						className="dark:hidden"
					/>
					<img
						src="/react-pretext-dark.svg"
						alt=""
						width={24}
						height={24}
						className="hidden dark:block"
					/>
					react-pretext
				</>
			),
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
