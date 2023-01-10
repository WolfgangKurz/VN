import Game from "..";

import Bitmap from "@/core/Bitmap";
import Sprite from "@/core/Sprite";
import Layer from "@/core/Layer";
import FadeBase from "@/core/FadeBase";

import AudioManager from "@/managers/AudioManager";
import SceneManager from "@/managers/SceneManager";

import Scene_Base from "./Scene_Base";
import Scene_PopupBase from "./Scene_PopupBase";
import Scene_FadeBase from "./Scene_FadeBase";

import Button from "@/component/Button";

export default class Scene_Collection extends Scene_FadeBase {
	public static readonly Class: typeof Scene_Base = this;

	private contentLayer: FadeBase | null = null;

	private bgSprite: Sprite | null = null;
	private buttonLayer: Layer | null = null;

	public create () {
		super.create();

		this.contentLayer = new FadeBase();
		this.addChild(this.contentLayer);

		// background
		this.bgSprite = new Sprite(Bitmap.load("BG/BG_Collection"));
		this.contentLayer.addChild(this.bgSprite);

		// buttons
		this.buttonLayer = new Layer();
		this.buttonLayer.addChild(
			new Button("IMG/Collection/sprite", "btn_back")
				.setPosition(1280 - 94 - 10, 10)
				.onClick(() => {
					this.shutdown(undefined, () => SceneManager.pop());
				}),

			new Button("IMG/Collection/sprite", "btn_event")     // Event
				.setPosition(50, 240)
				.setFrameTime(60)
				.onClick(() => {
					// SceneManager.push(Scene_Events);
				}),
			new Button("IMG/Collection/sprite", "btn_illust")    // Illust
				.setPosition(50, 360)
				.setFrameTime(60)
				.onClick(() => {
					// SceneManager.push(Scene_Illusts);
				}),
			new Button("IMG/Collection/sprite", "btn_music")     // Music
				.setPosition(50, 480)
				.setFrameTime(60)
				.onClick(() => {
					// SceneManager.push(Scene_Musics);
				}),
		);
		this.contentLayer.addChild(this.buttonLayer);
	}
	public start () {
		super.start();
		this.contentLayer?.startFadeIn(FadeBase.slowFadeSpeed());

		(s => {
			const refresh = () => {
				s.x = Game.width / 2;
				s.y = Game.height / 2;
				s.anchor.set(0.5);

				const r = Math.max(Game.width / s.bitmap.width, Game.height / s.bitmap.height, 1);
				s.scale.x = r;
				s.scale.y = r;
			};

			if (s.bitmap.isReady())
				refresh();
			else
				s.bitmap.addLoadListener(() => refresh());
		})(this.bgSprite!);

		// title bgm
		AudioManager.playBGM({
			name: "Daily",
			volume: 1, // %
		});
	}

	public isBusy () {
		return (
			// this._commandWindow.isClosing() ||
			super.isBusy()
		);
	}
}
