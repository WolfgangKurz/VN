const SpriteSmith = require("spritesmith");
const path = require("path");
const fs = require("fs");

const baseDir = path.resolve(__dirname, "..", "res", "리소스", "03_컬렉션");
const sprites = fs.readdirSync(baseDir)
	.filter(x => x.startsWith("collect"))
	.filter(x => !x.endsWith("back.png"))
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
			path.resolve(__dirname, "output.sprite.png"),
			result.image
		);

		const ret = [];
		Object.keys(table)
			.forEach(k => {
				const e = table[k];
				ret.push(`${k}\t${e.x}\t${e.y}\t${e.width}\t${e.height}`);
			});

		fs.writeFileSync(
			path.resolve(__dirname, "output.sprite.txt"),
			ret.join("\n"),
			"utf-8",
		);
	},
);
