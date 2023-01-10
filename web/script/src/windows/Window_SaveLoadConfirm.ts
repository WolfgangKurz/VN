import Save from "@/core/Save";
import Bitmap from "@/core/Bitmap";
import Sprite from "@/core/Sprite";
import Layer from "@/core/Layer";

import SolidRectangle from "@/component/SolidRectangle";
import WindowBase from "@/component/WindowBase";
import Button from "@/component/Button";

type SaveLoadType = "save" | "load";

export default class Window_SaveLoadConfirm extends WindowBase {
	private _bgSprite_Background: SolidRectangle;
	private _bgSprite_Save: Sprite;
	private _bgSprite_Load: Sprite;

	private _buttonLayer: Layer;
	private _type: SaveLoadType = "save";

	public get type () { return this._type }

	constructor (type: SaveLoadType = "save") {
		super();

		// background
		this._bgSprite_Background = new SolidRectangle(0xD0000000);
		this._bgSprite_Save = new Sprite(Bitmap.load("BG/BG_SaveConfirm"));
		this._bgSprite_Load = new Sprite(Bitmap.load("BG/BG_LoadConfirm"));
		this.addChild(this._bgSprite_Background, this._bgSprite_Save, this._bgSprite_Load);
		this.setType(type);

		const baseX = this._bgSprite_Save.x = this._bgSprite_Load.x = this.width / 2 - 583 / 2;
		const baseY = this._bgSprite_Save.y = this._bgSprite_Load.y = this.height / 2 - 355 / 2;

		// buttons
		this._buttonLayer = new Layer();
		this._buttonLayer.addChild(
			new Button("IMG/SaveLoad/sprite", "btn_prompt_yes")
				.setPosition(baseX + 115, baseY + 244)
				.onClick(() => {
					if (this.isFading()) return;
					this.close();

					this.listeners("confirm").forEach(x => x());
				}),
			new Button("IMG/SaveLoad/sprite", "btn_prompt_no")
				.setPosition(baseX + 310, baseY + 244)
				.onClick(() => {
					if (this.isFading()) return;
					this.close();
				}),
		);

		this.addChild(this._buttonLayer);
	}

	public setType (type: SaveLoadType) {
		this._type = type;

		this._bgSprite_Save.opacity = type === "save" ? 255 : 0;
		this._bgSprite_Load.opacity = type === "load" ? 255 : 0;
	}
}
