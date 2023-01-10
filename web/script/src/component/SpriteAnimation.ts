import * as PIXI from "pixi.js";

import loadSpritesheet from "@/core/Spritesheet";
import Stage from "@/core/Stage";

export default class SpriteAnimation extends Stage {
	private _path: string;
	public get path () { return this._path; }

	private _key: string;
	public get key () { return this._key; }

	private _textures: PIXI.Sprite[] = [];
	private _frameTime: number = 5;

	private _counter: number = 0;
	private _curFrame: number = 0;

	constructor (spritePath: string, name: string) {
		super();

		this._path = spritePath;
		this._key = name;

		loadSpritesheet(spritePath).then(sheet => {
			const list = Object.keys(sheet.textures)
				.filter(x => x.startsWith(name) && x.endsWith(".png"));

			if (list.length === 0)
				throw new Error(`Spritesheet '${spritePath}' doesn't have '${name}' texture`);

			this._textures = list
				.sort()
				.map(x => PIXI.Sprite.from(sheet.textures[x].clone()));

			this._counter = this._frameTime;
			this.addChild(...this._textures);
			this.update();
		});
	}

	public setFrameTime (frameTime: number): this {
		this._frameTime = frameTime;
		return this;
	}
	public setPosition (x: number, y: number): this {
		this.x = x;
		this.y = y;
		return this;
	}

	public update () {
		this._counter++;

		if (this._textures.length > 0 && this._counter >= this._frameTime) {
			this._curFrame = (this._curFrame + 1) % this._textures.length;
			this._counter = 0;

			this._textures.forEach(x => (x.visible = false));
			this._textures[this._curFrame].visible = true;
		}
	}
}
