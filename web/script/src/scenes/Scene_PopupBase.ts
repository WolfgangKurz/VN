import * as PIXI from "pixi.js";

import Sprite from "@/core/Sprite";

import SceneManager from "@/managers/SceneManager";

import Scene_Base from "./Scene_Base";
import Scene_FadeBase from "./Scene_FadeBase";

export default class Scene_PopupBase extends Scene_FadeBase {
	public static readonly Class: typeof Scene_Base = this;

	private _backgroundFilter: PIXI.Filter | null = null;
	private _backgroundSprite: Sprite | null = null;

	public create () {
		const bitmap = SceneManager.backgroundBitmap();
		if (!bitmap) return;

		this._backgroundFilter = new PIXI.filters.BlurFilter(2, 1);
		this._backgroundSprite = new Sprite(bitmap);
		this._backgroundSprite.filters = [this._backgroundFilter];
		// this._backgroundSprite.opacity = 192;
		this.addChild(this._backgroundSprite);
	}
}
