import * as PIXI from "pixi.js";
import Game from "..";

import Global from "@/core/Global";
import FadeBase from "@/core/FadeBase";
import Sprite from "@/core/Sprite";
import Layer from "@/core/Layer";
import Bitmap from "@/core/Bitmap";

import AudioManager from "@/managers/AudioManager";
import SceneManager from "@/managers/SceneManager";

import SolidRectangle from "@/component/SolidRectangle";
import SpriteImage from "@/component/SpriteImage";
import SpriteAnimation from "@/component/SpriteAnimation";
import FadeSprite from "@/component/FadeSprite";
import Button from "@/component/Button";

import Window_History from "@/windows/Window_History";
import Window_SaveLoad from "@/windows/Window_SaveLoad";

import SceneBase from "./Scene_Base";
import Scene_FadeBase from "./Scene_FadeBase";
import Scene_Title from "./Scene_Title";

import GameScript, { ScriptSelection } from "@/game/GameScript";

// z-index
//          1 : BG
// 100 ~ 9999 : Picture
//      10001 : Textbox
//      10002 : Selection
//      10003 : Menu/Option Button

interface ShakingData {
	threshold: number;
	duration: number;
	begin: number;
}

export default class Scene_Game extends Scene_FadeBase {
	public static readonly Class: typeof SceneBase = this;

	private readonly TextNextCharTime = [ // 한 글자당 표시되는데 소요되는 시간 (Frametime = 1/120)
		3, 6, 9, // 0.025, 0.05, 0.075 초
	];
	private readonly AutoNextTime = 240; // 대사가 끝난 후 다음 문장으로 넘어가기 전 대기할 시간 (Frametime = 1/120)

	private get TextSpeed () { return Global.get<number>("textspeed", 1) }

	private scriptStack: GameScript[] = [];

	private _auto = false;
	private _autoCounter = 0;

	private _bg: FadeSprite | null = null;
	private _pictures: Record<number, FadeSprite> = {};

	private _textbox: FadeBase | null = null;
	private _tellerbox: SpriteImage | null = null;
	private _textnext: SpriteImage | null = null;
	private _autoanim: SpriteAnimation | null = null;

	private _teller: PIXI.Text | null = null;

	private _text: PIXI.Text | null = null;
	private _textOriginal: string = "";
	private _textCurrent = 0;
	private _textCounter = 0;

	private _windowHistory: Window_History | null = null;
	private _windowSaveLoad: Window_SaveLoad | null = null;

	private _debugText: PIXI.Text | null = null;

	private _buttonbox: FadeBase | null = null;

	private _selection: Layer | null = null;
	private _selections: Array<ScriptSelection & { elem: Button }> = [];

	private _shaking: ShakingData | null = null;

	private static _entry = "0";
	private static _loadTo = 0;

	static prepareLoad (script: string, cursor: number) {
		Scene_Game._entry = script;
		Scene_Game._loadTo = cursor;
	}

	public create () {
		super.create();

		this.sortableChildren = true;

		this.addChild(new SolidRectangle());

		this._debugText = new PIXI.Text("", {
			fill: "#FFF",
			fontSize: 18,
			fontFamily: "NanumSquare",
			stroke: "#000",
			strokeThickness: 3,
		});
		this._debugText.zIndex = 999999;
		this._debugText.x = 10;
		this._debugText.y = 10;
		this.addChild(this._debugText);

		// History Window
		this._windowHistory = new Window_History();
		this._windowHistory.hide();
		this._windowHistory.setBox(
			Game.width / 2 - (Game.width - 200) / 2,
			Game.height / 2 - (Game.height - 200) / 2,
			Game.width - 200,
			Game.height - 200,
		);
		this._windowHistory.zIndex = 10003;
		this.addChild(this._windowHistory);

		// Save/Load Window
		this._windowSaveLoad = new Window_SaveLoad(this);
		this._windowSaveLoad.hide();
		this._windowSaveLoad.zIndex = 10003;
		this.addChild(this._windowSaveLoad);

		// Textbox
		this._textbox = new FadeBase();
		this._textbox.readyFadeIn(); // Alpha 0
		this._textbox.x = 120;
		this._textbox.y = 458;
		this._textbox.zIndex = 10001;
		this._textbox.onUpdate(() => {
			if (!this._text || !this._text.visible) return;

			if (this._textCurrent < this._textOriginal.length) {
				this._autoCounter = 0;
				if (this._textnext) // next indicator
					this._textnext.alpha = 0;

				this._textCounter++;

				if (this._textCounter % this.TextNextCharTime[this.TextSpeed] === 0) {
					this._textCurrent++;
					this._text.text = this._textOriginal.substring(0, this._textCurrent);

					if (this._text.text.length === this._textOriginal.length)
						this._textCounter = 0;
				}
			} else {
				this._textCounter++;
				if (this._textnext && this._textOriginal.length > 0)
					this._textnext.alpha = Math.cos(this._textCounter * Math.PI / 180 * 2) / 2 + 0.5;

				if (this._auto) {
					this._autoCounter++;
					if (this._autoCounter >= this.AutoNextTime)
						this.tryNext();
				}
			}
		});
		this.addChild(this._textbox);

		//#region Textbox
		this._textbox.addChild(new SpriteImage("IMG/UI/sprite", "text_box"));

		this._tellerbox = new SpriteImage("IMG/UI/sprite", "teller_box");
		this._tellerbox.sortableChildren = true;
		this._tellerbox.x = 947 - 151 - 2;
		this._tellerbox.y = 2;
		this._tellerbox.visible = false;
		this._textbox.addChild(this._tellerbox);

		this._teller = new PIXI.Text("", {
			fill: "#FFF",
			fontSize: 24,
			fontFamily: "NanumSquare",
			align: "right",
		});
		this._teller.x = 151 - 15;
		this._teller.y = 25;
		this._teller.anchor.set(1, 0.5);
		this._tellerbox.addChild(this._teller);

		this._text = new PIXI.Text("", {
			fill: "#FFF",
			stroke: "#000",
			strokeThickness: 4,
			fontSize: 28,
			fontFamily: "NanumSquare",
			wordWrap: true,
			wordWrapWidth: 947 - 40,
		});
		this._text.x = 20;
		this._text.visible = false;
		this._textbox.addChild(this._text);

		this._textnext = new SpriteImage("IMG/UI/sprite", "text_next");
		this._textnext.anchor.set(1);
		this._textnext.x = 947 - 3;
		this._textnext.y = 242 - 2;
		this._textnext.alpha = 0;
		this._textbox.addChild(this._textnext);

		this._autoanim = new SpriteAnimation("IMG/UI/sprite", "btn_auto_on")
			.setPosition(947 - 121 - 3, 242 - 67 - 3)
			.setFrameTime(8);
		this._autoanim.visible = false;
		this._textbox.addChild(this._autoanim);

		this._buttonbox = new FadeBase();
		this._buttonbox.x = 947 + 10;
		this._buttonbox.y = 0;
		this._buttonbox.addChild(
			new Button("IMG/UI/sprite", "btn_history")
				.setPosition(0, 0)
				.onClick(() => {
					console.log("history");
				}),
			new Button("IMG/UI/sprite", "btn_auto")
				.setPosition(0, 45)
				.onClick(() => {
					this._auto = !this._auto;

					if (this._autoanim) {
						this._autoCounter = 0;
						this._autoanim.visible = this._auto;
						if (this._textnext)
							this._textnext.visible = !this._auto;
					}
				}),
			new Button("IMG/UI/sprite", "btn_save")
				.setPosition(0, 90)
				.onClick(() => {
					const window = this._windowSaveLoad!;
					window.setType("save");
					window.open();
				}),
			new Button("IMG/UI/sprite", "btn_load")
				.setPosition(0, 135)
				.onClick(() => {
					const window = this._windowSaveLoad!;
					window.setType("load");
					window.open();
				}),
			new Button("IMG/UI/sprite", "btn_ui")
				.setPosition(0, 180)
				.onClick(() => {
					this._buttonbox!.visible = false;
					this._textbox!.visible = false;
					this._selection!.visible = false;
				}),
		);
		this._textbox.addChild(this._buttonbox);
		//#endregion

		this._selection = new Layer();
		this._selection.interactive = true;
		this._selection.zIndex = 10002;
		this._selection.visible = false;
		this.addChild(this._selection);

		this._selection.addChild(new SolidRectangle(0xB0000000));

		this.onClick(() => {
			if (!this._buttonbox!.visible) {
				this._buttonbox!.visible = true;
				this._textbox!.visible = true;

				if (this._selections.length > 0)
					this._selection!.visible = true;

				return;
			}

			this.tryNext();
		});

		this.alpha = 0;
		AudioManager.blocked = true;
	}

	public start () {
		super.start();

		// this.loadScript(new Game0());
		(async () => this.loadScript(
			new (await import(`/src/js/game/${Scene_Game._entry}.js`)).default(Scene_Game._loadTo),
		))();
	}

	public update (): void {
		super.update();

		if (this._shaking) {
			if (this._shaking.duration > 0)
				this._shaking.duration--;

			if (this._shaking.duration === 0) {
				this.position.set(0);
				this._shaking = null;

				this.top()?.unshake();
			} else {
				const rx = this._shaking.threshold * (Math.random() - 0.5);
				const ry = this._shaking.threshold * (Math.random() - 0.5);
				this.position.set(rx, ry);
			}
		}

		if (this._debugText) {
			const top = this.top();
			this._debugText.text = `${top?.scriptName || "empty"}:${top?.scriptCursor || -1}`;
		}

		this.top()?.next(); // Update Top
	}

	public currentScript (): { script: string, cursor: number } | null {
		const top = this.top();
		if (!top) return null;
		return {
			script: top.scriptName,
			cursor: top.scriptCursor,
		};
	}
	public snap (): Bitmap | null {
		const top = this.top();
		if (!top) return null;

		if (this._textbox) this._textbox.zIndex = -1;
		const snap = Bitmap.snap(this);

		if (this._textbox) this._textbox.zIndex = 10001;
		return snap;
	}

	private top (): GameScript | null {
		if (this.scriptStack.length > 0)
			return this.scriptStack[this.scriptStack.length - 1] || null;
		return null;
	}
	private tryNext () {
		const top = this.top(); // 실행중인 스크립트가 없거나 초기화 안됨
		if (!top || !this._text || !this._textbox) return;

		if (this._textbox.isFading()) return; // 대사창이 나타나고 있거나 사라지고 있는 경우

		if (!this._text.visible) { // 텍스트가 표시중이지 않다면 block만 해제
			top.unblock();
			return;
		}

		if (this._textCurrent >= this._textOriginal.length) { // 텍스트가 전부 표시된 상태라면 block 해제
			top.unblock();
			return;
		}

		// 텍스트가 표시중이라면 즉시 전부 표시하도록 변경
		this._textCurrent = this._textOriginal.length;
		this._text.text = this._textOriginal;
	}

	private loadScript (script: GameScript) {
		this.scriptStack.push(script);
		this.initGameHandlers(script);
		this.addChild(script);
	}
	private initGameHandlers (script: GameScript) {
		script.addEventListener("end", () => {
			this.removeChild(script);
			this.scriptStack.pop();

			if (this.scriptStack.length === 0) {
				AudioManager.stopAll();

				this.shutdown(FadeBase.slowFadeSpeed(), () => {
					setTimeout(() => SceneManager.goto(Scene_Title), 2000);
				});
			}
		});
		script.addEventListener("load", (script: GameScript) => {
			console.log("New script loaded, " + script.scriptName);
			this.loadScript(script);
		});
		script.addEventListener("loaded", (line: number) => {
			this.alpha = 1;
			AudioManager.blocked = false;
		});

		script.addEventListener("bg", (bg: string | null | undefined, cb: (el: FadeSprite | null, sprite?: Sprite) => void) => {
			if (bg !== undefined) {
				if (this._bg) {
					this.removeChild(this._bg);
					this._bg = null;
				}

				if (bg) {
					this._bg = new FadeSprite(`BG/${bg}.jpg`);
					this._bg.zIndex = 1;
					this.addChild(this._bg);

					const sprite = this._bg.sprite;
					const refresh = () => {
						sprite.x = Game.width / 2;
						sprite.y = Game.height / 2;
						sprite.anchor.set(0.5);

						const r = Math.max(Game.width / sprite.bitmap.width, Game.height / sprite.bitmap.height);
						sprite.scale.set(r);
					};

					if (sprite.bitmap.isReady())
						refresh();
					else
						sprite.bitmap.addLoadListener(() => refresh());

					return cb(this._bg, sprite);
				}
			}
			cb(this._bg, this._bg?.sprite);
		});
		script.addEventListener("picture", (id: number, picture: string | null | undefined, cb: (el: FadeSprite | null, sprite?: Sprite) => void) => {
			if (picture !== undefined) {
				if (id in this._pictures) {
					this.removeChild(this._pictures[id]);
					delete this._pictures[id];
				}

				if (picture) {
					this._pictures[id] = new FadeSprite(`IMG/${picture}`);
					this._pictures[id].zIndex = 100 + id;
					this.addChild(this._pictures[id]);

					return cb(this._pictures[id], this._pictures[id].sprite);
				}
			}
			cb(this._pictures[id], this._pictures[id]?.sprite);
		});

		script.addEventListener("close", (cb: () => void) => {
			if (!this._textbox || this._textbox.opacity === 0) return;

			const final = () => {
				this._textOriginal = "";
				this._textCurrent = 0;
				this._textCounter = 0;

				if (this._tellerbox) this._tellerbox.visible = false;
				if (this._teller) this._teller.text = "";
				if (this._text) this._text.text = "";
				if (this._textnext) this._textnext.alpha = 0;
				cb();
			};

			if (script.scriptCursor < Scene_Game._loadTo) {
				this._textbox.startFadeOut(0);
				return final();
			}

			this._textbox.startFadeOut(60);
			setTimeout(final, 500);
		});
		script.addEventListener("say", (teller: string, text: string) => {
			if (!this._teller || !this._tellerbox || !this._text || !this._textbox)
				return;

			if (this._windowHistory)
				this._windowHistory.addLog(text, teller);

			const cb = () => {
				this._teller!.text = teller;
				this._tellerbox!.visible = true;

				this._textOriginal = text;
				this._textCurrent = 0;
				this._textCounter = 0;

				this._text!.y = 20;
				this._text!.text = "";
				this._text!.visible = true;
			};

			if (this._textbox.opacity === 0) {
				if (script.scriptCursor < Scene_Game._loadTo) {
					this._textbox.startFadeIn(0);
					return cb();
				}

				this._textbox.startFadeIn(60); // frame, 120 = 1sec
				setTimeout(() => cb(), 500);
			} else
				cb();
		});
		script.addEventListener("text", (text: string) => {
			if (!this._teller || !this._tellerbox || !this._text || !this._textbox)
				return;

			if (this._windowHistory)
				this._windowHistory.addLog(text);

			const cb = () => {
				this._tellerbox!.visible = false;

				this._textOriginal = text;
				this._textCurrent = 0;
				this._textCounter = 0;

				this._text!.y = 20;
				this._text!.text = "";
				this._text!.visible = true;
			};

			if (this._textbox.opacity === 0) {
				if (script.scriptCursor < Scene_Game._loadTo) {
					this._textbox.startFadeIn(0);
					return cb();
				}

				this._textbox.startFadeIn(60); // frame, 120 = 1sec
				setTimeout(() => cb(), 500);
			} else
				cb();
		});
		script.addEventListener("selection", (selection: Array<ScriptSelection | string>) => {
			if (!this._selection) return;

			const sel = this._selection;

			const h = (this._selections.length * 56) + ((this._selections.length - 1) * 24);
			const x = sel.width / 2 - 462 / 2;
			const y = sel.height / 2 - h - 200;

			this._selections = selection.map((e, i) => {
				const key = typeof e === "string" ? "" : e.key;
				const text = typeof e === "string" ? e : e.text;

				const btn = new Button("IMG/UI/sprite", "btn_selection")
					.setPosition(x, y + i * 80)
					.onClick(() => {
						sel.visible = false;

						this._selections.splice(0, this._selections.length)
							.forEach(e => sel.removeChild(e.elem));

						script.selected = key;
						script.unblock();
					});

				let fs = 24;
				while (true) {
					const metrics = PIXI.TextMetrics.measureText(text, new PIXI.TextStyle({
						fontFamily: "NanumSquare",
						fontSize: fs,
					}));
					if (metrics.width > 462 - 35 - 15)
						fs -= 0.5;
					else
						break;
				}

				const txt = new PIXI.Text(text, {
					fill: "#FFFFFFFF",
					fontFamily: "NanumSquare",
					fontSize: fs,
				});
				txt.position.set(35, 28);
				txt.anchor.set(0, 0.5);
				btn.addChild(txt);

				return {
					...(typeof e === "string" ? { key: "", text: e } : e),
					elem: btn,
				};
			});

			this._selections.forEach(e => sel.addChild(e.elem));
			sel.visible = true;
		});
		script.addEventListener("shake", (threshold, duration) => {
			this._shaking = {
				threshold,
				duration,
				begin: Game.frameCount,
			};
		});
	}
}
