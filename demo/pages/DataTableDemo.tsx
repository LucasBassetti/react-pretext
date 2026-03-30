import { usePretextLayout } from "react-pretext";

const TABLE_DATA = [
	{ name: "Alice Johnson", description: "Senior frontend engineer specializing in React, TypeScript, and design systems. Leads the UI platform team and mentors junior developers.", status: "Active" },
	{ name: "Bob Chen", description: "Backend infrastructure engineer working on distributed systems and database optimization.", status: "Active" },
	{ name: "Carol Williams", description: "Product designer focused on developer tools and documentation experiences. Previously at Stripe and Figma where she designed component libraries and API reference pages.", status: "On Leave" },
	{ name: "David Kim", description: "Full-stack developer with expertise in real-time collaboration features and WebSocket architectures.", status: "Active" },
	{ name: "Eva Martinez", description: "DevOps engineer maintaining CI/CD pipelines, Kubernetes clusters, and monitoring infrastructure. Reduced deploy times by 60% through parallel build optimization and intelligent caching strategies.", status: "Active" },
	{ name: "Frank Lee", description: "Mobile developer building cross-platform apps with React Native.", status: "Inactive" },
	{ name: "Grace Patel", description: "Data engineer building ETL pipelines and real-time analytics dashboards. Expert in Apache Kafka, Spark, and BigQuery. Currently leading the migration from batch to streaming data processing.", status: "Active" },
	{ name: "Henry Zhao", description: "Security engineer performing penetration testing and code audits.", status: "Active" },
	{ name: "Iris Thompson", description: "Technical writer creating API documentation, onboarding guides, and architecture decision records. Maintains the company's documentation platform built on Mintlify with custom React components.", status: "On Leave" },
	{ name: "Jake Wilson", description: "QA engineer building automated test suites and performance benchmarks.", status: "Active" },
	{ name: "Karen Liu", description: "Machine learning engineer developing recommendation systems and natural language processing models for search relevance. Published research on transformer architectures for code understanding.", status: "Active" },
	{ name: "Liam Brown", description: "Platform engineer working on internal developer tools and CLI frameworks.", status: "Inactive" },
	{ name: "Mia Davis", description: "Accessibility specialist ensuring WCAG 2.1 AA compliance across all products. Built the company's accessibility testing framework and conducts quarterly audits.", status: "Active" },
	{ name: "Noah Garcia", description: "Site reliability engineer managing uptime for services handling millions of requests per day.", status: "Active" },
	{ name: "Olivia Taylor", description: "Engineering manager overseeing three teams across frontend, backend, and infrastructure. Focused on improving developer velocity and reducing incident response times through better tooling and processes.", status: "Active" },
];

const DESC_WIDTH = 380;
const FONT = "14px Inter, system-ui, sans-serif";
const LINE_HEIGHT = 20;

function TruncatedDescription({ text }: { text: string }) {
	const layout = usePretextLayout({
		text,
		maxWidth: DESC_WIDTH,
		font: FONT,
		lineHeight: LINE_HEIGHT,
	});

	const isTruncated = layout.lineCount > 1;
	const displayText = isTruncated ? layout.lines[0].text.trimEnd() + "..." : text;

	return (
		<span title={isTruncated ? text : undefined} style={{ whiteSpace: "pre", cursor: isTruncated ? "help" : "default" }}>
			{displayText}
		</span>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, { bg: string; text: string }> = {
		Active: { bg: "rgba(40, 167, 69, 0.12)", text: "#28a745" },
		Inactive: { bg: "rgba(108, 117, 125, 0.12)", text: "#6c757d" },
		"On Leave": { bg: "rgba(255, 193, 7, 0.15)", text: "#d4a017" },
	};
	const style = colors[status] ?? { bg: "rgba(108, 117, 125, 0.12)", text: "#6c757d" };

	return (
		<span
			style={{
				display: "inline-block",
				padding: "2px 10px",
				borderRadius: 12,
				fontSize: 12,
				fontWeight: 500,
				background: style.bg,
				color: style.text,
				whiteSpace: "nowrap",
			}}
		>
			{status}
		</span>
	);
}

export function DataTableDemo() {
	return (
		<div>
			<h2 style={{ margin: "0 0 12px" }}>Data Table with Text Truncation</h2>
			<p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px" }}>
				The Description column uses usePretextLayout to compute text layout and truncate to a
				single line. Hover over truncated text to see the full content. No DOM measurement is
				performed for truncation.
			</p>

			<div
				style={{
					border: "1px solid var(--color-border)",
					borderRadius: 8,
					overflow: "hidden",
				}}
			>
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontSize: 14,
						fontFamily: "Inter, system-ui, sans-serif",
					}}
				>
					<thead>
						<tr
							style={{
								background: "var(--color-surface)",
								borderBottom: "2px solid var(--color-border)",
							}}
						>
							<th
								style={{
									textAlign: "left",
									padding: "10px 16px",
									fontWeight: 600,
									fontSize: 13,
									color: "var(--color-text-muted)",
									whiteSpace: "nowrap",
								}}
							>
								Name
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "10px 16px",
									fontWeight: 600,
									fontSize: 13,
									color: "var(--color-text-muted)",
								}}
							>
								Description
							</th>
							<th
								style={{
									textAlign: "left",
									padding: "10px 16px",
									fontWeight: 600,
									fontSize: 13,
									color: "var(--color-text-muted)",
									whiteSpace: "nowrap",
								}}
							>
								Status
							</th>
						</tr>
					</thead>
					<tbody>
						{TABLE_DATA.map((row) => (
							<tr
								key={row.name}
								style={{
									borderBottom: "1px solid var(--color-border)",
								}}
							>
								<td
									style={{
										padding: "10px 16px",
										whiteSpace: "nowrap",
										fontWeight: 500,
									}}
								>
									{row.name}
								</td>
								<td
									style={{
										padding: "10px 16px",
										maxWidth: DESC_WIDTH,
										color: "var(--color-text-muted)",
									}}
								>
									<TruncatedDescription text={row.description} />
								</td>
								<td style={{ padding: "10px 16px" }}>
									<StatusBadge status={row.status} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 8 }}>
				{TABLE_DATA.length} rows | Description truncation computed via usePretextLayout | Hover
				truncated cells for full text
			</div>
		</div>
	);
}
