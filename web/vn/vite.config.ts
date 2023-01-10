import path from "node:path";

import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

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
	resolve: {
		alias: {
			"@/": `${path.resolve(__dirname, "src")}/`,
			react: "preact/compat",
			"react-dom": "preact/compat",
		},
	},
});
