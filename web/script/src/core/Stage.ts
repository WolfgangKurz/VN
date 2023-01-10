import * as PIXI from "pixi.js";

import Game from "..";
import Input from "@/core/Input";

export default class Stage extends PIXI.Container {
	protected _hovered: boolean = false;
	protected _pressed: boolean = false;
	protected _clickHandler: (() => void) | null = null;

	private _hover = false;

	constructor () {
		super();

		this.on("pointerover", () => (this._hover = true));
		this.on("pointerout", () => (this._hover = false));

		this.on("pointerdown", () => (this._pressed = true));
		this.on("pointerup", () => (this._pressed = false));
		this.on("pointerupoutside", () => (this._pressed = false));

		const clickFn = () => {
			if (Input.lastClick !== Game.frameCount) {
				if (this._clickHandler)
					this._clickHandler();

				Input.lastClick = Game.frameCount;
			}
		};
		this.on("click", () => clickFn());
		this.on("tab", () => clickFn());

	}

	public isHover () {
		// const pt = new PIXI.Point(Input.x, Input.y);
		// const localPt = this.worldTransform.applyInverse(pt);
		// const { x, y } = localPt;

		// return x >= 0 && y >= 0 && x <= this.width && y <= this.height;
		return this._hover;
	}

	public onClick (cb: (() => void) | null): this {
		this._clickHandler = cb;
		this.interactive = cb !== null;
		return this;
	}

	public destroy () {
		super.destroy({
			children: true,
			texture: true,
		});
	}

	public using (callback: (this: Stage, object: Stage) => void): this {
		callback.call(this, this);
		return this;
	}

	public setPosition (x: number, y: number): this {
		this.x = x;
		this.y = y;
		return this;
	}
}
