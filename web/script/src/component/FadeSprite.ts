import FadeBase from "@/core/FadeBase";
import Bitmap from "@/core/Bitmap";
import Sprite from "@/core/Sprite";

export default class FadeSprite extends FadeBase {
	private _sprite: Sprite;

	public get sprite () { return this._sprite; }

	constructor (path: string) {
		super();
		this._sprite = new Sprite(Bitmap.load(path));
		this.addChild(this._sprite);
	}
}
