import { createMDX } from "fumadocs-mdx/next";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
	reactStrictMode: true,
	transpilePackages: ["react-pretext", "@chenglou/pretext"],
	webpack: (config) => {
		config.resolve.alias["react-pretext"] = resolve(__dirname, "../src/index.ts");
		config.resolve.extensionAlias = {
			...config.resolve.extensionAlias,
			".js": [".ts", ".tsx", ".js"],
		};
		// Files in ../src/ resolve node_modules relative to their location (../node_modules),
		// which doesn't exist on Vercel. Ensure docs/node_modules is always checked.
		config.resolve.modules = [
			...(config.resolve.modules || ["node_modules"]),
			resolve(__dirname, "node_modules"),
		];
		return config;
	},
};

const withMDX = createMDX();

export default withMDX(config);
