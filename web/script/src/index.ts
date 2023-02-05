import * as PIXI from "pixi.js";

import FPSCounter from "./core/FPSCounter";

import SceneManager from "./managers/SceneManager";
import Scene_Title from "./scenes/Scene_Title";

class GameClass {
	private _app: PIXI.Application;
	public get app () { return this._app; }

	private _canvas: HTMLCanvasElement | null = null;

	private _width: number = 1280;
	public get width () { return this._width; }

	private _height: number = 720;
	public get height () { return this._height; }

	public frameCount = 0;
	private _fpsCounter = new FPSCounter();

	private _tickHandler: ((deltaTime: number) => void) | null = null;

	constructor () {
		PIXI.utils.skipHello();
		PIXI.settings.GC_MAX_IDLE = 600;

		this.createCanvas();

		this._app = new PIXI.Application({
			view: this._canvas!,
			autoStart: false,
		});
		this.resize(this.width, this.height);

		this._app.ticker.remove(this._app.render, this._app);
		this._app.ticker.add(deltaTime => {
			this._fpsCounter.startTick();

			if (this._tickHandler)
				this._tickHandler(deltaTime);

			if (this._app.stage)
				this._app.render();

			this._fpsCounter.endTick();
		}, this);
	}

	public startGameLoop = () => this._app.start();
	public stopGameLoop = () => this._app.stop();

	public setStage (stage: PIXI.Container | null) {
		if (this._app)
			this._app.stage = stage as unknown as PIXI.Container;
	}

	public setTickHandler (handler: (deltaTime: number) => void) {
		this._tickHandler = handler;
	}

	public resize (width: number, height: number) {
		this._width = width;
		this._height = height;
		this._app.renderer.resize(width, height);

		this.updateCanvas();


		const win = window.nw.Window.get();
		win.resizeTo(width, height);
	};

	private createCanvas () {
		this._canvas = document.createElement("canvas");
		this._canvas.id = "canvas";
		this.updateCanvas();
		document.body.appendChild(this._canvas);
	}
	private updateCanvas () {
		if (!this._canvas) return;
		this._canvas.width = this._width;
		this._canvas.height = this._height;
		this._canvas.style.zIndex = "1";
	}
}

const Game = new GameClass();
export default Game;

const win = window.nw.Window.get();
win.setResizable(false);
document.title = win.title = "남십자성이 보이는 하늘 아래";

// Boot Scene
// SceneManager.run(Scene_Title);
import Scene_Game from "./scenes/Scene_Game";
Scene_Game.prepareLoad("Ch2Part3", 10);
SceneManager.run(Scene_Game);
