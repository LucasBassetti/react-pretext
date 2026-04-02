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
		return config;
	},
};

const withMDX = createMDX();

export default withMDX(config);
