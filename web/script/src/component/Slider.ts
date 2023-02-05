import * as PIXI from "pixi.js";

import Stage from "@/core/Stage";
import loadSpritesheet from "@/core/Spritesheet";

export interface SliderOption {
	bar: PIXI.Sprite;
	thumb: PIXI.Sprite;
	active: PIXI.Sprite;

	minValue?: number;
	maxValue?: number;
	value?: number;
}

export default class Slider extends Stage {
	private _minValue: number = 0;
	private _maxValue: number = 0;
	private _value: number = 0;

	private _bar: PIXI.Sprite;
	private _thumb: PIXI.Sprite;
	private _active: PIXI.Sprite;

	constructor (options: SliderOption) {
		super();

		this.interactive = true;
		this.buttonMode = true;

		this._minValue = options.minValue ?? 0;
		this._maxValue = options.maxValue ?? 100;
		this._value = options.value ?? 50;

		this._bar = options.bar;
		this._thumb = options.thumb;
		this._active = options.active;

		this.width = this._bar.width;
		this.height = this._bar.height;

		this.addChild(this._bar, this._active, this._thumb);

		this._active.x = this._bar.width / 2 - this._active.width / 2;
		this._active.y = this._bar.height / 2 - this._active.height / 2;

		// this._thumb.x = this._bar.width / 2 - this._thumb.width / 2;
		this._thumb.y = this._bar.height / 2 - this._thumb.height / 2;

		this.on("pointerdown", (e: PIXI.InteractionEvent) => this.UpdateValue(e.data.getLocalPosition(this).x));
		this.on("pointermove", (e: PIXI.InteractionEvent) => this.UpdateValue(e.data.getLocalPosition(this).x));

		const tW = this._thumb.width;
		const value = (this._value - this._minValue) / (this._maxValue - this._minValue);
		this._thumb.x = (this._bar.width - tW) * value;
	}

	private UpdateValue (x: number) {
		if (!this._pressed) return;

		const tW = this._thumb.width;
		const value = Math.max(
			0,
			Math.min(1, (x - tW / 2) / (this._bar.width - tW)),
		);
		this._thumb.x = (this._bar.width - tW) * value;

		this._value = this._minValue + (this._maxValue - this._minValue) * value;
		this.listeners("change").forEach(fn => fn(this._value, [this._minValue, this._maxValue]));
	}
}
