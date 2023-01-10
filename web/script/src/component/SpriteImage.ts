import * as PIXI from "pixi.js";

import loadSpritesheet from "@/core/Spritesheet";

export default class SpriteImage extends PIXI.Sprite {
	private _path: string;
	public get path () { return this._path; }

	private _key: string;
	public get key () { return this._key; }

	constructor (spritePath: string, name: string) {
		super();

		this._path = spritePath;
		this._key = name;

		loadSpritesheet(spritePath).then(sheet => {
			const target = `${name}.png`;

			if (!(target in sheet.textures))
				throw new Error(`Spritesheet '${spritePath}' doesn't have '${name}' texture`);

			this.texture = sheet.textures[target].clone();
		});
	}

	public setPosition (x: number, y: number): this {
		this.x = x;
		this.y = y;
		return this;
	}
}
