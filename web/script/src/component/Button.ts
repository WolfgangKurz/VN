import * as PIXI from "pixi.js";

import Stage from "@/core/Stage";
import loadSpritesheet from "@/core/Spritesheet";

export default class Button extends Stage {
	private _normalState: PIXI.Sprite | null = null;
	private _hoverState: PIXI.Sprite[] = [];
	private _activeState: PIXI.Sprite[] = [];
	private _frameTime: number = 5;

	private _curFrame: number = 0;
	private _curType: number = 0;
	private _curIndex: number = 0;

	private _path: string;
	public get path () { return this._path; }

	private _key: string;
	public get key () { return this._key; }

	constructor (spritePath: string, name: string) {
		super();

		this.buttonMode = true;

		this._path = spritePath;
		this._key = name;

		loadSpritesheet(spritePath).then(sheet => {
			const normal = `${name}.png`;

			if (!(normal in sheet.textures))
				throw new Error(`Spritesheet '${spritePath}' doesn't have '${name}' texture`);

			this._normalState = PIXI.Sprite.from(sheet.textures[normal].clone());
			this._hoverState = Object.keys(sheet.textures)
				.filter(s => s.startsWith(name) && s.includes("_hover") && s !== normal)
				.map(s => PIXI.Sprite.from(sheet.textures[s].clone()));

			this._activeState = Object.keys(sheet.textures)
				.filter(s => s.startsWith(name) && s.includes("_down") && s !== normal)
				.map(s => PIXI.Sprite.from(sheet.textures[s].clone()));

			const list = [this._normalState, ...this._hoverState, ...this._activeState];
			this.addChild(...list);

			this.updateSize();
		});
	}

	public setFrameTime (frameTime: number): this {
		this._frameTime = frameTime;
		return this;
	}

	private updateSize () {
		if (!this._normalState) return;

		const list = [this._normalState, ...this._hoverState, ...this._activeState];
		const mW = Math.max(...list.map(x => x.texture.width));
		const mH = Math.max(...list.map(x => x.texture.height));
		if (mW === 0 || mH === 0) return;

		list.forEach(i => {
			i.x = mW / 2;
			i.y = mH / 2;
			i.anchor.set(0.5);
		});
		this.width = mW;
		this.height = mH;
	}

	public update () {
		if (!this._normalState) return;

		const stateAvailable = this._hoverState.length > 0 || this._activeState.length > 0;
		if (stateAvailable) {
			if (this._pressed && this._activeState.length > 0) {
				if (this._curType !== 2) {
					this._curType = 2;
					this._curIndex = 0;
					this._curFrame = 0;
				}
			} else if (this.isHover() && this._hoverState.length > 0) {
				if (this._curType !== 1) {
					this._curType = 1;
					this._curIndex = 0;
					this._curFrame = 0;
				}
			} else if (this._curType !== 0) {
				this._curType = 0;
				this._curIndex = 0;
				this._curFrame = 0;
			}
		}

		this._curFrame++;
		if (this._curFrame >= this._frameTime) {
			this._curFrame = 0;
			this._curIndex++;

			if (this._curType === 0)
				this._curIndex = 0;
			else if (this._curType === 1) {
				const maxFrame = this._hoverState.length;
				if (this._curIndex >= maxFrame)
					this._curIndex = 0;
			}
			else if (this._curType === 2) {
				const maxFrame = this._activeState.length;
				if (this._curIndex >= maxFrame)
					this._curIndex = 0;
			}
		}

		this._normalState.visible = false;
		this._hoverState.forEach(f => f.visible = false);
		this._activeState.forEach(f => f.visible = false);

		if (this._curType === 2 && this._activeState.length > 0)
			this._activeState[this._curIndex].visible = true;
		else if (this._curType === 1 && this._hoverState.length > 0)
			this._hoverState[this._curIndex].visible = true;
		else
			this._normalState.visible = true;
	}
}
