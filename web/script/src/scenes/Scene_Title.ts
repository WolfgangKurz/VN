import Game from "..";

import Session from "@/core/Session";
import Bitmap from "@/core/Bitmap";
import Sprite from "@/core/Sprite";
import FadeBase from "@/core/FadeBase";

import AudioManager from "@/managers/AudioManager";
import SceneManager from "@/managers/SceneManager";

import Scene_Base from "./Scene_Base";
import Scene_FadeBase from "./Scene_FadeBase";

import Scene_Game from "./Scene_Game";
import Scene_Collection from "./Scene_Collection";
import Window_Option from "../windows/Window_Option";

import Button from "@/component/Button";

export default class Scene_Title extends Scene_FadeBase {
	public static readonly Class: typeof Scene_Base = this;

	private bgSprite: Sprite | null = null;
	private titleSprite: Sprite | null = null;
	private buttonLayer: FadeBase | null = null;

	private windowOption: Window_Option | null = null;

	public create () {
		super.create();

		// background
		this.bgSprite = new Sprite(Bitmap.load("BG/BG_Title"));
		this.addChild(this.bgSprite);

		// title
		this.titleSprite = new Sprite(Bitmap.load("IMG/logo1"));
		this.titleSprite.x = 1200;
		this.titleSprite.y = 40;
		this.titleSprite.anchor.x = 1;
		this.addChild(this.titleSprite);

		this.createWindowLayer();

		// buttons
		this.buttonLayer = new FadeBase();
		this.buttonLayer.x = 50;
		this.buttonLayer.y = 240;
		this.buttonLayer.addChild(
			new Button("IMG/Title/sprite", "btn_start")      // Game Start
				.setPosition(0, 0)
				.setFrameTime(60)
				.onClick(() => {
					if (this.buttonLayer!.faded <= 0 || this.buttonLayer!.isFading()) return;
					if (!this.windowOption || this.windowOption.isFading()) return;

					AudioManager.fadeOutBGM(120 / 60);
					this.shutdown(120, () => {
						Scene_Game.prepareLoad("0", 0);
						
						SceneManager.push(Scene_Game);
					});
				}),
			new Button("IMG/Title/sprite", "btn_load")       // Game Load
				.setPosition(0, 120)
				.setFrameTime(60),
			new Button("IMG/Title/sprite", "btn_collection") // Collection
				.setPosition(0, 240)
				.setFrameTime(60)
				.onClick(() => {
					if (this.buttonLayer!.faded <= 0 || this.buttonLayer!.isFading()) return;
					if (!this.windowOption || this.windowOption.isFading()) return;

					this.shutdown(undefined, () => SceneManager.push(Scene_Collection));
				}),
			new Button("IMG/Title/sprite", "btn_option")     // Option
				.setPosition(0, 360)
				.setFrameTime(60)
				.onClick(() => {
					if (this.buttonLayer!.faded <= 0 || this.buttonLayer!.isFading()) return;
					if (!this.windowOption || this.windowOption.isFading()) return;

					this.windowOption.open();
				}),
		);
		this.addChild(this.buttonLayer);

		// window_option
		this.windowOption = new Window_Option();
		this.windowOption.hide();
		this.addChild(this.windowOption);
	}
	public start () {
		super.start();
		SceneManager.clearStack();

		(s => {
			const refresh = () => {
				s.x = Game.width / 2;
				s.y = Game.height / 2;
				s.anchor.set(0.5);

				const r = Math.max(Game.width / s.bitmap.width, Game.height / s.bitmap.height);
				s.scale.set(r);
			};

			if (s.bitmap.isReady())
				refresh();
			else
				s.bitmap.addLoadListener(() => refresh());
		})(this.bgSprite!);

		// title bgm
		AudioManager.playBGM({
			name: "title_first",
			volume: 100, // %
		});

		this.startFadeIn(FadeBase.slowFadeSpeed());
		this.buttonLayer?.readyFadeIn();
	}

	public update () {
		if (!this.isBusy() && this.buttonLayer) {
			if (this.buttonLayer.faded < 1)
				this.buttonLayer.startFadeIn(FadeBase.slowFadeSpeed());
		}

		super.update();
	}
	public terminate () {
		super.terminate();
		SceneManager.snapForBackground();

		if (this.titleSprite)
			this.titleSprite.bitmap.destroy();
	}

	public isBusy () {
		return this.buttonLayer?.isFading() || super.isBusy();
	}
}
