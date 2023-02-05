import SceneManager from "@/managers/SceneManager";

import Scene_Base from "./Scene_Base";

export default class Scene_FadeBase extends Scene_Base {
	public static readonly Class: typeof Scene_Base = this;

	private _shutdown: (() => void) | null = null;

	public shutdown (duration: number = 0, callback: () => void) {
		if (this._shutdown) return;

		this._shutdown = callback;
		this.startFadeOut(duration);
	}

	public update () {
		super.update();

		if (this._shutdown && !this.isFading()) {
			this._shutdown();
			this._shutdown = null;
		}
	}

	public terminate () {
		super.terminate();
		SceneManager.snapForBackground();
	}
}
