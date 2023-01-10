import FadeBase from "@/core/FadeBase";
import Layer from "@/core/Layer";

import SceneManager from "@/managers/SceneManager";

export default class Scene_Base extends FadeBase {
	public static readonly Class: typeof Scene_Base = this;

	private _windowLayer: Layer | null = null;

	private _started = false;
	private _active = false;

	public create () { }
	public afterCreate () {
		this.children.forEach(child => {
			const c = child as any;
			if ("create" in c && typeof c.create === "function")
				c.create();
		});
	}

	public start () {
		this._started = true;
		this._active = true;
	}
	public afterStart () {
		this.children.forEach(child => {
			const c = child as any;
			if ("start" in c && typeof c.start === "function")
				c.start();
		});
	}

	public update () {
		super.update();
		this.updateChildren();
	}
	public stop () {
		this._active = false;
	}
	public terminate () { }

	protected createWindowLayer () {
		this._windowLayer = new Layer();
		this._windowLayer.x = 0;
		this._windowLayer.y = 0;
		this._windowLayer.zIndex = 1000;
		this.addChild(this._windowLayer);
	}
	protected addWindow (window: Layer) {
		if (!this._windowLayer) {
			console.error("windowLayer not ready yet");
			return;
		}
		this._windowLayer.addChild(window);
	}

	private updateChildren () {
		this.children.forEach(_child => {
			const child = _child as (typeof _child & {
				update?: () => void;
			});
			if (typeof child.update === "function")
				child.update();
		});
	}

	public popScene () {
		SceneManager.pop();
	}

	public isActive () { return this._active; }
	public isStarted () { return this._started; }
	public isBusy () { return this.isFading(); }
}
