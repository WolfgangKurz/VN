import * as PIXI from "pixi.js";

import Layer from "@/core/Layer";

import Game from "..";

export default class SolidRectangle extends Layer {
	private _rect: PIXI.Rectangle;
	private _color: number;

	private _graphics: PIXI.Graphics | null = null;

	constructor (color: number = 0x00000000) {
		super();

		this._rect = new PIXI.Rectangle(0, 0, Game.width, Game.height);
		this._color = color;

		this.updateGraphics();
	}

	public setRect (x: number, y: number, width: number, height: number): this {
		this._rect = new PIXI.Rectangle(x, y, width, height);
		this.updateGraphics();
		return this;
	}
	public getRect (): PIXI.Rectangle {
		return this._rect;
	}

	public setColor (color: number): this {
		this._color = color;
		this.updateGraphics();
		return this;
	}
	public getColor (): number {
		return this._color;
	}

	private updateGraphics () {
		if (this._graphics) {
			this.removeChild(this._graphics);
			this._graphics = null;
		}

		this._graphics = new PIXI.Graphics();
		this._graphics.beginFill(this._color);
		this._graphics.drawRect(this._rect.x, this._rect.y, this._rect.width, this._rect.height);
		this._graphics.endFill();

		const a = (this._color & 0xff000000) >>> 24;
		this._graphics.alpha = a / 255.0;

		this.addChild(this._graphics);
	}
}
