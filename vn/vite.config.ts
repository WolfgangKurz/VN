import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// build collection list
(() => {
	// events
	fs.writeFileSync(
		path.join(__dirname, "public", "IMG", "CUT", "list.json"),
		JSON.stringify(
			fs.readdirSync(path.join(__dirname, "public", "IMG", "CUT"), "utf-8")
				.filter(r => /^(cut_[0-9].+|Title_[0-9]+)\.(jpg|png)$/.test(r)),
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
export default (r) => {
	const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), "utf-8"));

	const sassPrependData = [
		'@charset "UTF-8";',
		'@use "sass:math";',
		'@use "sass:list";',
		'@use "sass:map";',
	].join("\n");

	return defineConfig({
		define: {
			"import.meta.env.VERSION": JSON.stringify(packageJson.version),
		},

		esbuild: {
			jsxFactory: "h",
			jsxFragment: "Fragment",
			// jsxInject: `import { h, Fragment } from "preact";`,
			logOverride: {
				"this-is-undefined-in-esm": "silent",
			},
		},
		build: {
			rollupOptions: {
				output: {
					inlineDynamicImports: false,
					manualChunks (id) {
						// entry
						if (id.includes("/src/app/")) return undefined;

						// types & libs & loader -> base
						if (id.includes("/src/types/")) return "base";
						if (id.includes("/src/libs/")) return "base";
						if (id.includes("/src/loader")) return "base";

						// types & libs & loader -> base
						if (id.includes("/src/fonts/")) return "fonts";

						// components
						if (id.includes("/src/components/")) return "components";

						// scenes & windows
						if (id.includes("/src/scenes/")) {
							const y = id.replace(/^.*\/src\/scenes\/([^/.]+)\/?.*(?:\.?.*)$/g, "$1");
							return `Scene.${y}`;
						}
						if (id.includes("/src/windows/")) {
							const y = id.replace(/^.*\/src\/windows\/([^/.]+)\/?.*(?:\.?.*)$/g, "$1");
							return `Window.${y}`;
						}
					},
				},
			},
		},
		server: {
			watch: {
				ignored: [
					path.join(__dirname, "packaging", "**"),
					path.join(__dirname, "package", "**"),
				],
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
};
