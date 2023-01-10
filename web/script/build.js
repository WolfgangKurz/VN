const fs = require("fs");
const path = require("path");
const glob = require("glob");

const outdir = path.resolve(__dirname, "..", "src", "js");
if (fs.existsSync(outdir))
	fs.rmSync(outdir, { recursive: true, force: true, });

require("esbuild").build({
	nodePaths: [
		path.resolve(__dirname, "node_modules"),
	],
	entryPoints: [
		// ...glob.sync(path.resolve(__dirname, "src", "**", "*.ts")),
		path.resolve(__dirname, "src", "index.ts"),
		...glob.sync(path.resolve(__dirname, "src", "game", "*.ts")),
	],
	bundle: true,
	minify: false,
	sourcemap: "inline",
	target: "esnext",
	platform: "node",
	charset: "utf8",
	legalComments: "none",
	treeShaking: true,
	tsconfig: path.resolve(__dirname, "./tsconfig.json"),
	// outfile: path.resolve(__dirname, "..", "src", "js", "index.js"),
	outdir,
	outbase: path.resolve(__dirname, "src"),
	watch: true,
});
