import * as PIXI from "pixi.js";

import Layer from "./Layer";

import AudioManager from "@/managers/AudioManager";

export default class FadeBase extends Layer {
	private _fadeSign = 0;
	private _fadeDuration = 0;
	private _faded = 0;

	private _alphaFilter = new PIXI.filters.AlphaFilter();

	public get faded () { return this._faded; }
	public set faded (value: number) { this._faded = value }

	public get opacity () { return this._alphaFilter.alpha; }
	public set opacity (value: number) { this._alphaFilter.alpha = value }

	private _updateHandler: ((this: FadeBase) => void) | null = null;

	constructor () {
		super();
		this.filters = [this._alphaFilter];
	}

	public onUpdate (handler: ((this: FadeBase) => void) | null) {
		this._updateHandler = handler;
	}

	public update (): void {
		if (this._updateHandler)
			this._updateHandler.apply(this);

		this.updateFade();
		super.update();
	}

	public readyFadeIn () {
		this._fadeSign = 1;
		this._fadeDuration = 0;
		this.opacity = 0;
	}
	public readyFadeOut () {
		this._fadeSign = -1;
		this._fadeDuration = 0;
		this.opacity = 1;
	}

	public startFadeIn (duration?: number) {
		this._faded++;
		if (duration === 0) {
			this._fadeDuration = 0;
			this.opacity = 1;
			return;
		}

		this.readyFadeIn();
		this._fadeDuration = duration || FadeBase.fadeSpeed();
	}
	public startFadeOut (duration?: number) {
		this._faded++;
		if (duration === 0) {
			this._fadeDuration = 0;
			this.opacity = 0;
			return;
		}

		this.readyFadeOut();
		this._fadeDuration = duration || FadeBase.fadeSpeed();
	}

	public fadeOutAll () {
		const time = FadeBase.slowFadeSpeed() / 60;
		AudioManager.fadeOutBGM(time);
		this.startFadeOut(FadeBase.slowFadeSpeed());
	}
	public static fadeSpeed () { return 30; }
	public static slowFadeSpeed () { return this.fadeSpeed() * 2; }

	private updateFade () {
		if (this._fadeDuration > 0) {
			const d = this._fadeDuration;
			if (this._fadeSign > 0)
				this.opacity += (1 - this.opacity) / d;
			else
				this.opacity -= this.opacity / d;

			this._fadeDuration--;
		}
	}

	public isFading () { return this._fadeDuration > 0; }
}
