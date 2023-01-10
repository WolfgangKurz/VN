const os = require("os");
os.tmpDir = os.tmpdir;

const spritesheet = require("spritesheet-js");
const glob = require("glob");
const path = require("path");
const fs = require("fs");

// const baseDir = path.resolve(__dirname, "..", "res", "리소스", "03_컬렉션");
// const sprites = fs.readdirSync(baseDir)
// 	.filter(x => x.startsWith("collect"))
// 	.filter(x => !x.endsWith("back.png"))
// 	.map(x => path.resolve(baseDir, x));
const sprites = glob.sync(path.resolve(__dirname, "..", "res", "temp", "*.png"));
spritesheet(
	sprites,
	{
		format: "pixi.js",
		path: "./output",
		name: "sprite",
		trim: true,
	},
	function (err) {
		if (err) throw err;

		console.log("spritesheet successfully generated");
	},
);
