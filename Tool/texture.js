const SpriteSmith = require("spritesmith");
const path = require("path");
const fs = require("fs");

const baseDir = path.resolve(__dirname, "..", "res", "title");
const sprites = fs.readdirSync(baseDir)
	.map(x => path.resolve(baseDir, x));

SpriteSmith.run(
	{ src: sprites },
	(err, result) => {
		if (err)
			throw err;

		const table = {};
		Object.keys(result.coordinates)
			.forEach(x => {
				const k = path.basename(x, path.extname(x));
				table[k] = result.coordinates[x];
			});

		fs.writeFileSync(
			path.resolve(__dirname, "output.json"),
			JSON.stringify(table, undefined, 4),
			"utf-8",
		);
		fs.writeFileSync(
			path.resolve(__dirname, "output.png"),
			result.image
		);
	},
);
