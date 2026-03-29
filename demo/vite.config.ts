import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: path.resolve(__dirname),
	plugins: [react()],
	resolve: {
		alias: {
			"react-pretext": path.resolve(__dirname, "../src/index.ts"),
		},
	},
	build: {
		outDir: path.resolve(__dirname, "../dist-demo"),
		emptyOutDir: true,
	},
});
