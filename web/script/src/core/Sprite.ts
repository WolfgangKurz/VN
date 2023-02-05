import * as PIXI from "pixi.js";

import Utils from "./Utils";
import Bitmap from "./Bitmap";
import ColorFilter from "./Filters/ColorFilter";
import { nRGBA } from "./Filters/Types";

export default class Sprite extends PIXI.Sprite {
	private static _counter: number = 0;
	private static get _emptyTexture (): PIXI.Texture {
		const t = new PIXI.BaseTexture();
		t.setSize(1, 1);
		return new PIXI.Texture(t, new PIXI.Rectangle());
	}

	public spriteId: number;

	private _bitmap: Bitmap;
	public get bitmap () { return this._bitmap; }
	public set bitmap (value: Bitmap) {
		if (this._bitmap !== value) {
			this._bitmap = value;
			this.onBitmapChange();
		}
	}

	public get width () { return this._frame.width; }
	public set width (value: number) {
		this._frame.width = value;
		this.refresh();
	}

	public get height () { return this._frame.height; }
	public set height (value: number) {
		this._frame.height = value;
		this.refresh();
	}

	public get opacity () { return this.alpha * 255; }
	public set opacity (value: number) {
		this.alpha = Utils.clamp(value, 0, 255) / 255;
	}

	private _blendMode: PIXI.BLEND_MODES;
	public get BlendMode () { // super.blendMode is not property
		return this._colorFilter
			? this._colorFilter.blendMode
			: this._blendMode;
	}
	public set BlendMode (value: PIXI.BLEND_MODES) {
		this._blendMode = value;
		if (this._colorFilter)
			this._colorFilter.blendMode = value;
	}

	private _frame: PIXI.Rectangle;

	private _hue: number;
	private _blendColor: nRGBA;
	private _colorTone: nRGBA;
	private _colorFilter: ColorFilter | null;

	private _refreshFrame = false;

	constructor (bitmap: Bitmap) {
		super(Sprite._emptyTexture);

		const frame = new PIXI.Rectangle();
		this.spriteId = Sprite._counter++;
		this._bitmap = bitmap;
		this._frame = frame;
		this._hue = 0;
		this._blendColor = [0, 0, 0, 0];
		this._colorTone = [0, 0, 0, 0];
		this._colorFilter = null;
		this._blendMode = PIXI.BLEND_MODES.NORMAL;
		this.onBitmapChange();
	}

	public destroy () {
		super.destroy({
			children: true,
			texture: true,
		});
	}

	public update () {
		this.children.forEach(c => {
			const child = c as typeof c & { update?: () => void };
			if (typeof child.update === "function")
				child.update();
		});
	}

	public hide = () => this.visible = false;
	public show = () => this.visible = true;

	public move (x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public setFrame (x: number, y: number, width: number, height: number) {
		this._refreshFrame = false;

		const frame = this._frame;
		if (x !== frame.x || y !== frame.y || width !== frame.width || height !== frame.height) {
			frame.x = x;
			frame.y = y;
			frame.width = width;
			frame.height = height;
			this.refresh();
		}
	}

	public getHue = () => this._hue;
	public setHue (hue: number) {
		if (this._hue !== hue) {
			this._hue = hue;
			this.updateColorFilter();
		}
	}

	public getBlendColor = () => this._blendColor.slice();
	public setBlendColor (color: nRGBA) {
		if (!Utils.equals(this._blendColor, color)) {
			this._blendColor = color;
			this.updateColorFilter();
		}
	}

	public getTone = () => this._colorTone.slice();
	public setTone (tone: nRGBA) {
		if (!Utils.equals(this._colorTone, tone)) {
			this._colorTone = tone;
			this.updateColorFilter();
		}
	}

	private refresh () {
		const texture = this.texture;
		const frameX = Math.floor(this._frame.x);
		const frameY = Math.floor(this._frame.y);
		const frameW = Math.floor(this._frame.width);
		const frameH = Math.floor(this._frame.height);

		const baseTexture = this._bitmap ? this._bitmap.baseTexture : null;
		const baseTextureW = baseTexture ? baseTexture.width : 0;
		const baseTextureH = baseTexture ? baseTexture.height : 0;

		const realX = Utils.clamp(frameX, 0, baseTextureW);
		const realY = Utils.clamp(frameY, 0, baseTextureH);
		const realW = Utils.clamp(frameW - realX + frameX, 0, baseTextureW - realX);
		const realH = Utils.clamp(frameH - realY + frameY, 0, baseTextureH - realY);

		const frame = new PIXI.Rectangle(realX, realY, realW, realH);
		if (texture) {
			this.pivot.x = frameX - realX;
			this.pivot.y = frameY - realY;

			if (baseTexture) {
				texture.baseTexture = baseTexture;
				texture.frame = frame;
			}
			texture.updateUvs();
		}
	}

	private createColorFilter () {
		this._colorFilter = new ColorFilter();
		if (!this.filters) this.filters = [];
		this.filters.push(this._colorFilter);
	}
	private updateColorFilter () {
		if (!this._colorFilter)
			this.createColorFilter();

		this._colorFilter!.setHue(this._hue);
		this._colorFilter!.setBlendColor(this._blendColor);
		this._colorFilter!.setColorTone(this._colorTone);
	}

	private onBitmapChange () {
		if (this._bitmap) {
			this._refreshFrame = true;
			this._bitmap.addLoadListener(loaded => {
				if (this._bitmap && loaded === this._bitmap && this._refreshFrame) {
					this._refreshFrame = false;
					this._frame.width = this._bitmap.width;
					this._frame.height = this._bitmap.height;
				}
				this.refresh();
			});
		} else {
			this._refreshFrame = false;
			this.texture.frame = new PIXI.Rectangle();
		}
	}
}
