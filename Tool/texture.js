const cp = require("child_process");

const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

fs.readdirSync(path.join(__dirname, "input"))
	.forEach(dir => {
		const outDir = path.join(__dirname, "output", dir);
		if (fs.existsSync(outDir))
			rimraf.sync(outDir);

		fs.mkdirSync(outDir, { recursive: true });

		cp.execSync(`python atlas.py "./input/${dir}" "./output/${dir}/sprite.json"`);
	});

console.log("spritesheet successfully generated");
