import * as PIXI from "pixi.js";

import Game from "..";

import Global from "@/core/Global";
import Bitmap from "@/core/Bitmap";
import Sprite from "@/core/Sprite";
import Layer from "@/core/Layer";
import loadSpritesheet from "@/core/Spritesheet";

import AudioManager from "@/managers/AudioManager";

import Button from "@/component/Button";
import Slider from "@/component/Slider";
import SpriteImage from "@/component/SpriteImage";
import WindowBase from "@/component/WindowBase";

export default class Window_Option extends WindowBase {
	private bgSprite: Sprite;
	private buttonLayer: Layer;

	private textSpeedBG: SpriteImage;

	private volTextSFX: PIXI.Text;
	private volTextBGM: PIXI.Text;

	private sliderSFX: Slider | null = null;
	private sliderBGM: Slider | null = null;

	constructor () {
		super();

		// background
		this.bgSprite = new Sprite(Bitmap.load("BG/BG_Option"));
		this.addChild(this.bgSprite);

		// slider
		loadSpritesheet("IMG/Option/sprite").then(sheet => {
			this.sliderSFX = new Slider({
				bar: PIXI.Sprite.from(sheet.textures["bar.png"].clone()),
				thumb: PIXI.Sprite.from(sheet.textures["bar_thumb.png"].clone()),
				active: PIXI.Sprite.from(sheet.textures["bar_active.png"].clone()),
				minValue: 0,
				maxValue: 100,
				value: Global.get<number>("volume.sfx", 100),
			});
			this.sliderSFX.x = 300;
			this.sliderSFX.y = 300;
			this.sliderSFX.on("change", (v: number) => {
				const vol = Math.round(v);
				Global.set("volume.sfx", vol);
				if (this.volTextSFX) this.volTextSFX.text = vol.toString();
				AudioManager.seVolume = vol;
			});
			this.addChild(this.sliderSFX);

			this.sliderBGM = new Slider({
				bar: PIXI.Sprite.from(sheet.textures["bar.png"].clone()),
				thumb: PIXI.Sprite.from(sheet.textures["bar_thumb.png"].clone()),
				active: PIXI.Sprite.from(sheet.textures["bar_active.png"].clone()),
				minValue: 0,
				maxValue: 100,
				value: Global.get<number>("volume.bgm", 100),
			});
			this.sliderBGM.x = 300;
			this.sliderBGM.y = 385;
			this.sliderBGM.on("change", (v: number) => {
				const vol = Math.round(v);
				Global.set("volume.bgm", vol);
				if (this.volTextBGM) this.volTextBGM.text = vol.toString();
				AudioManager.bgmVolume = vol;
			});
			this.addChild(this.sliderBGM);
		});

		// texts
		this.volTextSFX = new PIXI.Text(Global.get<number>("volume.sfx", 100).toString(), {
			fontSize: 30,
			fontWeight: "800",
			fontFamily: "NanumSquare",
			fill: "#222",
		});
		this.volTextSFX.x = 860;
		this.volTextSFX.y = 305;

		this.volTextBGM = new PIXI.Text(Global.get<number>("volume.bgm", 100).toString(), {
			fontSize: 30,
			fontWeight: "800",
			fontFamily: "NanumSquare",
			fill: "#222",
		});
		this.volTextBGM.x = 860;
		this.volTextBGM.y = 390;

		// buttons
		this.buttonLayer = new Layer();
		this.buttonLayer.addChild(
			new Button("IMG/Option/sprite", "btn_back")
				.setPosition(1280 - 255, 95)
				.onClick(() => {
					if (this.isFading()) return;
					this.close();
				}),

			this.volTextSFX,
			this.volTextBGM,

			// 텍스트 속도 영역
			this.textSpeedBG = new SpriteImage("IMG/Option/sprite", "btn_selected")
				.setPosition(300 + 195 * Global.get<number>("textspeed", 1) - 5, 467 - 5),

			new Button("IMG/Option/sprite", "btn_slow")
				.setPosition(300, 467)
				.onClick(() => {
					if (this.isFading()) return;

					Global.set("textspeed", 0);
					this.textSpeedBG!.x = 300 - 5;
				}),
			new Button("IMG/Option/sprite", "btn_regular")
				.setPosition(495, 467)
				.onClick(() => {
					if (this.isFading()) return;

					Global.set("textspeed", 1);
					this.textSpeedBG!.x = 495 - 5;
				}),
			new Button("IMG/Option/sprite", "btn_fast")
				.setPosition(690, 467)
				.onClick(() => {
					if (this.isFading()) return;

					Global.set("textspeed", 2);
					this.textSpeedBG!.x = 690 - 5;
				}),
		);
		this.addChild(this.buttonLayer);
	}

	public start () {
		super.start();

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
	}
}
