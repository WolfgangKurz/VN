const fs = require("fs");
const canvas = require("canvas");

(async () => {
	const image = await new canvas.loadImage("sprite.png");

	const json = JSON.parse(fs.readFileSync("sprite.json", "utf-8"));
	Object.keys(json.frames)
		.forEach(k => {
			const o = json.frames[k];

			const cv = new canvas.Canvas(o.sourceSize.w, o.sourceSize.h);
			const ctx = cv.getContext("2d");

			ctx.drawImage(
				image,
				o.frame.x, o.frame.y,
				o.frame.w, o.frame.h,
				o.spriteSourceSize.x,
				o.spriteSourceSize.y,
				o.spriteSourceSize.w,
				o.spriteSourceSize.h,
			);

			const buffer = cv.toBuffer("image/png", {});
			fs.writeFileSync(`0/${k}`, buffer);
			console.log(k);
		});
})();
