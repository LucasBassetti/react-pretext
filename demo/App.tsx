import { useCallback, useEffect, useState } from "react";
import { Pretext } from "react-pretext";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { AnimationDemo } from "./pages/AnimationDemo.tsx";
import { BasicDemo } from "./pages/Basic.tsx";
import { CanvasDemo } from "./pages/CanvasDemo.tsx";
import { CardGridDemo } from "./pages/CardGridDemo.tsx";
import { ChatDemo } from "./pages/ChatDemo.tsx";
import { CodeEditorDemo } from "./pages/CodeEditorDemo.tsx";
import { DataTableDemo } from "./pages/DataTableDemo.tsx";
import { DebugDemo } from "./pages/DebugDemo.tsx";
import { MasonryDemo } from "./pages/MasonryDemo.tsx";
import { ObstacleDemo } from "./pages/ObstacleDemo.tsx";
import { TooltipDemo } from "./pages/TooltipDemo.tsx";

const PAGES = {
	basic: { label: "Basic", component: BasicDemo },
	chat: { label: "Chat UI", component: ChatDemo },
	canvas: { label: "Canvas", component: CanvasDemo },
	debug: { label: "Debug Mode", component: DebugDemo },
	masonry: { label: "Masonry", component: MasonryDemo },
	animation: { label: "Animation", component: AnimationDemo },
	codeeditor: { label: "Code Editor", component: CodeEditorDemo },
	cardgrid: { label: "Card Grid", component: CardGridDemo },
	obstacle: { label: "Text Flow", component: ObstacleDemo },
	tooltip: { label: "Tooltip", component: TooltipDemo },
	datatable: { label: "Data Table", component: DataTableDemo },
} as const;

type PageKey = keyof typeof PAGES;
const PAGE_KEYS = Object.keys(PAGES) as PageKey[];
const DEFAULT_PAGE: PageKey = "basic";

const GITHUB_URL = "https://github.com/LucasBassetti/react-pretext";

function getPageFromHash(): PageKey {
	const hash = window.location.hash.replace("#/", "");
	return PAGE_KEYS.includes(hash as PageKey) ? (hash as PageKey) : DEFAULT_PAGE;
}

function useTheme() {
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		if (typeof window === "undefined") return "light";
		const stored = localStorage.getItem("react-pretext-theme");
		if (stored === "dark" || stored === "light") return stored;
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	});

	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("react-pretext-theme", theme);
	}, [theme]);

	const toggle = useCallback(() => {
		setTheme((t) => (t === "light" ? "dark" : "light"));
	}, []);

	return { theme, toggle };
}

function useRoute(): [PageKey, (page: PageKey) => void] {
	const [page, setPageState] = useState<PageKey>(getPageFromHash);

	useEffect(() => {
		const onHashChange = () => setPageState(getPageFromHash());
		window.addEventListener("hashchange", onHashChange);
		return () => window.removeEventListener("hashchange", onHashChange);
	}, []);

	const setPage = useCallback((p: PageKey) => {
		window.location.hash = `#/${p}`;
	}, []);

	return [page, setPage];
}

function GithubIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
		</svg>
	);
}

function SunIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="3" />
			<line x1="12" y1="21" x2="12" y2="23" />
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
			<line x1="1" y1="12" x2="3" y2="12" />
			<line x1="21" y1="12" x2="23" y2="12" />
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
		</svg>
	);
}

function MenuIcon() {
	return (
		<svg
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			aria-hidden="true"
		>
			<line x1="3" y1="6" x2="21" y2="6" />
			<line x1="3" y1="12" x2="21" y2="12" />
			<line x1="3" y1="18" x2="21" y2="18" />
		</svg>
	);
}

function LogoIcon({ theme }: { theme: "light" | "dark" }) {
	return <img src={theme === "dark" ? logoDark : logoLight} alt="" width="24" height="24" />;
}

export function App() {
	const { theme, toggle } = useTheme();
	const [page, setPage] = useRoute();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const Page = PAGES[page].component;

	const closeSidebar = useCallback(() => setSidebarOpen(false), []);

	const navigateTo = useCallback(
		(key: PageKey) => {
			setPage(key);
			setSidebarOpen(false);
		},
		[setPage],
	);

	return (
		<Pretext.Provider font="16px Inter, system-ui, sans-serif" lineHeight={24}>
			<div className="layout">
				{/* Mobile header */}
				<header className="mobile-header">
					<button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
						<MenuIcon />
					</button>
					<span className="mobile-header-title">react-pretext</span>
					<div className="mobile-header-actions">
						<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
							<GithubIcon />
						</a>
						<button type="button" onClick={toggle} aria-label="Toggle theme">
							{theme === "light" ? <MoonIcon /> : <SunIcon />}
						</button>
					</div>
				</header>

				{/* Sidebar overlay */}
				<div
					className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
					onClick={closeSidebar}
					onKeyDown={(e) => e.key === "Escape" && closeSidebar()}
				/>

				{/* Sidebar */}
				<aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
					<div className="sidebar-header">
						<div className="sidebar-logo">
							<LogoIcon theme={theme} />
							<span>react-pretext</span>
						</div>
					</div>
					<nav className="sidebar-nav">
						{PAGE_KEYS.map((key) => (
							<a
								key={key}
								href={`#/${key}`}
								className={page === key ? "active" : ""}
								onClick={(e) => {
									e.preventDefault();
									navigateTo(key);
								}}
							>
								{PAGES[key].label}
							</a>
						))}
					</nav>
					<div className="sidebar-footer">
						<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
							<GithubIcon />
						</a>
						<button type="button" onClick={toggle} aria-label="Toggle theme">
							{theme === "light" ? <MoonIcon /> : <SunIcon />}
						</button>
					</div>
				</aside>

				{/* Main content */}
				<main className="main-content">
					<Page />
				</main>
			</div>
		</Pretext.Provider>
	);
}
