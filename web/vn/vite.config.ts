import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

const sassPrependData = [
	'@charset "UTF-8";',
	'@use "sass:math";',
	'@use "sass:list";',
	'@use "sass:map";',
].join("\n");

// build collection list
(() => {
	// events
	fs.writeFileSync(
		path.join(__dirname, "public", "IMG", "CUT", "list.json"),
		JSON.stringify(
			fs.readdirSync(path.join(__dirname, "public", "IMG", "CUT"), "utf-8")
				.filter(r => /^cut_[0-9].+\.(jpg|png)$/.test(r)),
		),
		"utf-8",
	);

	// scg
	fs.writeFileSync(
		path.join(__dirname, "public", "IMG", "SCG", "list.json"),
		JSON.stringify(
			fs.readdirSync(path.join(__dirname, "public", "IMG", "SCG"), "utf-8")
				.filter(r => /^STD_[0-9].+\.(jpg|png)$/.test(r))
				.filter(r => !r.startsWith("STD_00_")),
		),
		"utf-8",
	);
})();

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
