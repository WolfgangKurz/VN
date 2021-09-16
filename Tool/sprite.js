const fs = require("fs");

const json = JSON.parse(fs.readFileSync("output.json", "utf-8"));
const ret = [];

Object.keys(json)
	.forEach(k => {
		const e = json[k];

		// ret.push(`new Sprite.SpriteInfo("${k}", ${e.x}, ${e.y}, ${e.width}, ${e.height}),`);
		ret.push(`${k}\t${e.x}\t${e.y}\t${e.width}\t${e.height}`);
	});

console.log(ret.join("\n"));
