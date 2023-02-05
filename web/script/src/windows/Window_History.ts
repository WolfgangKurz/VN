import * as PIXI from "pixi.js";
import { Scrollbox } from "pixi-scrollbox";

import Game from "..";

import WindowBase from "@/component/WindowBase";
import SolidRectangle from "@/component/SolidRectangle";

export default class Window_History extends WindowBase {
	private static MARGIN: number = 20;

	private static FONT_SIZE: number = 20;

	private static TELLER_SIZE: number = 150;
	private static TELLER_MARGIN: number = 20;

	private static LINE_HEIGHT: number = Window_History.FONT_SIZE * 0.6;

	private _bgRectangle: SolidRectangle;
	private _scrollbox: Scrollbox;
	private _texts: PIXI.Text[] = [];

	constructor () {
		super();

		this.interactive = false;
		this.interactiveChildren = false;

		// background
		this._bgRectangle = new SolidRectangle(0xF0000000);
		this.addChild(this._bgRectangle);

		this._scrollbox = new Scrollbox({
			boxWidth: this.width - Window_History.MARGIN * 2,
			boxHeight: this.height - Window_History.MARGIN * 2,
			overflowX: "hidden",
			overflowY: "scroll",
			underflow: "none",
			noTicker: true,
			fade: false,
			passiveWheel: false,
			stopPropagation: true,
			divWheel: Game.app.view,
			scrollbarBackgroundAlpha: 0,
			scrollbarForegroundAlpha: 0.78,
		});
		this._scrollbox.x = this._scrollbox.y = Window_History.MARGIN;
		this.addChild(this._scrollbox);

		const placeholder = new PIXI.Text("0");
		placeholder.x = this._scrollbox.contentWidth - 1;
		this._scrollbox.content.addChild(placeholder);
	}

	public setBox (x: number, y: number, width: number, height: number) {
		this._bgRectangle.x = x;
		this._bgRectangle.y = y;
		this._bgRectangle.width = width;
		this._bgRectangle.height = height;

		this._scrollbox.boxWidth = width - Window_History.MARGIN * 2;
		this._scrollbox.boxHeight = height - Window_History.MARGIN * 2;
		// this._scrollbox.width = width;
		// this._scrollbox.height = height;
		this._scrollbox.x = x + Window_History.MARGIN;
		this._scrollbox.y = y + Window_History.MARGIN;
		this._scrollbox.update();
	}

	public addLog (text: string, teller?: string) {
		// text
		const t = new PIXI.Text(text, {
			fontSize: Window_History.FONT_SIZE,
			fontFamily: "NanumSquare",
			fill: "#fff",
			wordWrap: true,
			wordWrapWidth: this._scrollbox.contentWidth - Window_History.MARGIN - Window_History.TELLER_SIZE - Window_History.TELLER_MARGIN,
		});

		t.x = Window_History.TELLER_MARGIN;
		t.y = this._texts.reduce((p, c) => Math.max(p, c.y + c.height + Window_History.LINE_HEIGHT), 0);

		if (teller) {
			const te = new PIXI.Text(teller, {
				fontSize: Window_History.FONT_SIZE,
				fontFamily: "NanumSquare",
				fill: "#F4CF25",
				wordWrap: true,
				wordWrapWidth: Window_History.TELLER_SIZE,
			});
			te.y = t.y;

			t.x = Window_History.TELLER_SIZE + Window_History.TELLER_MARGIN;

			this._texts.push(te);
			this._scrollbox.content.addChild(te);
		}

		this._scrollbox.content.addChild(t);
		this._scrollbox.scrollTop = this._scrollbox.scrollHeight;
		this._scrollbox.update();

		this._texts.push(t);
	}

	public clear (): void {
		this._texts.forEach(x => {
			x.destroy({ children: true });
		});
		this._texts.splice(0, this._texts.length);
	}
}
