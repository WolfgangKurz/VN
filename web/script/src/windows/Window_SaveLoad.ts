import * as PIXI from "pixi.js";

import Save, { SaveInfo } from "@/core/Save";
import Session from "@/core/Session";
import Bitmap from "@/core/Bitmap";
import Sprite from "@/core/Sprite";
import Layer from "@/core/Layer";

import SceneManager from "@/managers/SceneManager";

import WindowBase from "@/component/WindowBase";
import Button from "@/component/Button";
import SpriteImage from "@/component/SpriteImage";

import Window_SaveLoadConfirm from "./Window_SaveLoadConfirm";

import Scene_Game from "@/scenes/Scene_Game";

type SaveLoadType = "save" | "load";

interface SaveButton {
	layer: Layer;

	back: Button;
	backEmpty: Button;

	thumbnail: PIXI.Sprite | null;

	textChapter: PIXI.Text;
	textName: PIXI.Text;
	textDate: PIXI.Text;
}
interface PageButton {
	normal: Button;
	active: Button;
}

export default class Window_SaveLoad extends WindowBase {
	private _scene: Scene_Game | null;

	private _bgSprite_Save: Sprite;
	private _bgSprite_Load: Sprite;

	private _buttonLayer: Layer;

	private _buttonTypeSave: Button | null = null;
	private _buttonTypeLoad: Button | null = null;
	private _buttonTypeSaveCurrent: SpriteImage | null = null;
	private _buttonTypeLoadCurrent: SpriteImage | null = null;

	private _confirmWindow: Window_SaveLoadConfirm;

	private _type: SaveLoadType = "save";
	public get type () { return this._type }

	private _slots: SaveButton[] = [];
	private _pageButtons: PageButton[] = [];

	private confirmSlot: number = 0;
	private saves: Array<SaveInfo | false> = [];
	private page: number = 1;

	constructor (sceneGame: Scene_Game | null, type: SaveLoadType = "save") {
		super();

		if (!sceneGame) type = "load"; // Savable?
		this._scene = sceneGame;

		// background
		this._bgSprite_Save = new Sprite(Bitmap.load("BG/BG_Save"));
		this._bgSprite_Load = new Sprite(Bitmap.load("BG/BG_Load"));
		this.addChild(this._bgSprite_Save, this._bgSprite_Load);
		this.setType(type);

		// buttons
		this._buttonLayer = new Layer();
		this._buttonLayer.addChild(
			new Button("IMG/SaveLoad/sprite", "btn_back")
				.setPosition(1280 - 114, 12)
				.onClick(() => {
					if (this.isFading()) return;
					this.close();
				}),
		);

		// mode changer
		if (this._scene) {
			this._buttonTypeSave = new Button("IMG/SaveLoad/sprite", "btn_save")
				.setPosition(1058, 210)
				.onClick(() => this.setType("save"));
			this._buttonTypeLoad = new Button("IMG/SaveLoad/sprite", "btn_load")
				.setPosition(1058, 288)
				.onClick(() => this.setType("load"));

			this._buttonTypeSaveCurrent = new SpriteImage("IMG/SaveLoad/sprite", "btn_save_down")
				.setPosition(1058, 210);
			this._buttonTypeLoadCurrent = new SpriteImage("IMG/SaveLoad/sprite", "btn_load_down")
				.setPosition(1058, 288);

			if (type === "save")
				this._buttonTypeLoadCurrent.alpha = 0;
			else
				this._buttonTypeSaveCurrent.alpha = 0;

			this._buttonLayer.addChild(
				this._buttonTypeSave, this._buttonTypeLoad,
				this._buttonTypeSaveCurrent,
				this._buttonTypeLoadCurrent,
			);
		}

		// page buttons
		this._pageButtons = new Array(10)
			.fill(0)
			.map((_, i) => {
				const idx = `0${i + 1}`.replace(/.*(.{2})$/, "$1");
				return {
					normal: new Button("IMG/SaveLoad/sprite", `data_p${idx}`)
						.setPosition(585 + i * 44, 173)
						.onClick(() => {
							this.page = i + 1;
							this.updateSave();
						}),
					active: new Button("IMG/SaveLoad/sprite", `data_p${idx}_active`)
						.setPosition(585 + i * 44, 173)
						.using(x => {
							x.alpha = 0;
							x.interactive = false;
						}),
				};
			});
		this._buttonLayer.addChild(...this._pageButtons.map(x => [x.normal, x.active]).flat());

		// save buttons
		this._slots.push(
			...new Array(6)
				.fill(0)
				.map((_, i): SaveButton => {
					const layer = new Layer();
					layer.sortableChildren = true;
					layer.width = 464;
					layer.height = 138;

					const textChapter = new PIXI.Text("Chapter 1", {
						fontSize: 30,
						fontWeight: "bold",
						fontFamily: "NanumSquare",
						fill: "#afa9a9",
					});
					textChapter.x = 218;
					textChapter.y = 16;
					textChapter.alpha = 0;

					const textName = new PIXI.Text("챕터 이름", {
						fontSize: 20,
						fontWeight: "800",
						fontFamily: "NanumSquare",
						fill: "#756f6f",
					});
					textName.x = 218;
					textName.y = 52;
					textName.alpha = 0;

					const textDate = new PIXI.Text("0000/00/00 00:00", {
						fontSize: 18,
						fontWeight: "800",
						fontFamily: "NanumSquare",
						fill: "#615757",
					});
					textDate.x = 218;
					textDate.y = 95;
					textDate.alpha = 0;

					const cover = new Button("IMG/SaveLoad/sprite", "entity_cover")
						.onClick(() => {
							this.confirmSlot = (this.page - 1) * 6 + i;
							if (this._type === "load" || this.saves[this.confirmSlot]) {
								this._confirmWindow.setType(this._type);
								this._confirmWindow.open();
							} else
								this.doSave();
						});
					cover.zIndex = 9;

					const output: SaveButton = {
						layer,

						back: new Button("IMG/SaveLoad/sprite", "entity"),
						backEmpty: new Button("IMG/SaveLoad/sprite", "entity_empty"),

						textChapter,
						textName,
						textDate,

						thumbnail: null,
					};

					layer.position.set(53 + 478 * (i % 2), 231 + 150 * Math.floor(i / 2));
					layer.addChild(
						output.back,
						output.backEmpty,

						textChapter,
						textName,
						textDate,

						cover,
					);

					return output;
				}),
		);
		this._buttonLayer.addChild(...this._slots.map(x => x.layer));

		this.addChild(this._buttonLayer);

		// confirm
		this._confirmWindow = new Window_SaveLoadConfirm(type);
		this._confirmWindow.on("confirm", () => {
			if (this._type === "save")
				this.doSave();
			else
				this.doLoad();
		});
		this._confirmWindow.hide();
		this.addChild(this._confirmWindow);
	}

	public setType (type: SaveLoadType) {
		this._type = type;

		this._bgSprite_Save.opacity = type === "save" ? 255 : 0;
		this._bgSprite_Load.opacity = type === "load" ? 255 : 0;

		if (this._buttonTypeLoadCurrent)
			this._buttonTypeLoadCurrent.alpha = type === "save" ? 0 : 255;
		if (this._buttonTypeSaveCurrent)
			this._buttonTypeSaveCurrent.alpha = type === "save" ? 255 : 0;
	}

	public open () {
		super.open();

		this.updateSave();
	}

	private updateSave () {
		function dateText (date: Date): string {
			return date.getFullYear() + "/" +
				("0" + (date.getMonth() + 1)).substring(-2) + "/" +
				("0" + date.getDate()).substring(-2) + " " +
				("0" + date.getHours()).substring(-2) + ":" +
				("0" + date.getMinutes()).substring(-2);
		}

		this._pageButtons.forEach(b => {
			b.normal.alpha = 255;
			b.active.alpha = 0;
		});
		// this._pageButtons[this.page - 1].normal.alpha = 0;
		this._pageButtons[this.page - 1].active.alpha = 255;

		const list = Save.list();
		this.saves = new Array(60)
			.fill(0)
			.map((_, i) => {
				if (!list.includes(i + 1)) return false;
				return Save.load(i + 1);
			});

		const base = (this.page - 1) * 6;
		const range = new Array(6).fill(0).map((_, i) => i + base);
		range.forEach((slot, i) => {
			const s = this._slots[i];
			const save = this.saves[slot];

			if (s.thumbnail) {
				s.layer.removeChild(s.thumbnail);
				s.thumbnail.destroy();
				s.thumbnail = null;
			}

			let a = 255;
			let b = 255;
			if (save) {
				a = 255;
				b = 0;

				const chap = save.script.replace(/^Ch([0-9]+).+$/, "$1");
				const metadata = JSON.parse(save.metadata);
				s.textChapter.text = `Chapter ${chap}`;
				s.textName.text = metadata?.session?.place || "???";
				s.textDate.text = dateText(new Date(metadata?.date)) ?? "unknown";

				const blob = new Blob([save.thumbnail]);
				const url = URL.createObjectURL(blob);

				const texture = PIXI.Texture.from(url);
				texture.addListener("load", () => URL.revokeObjectURL(url));
				s.thumbnail = PIXI.Sprite.from(texture);
				s.thumbnail.x = s.thumbnail.y = 16;
				s.layer.addChild(s.thumbnail);
			} else {
				a = 0;
				b = 255;
			}

			s.back.alpha = a;
			s.backEmpty.alpha = b;

			s.textChapter.alpha = a;
			s.textName.alpha = a;
			s.textDate.alpha = a;
		});
	}

	private async doSave (): Promise<void> {
		if (!this._scene) return;

		const info = this._scene.currentScript();
		if (!info) return;

		this.hide();
		const snapshot = this._scene.snap() || new Bitmap(1, 1);
		this.show();

		await Save.save(this.confirmSlot + 1, info.script, info.cursor, snapshot);
		snapshot.destroy();

		this.updateSave();
	}
	private doLoad (): void {
		const save = this.saves[this.confirmSlot];
		if (!save) return;

		const metadata = JSON.parse(save.metadata || "{}");
		Session.deserialize(metadata.session || "{}");
		Scene_Game.prepareLoad(save.script, save.cursor);

		if (this._scene)
			this._scene.destroy();

		SceneManager.push(Scene_Game);
	}
}
