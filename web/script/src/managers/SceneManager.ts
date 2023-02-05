import Game from "..";
import Bitmap from "@/core/Bitmap";
import Input from "@/core/Input";

import Scene_Base from "@/scenes/Scene_Base";

class SceneManagerClass {
	private _scene: Scene_Base | null = null;
	private _nextScene: Scene_Base | null = null;
	private readonly _stack: Array<typeof Scene_Base> = [];

	private _exiting = false;
	private _smoothDeltaTime = 1;
	private _elapsedTime = 0;

	private _previousScene: Scene_Base | null = null;
	private _previousClass: typeof Scene_Base | null = null;

	private _backgroundBitmap: Bitmap | null = null;

	private initialize () {
		Game.setTickHandler(deltaTime => this.update(deltaTime));
	}
	private DetermineRepeatNumber (deltaTime: number): number {
		this._smoothDeltaTime *= 0.8;
		this._smoothDeltaTime += Math.min(deltaTime, 2) * 0.2;

		if (this._smoothDeltaTime >= 0.9) {
			this._elapsedTime = 0;
			return Math.round(this._smoothDeltaTime);
		} else {
			this._elapsedTime += deltaTime;
			if (this._elapsedTime >= 1) {
				this._elapsedTime -= 1;
				return 1;
			}
			return 0;
		}
	}
	private terminate () {
		window.close();
	}

	public run (sceneClass: typeof Scene_Base) {
		this.initialize();
		this.goto(sceneClass);
		Game.startGameLoop();
	}

	public update (deltaTime: number) {
		const n = this.DetermineRepeatNumber(deltaTime);
		for (let i = 1; i <= n; i++)
			this.updateMain();
	}
	public updateMain () {
		Game.frameCount++;

		Input.update();
		this.changeScene();
		this.updateScene();
	}
	public changeScene () {
		if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
			if (this._scene) {
				this._scene.terminate();
				this.onSceneTerminate();
			}

			this._scene = this._nextScene;
			this._nextScene = null;
			if (this._scene) {
				this._scene.create();
				this.onSceneCreate();
				this._scene.afterCreate();
			}

			if (this._exiting)
				this.terminate();
		}
	}
	public updateScene () {
		if (this._scene) {
			if (this._scene.isStarted())
				this._scene.update();
			else {
				this.onBeforeSceneStart();
				this._scene.start();
				this.onSceneStart();
				this._scene.afterStart();
			}
		}
	}

	public goto (sceneClass: typeof Scene_Base | null) {
		if (sceneClass)
			this._nextScene = new sceneClass();

		if (this._scene)
			this._scene.stop();
	}
	public push (sceneClass: typeof Scene_Base) {
		if (this._scene)
			this._stack.push((this._scene.constructor as typeof Scene_Base).Class);
		this.goto(sceneClass);
	}
	public pop () {
		if (this._stack.length > 0)
			this.goto(this._stack.pop()!);
		else
			this.exit();
	}
	public exit () {
		this.goto(null);
		this._exiting = true;
	}
	public clearStack () {
		this._stack.splice(0, this._stack.length);
	}
	public stop () {
		Game.stopGameLoop();
	}

	public snap () {
		return Bitmap.snap(this._scene!);
	}
	public snapForBackground () {
		if (this._backgroundBitmap)
			this._backgroundBitmap.destroy();
		this._backgroundBitmap = this.snap();
	}
	public backgroundBitmap () {
		return this._backgroundBitmap;
	}

	public resume () {
		Input.update();
		Game.startGameLoop();
	}

	public isGameActive () {
		try {
			return document.hasFocus();
		} catch (e) {
			return true;
		}
	};

	public onSceneTerminate () {
		this._previousScene = this._scene;
		this._previousClass = (this._scene!.constructor as typeof Scene_Base).Class;
		Game.setStage(null);
	};
	public onSceneCreate () {
		// Placeholder
	};
	public onBeforeSceneStart () {
		if (this._previousScene) {
			this._previousScene.destroy();
			this._previousScene = null;
		}
	};
	public onSceneStart () {
		Game.setStage(this._scene!);
	};
	public isSceneChanging () {
		return this._exiting || !!this._nextScene;
	};

	public isCurrentSceneBusy () {
		return this._scene && this._scene.isBusy();
	};

	public isNextScene (sceneClass: typeof Scene_Base) {
		return this._nextScene && this._nextScene.constructor === sceneClass;
	};

	public isPreviousScene (sceneClass: typeof Scene_Base) {
		return this._previousClass === sceneClass;
	};
}

const SceneManager = new SceneManagerClass();
export default SceneManager;
