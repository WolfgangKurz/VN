import path from "node:path";

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

const sassPrependData = [
	'@charset "UTF-8";',
	'@use "sass:math";',
	'@use "sass:list";',
	'@use "sass:map";',
].join("\n");

// https://vitejs.dev/config/
export default defineConfig({
	esbuild: {
		jsxFactory: "h",
		jsxFragment: "Fragment",
		// jsxInject: `import { h, Fragment } from "preact";`,
		logOverride: {
			"this-is-undefined-in-esm": "silent",
		},
	},
	plugins: [preact()],
	css: {
		preprocessorOptions: {
			css: { charset: false },
			sass: {
				charset: false,
				additionalData: sassPrependData,
			},
			scss: {
				charset: false,
				additionalData: sassPrependData,
			},
		},
	},
	resolve: {
		alias: {
			"@/": `${path.resolve(__dirname, "src")}/`,
			react: "preact/compat",
			"react-dom": "preact/compat",
		},
	},
});