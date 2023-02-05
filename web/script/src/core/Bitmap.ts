import * as PIXI from "pixi.js";

import Game from "..";
import Stage from "./Stage";

export enum BitmapLoadingState {
	Error = -1,
	None = 0,
	Loading = 1,
	Loaded = 2,
}

export default class Bitmap {
	private _canvas: HTMLCanvasElement = null as unknown as HTMLCanvasElement;
	public get canvas () {
		this.ensureCanvas();
		return this._canvas;
	}

	private _context: CanvasRenderingContext2D = null as unknown as CanvasRenderingContext2D;
	public get context () {
		this.ensureCanvas();
		return this._context;
	}

	private _baseTexture: PIXI.BaseTexture = null as unknown as PIXI.BaseTexture;
	public get baseTexture () { return this._baseTexture; }

	private _image: HTMLImageElement | null = null;
	public get image () { return this._image; }

	private _url = "";
	public get url () { return this._url; }

	public get width () {
		const image = this._canvas || this._image;
		return image ? image.width : 0;
	}
	public get height () {
		const image = this._canvas || this._image;
		return image ? image.height : 0;
	}

	public get rect (): PIXI.Rectangle {
		return new PIXI.Rectangle(0, 0, this.width, this.height);
	}

	private _paintOpacity = 255;
	public get paintOpacity () { return this._paintOpacity; }
	public set paintOpacity (value: number) {
		if (this._paintOpacity !== value) {
			this._paintOpacity = value;
			this.context.globalAlpha = value / 255;
		}
	}

	private _smooth = true;
	public get smooth () { return this._smooth; }
	public set smooth (value: boolean) {
		if (this._smooth !== value) {
			this._smooth = value;
			this.updateScaleMode();
		}
	}

	private _loadListeners: Array<(bitmap: Bitmap) => void> = [];

	public fontFace = "sans-serif";
	public fontSize = 16;
	public fontBold = false;
	public fontItalic = false;
	public textColor = "#ffffff";
	public outlineColor = "rgba(0, 0, 0, 0.5)";
	public outlineWidth = 3;

	private _state: BitmapLoadingState = BitmapLoadingState.None;

	constructor (width: number = 0, height: number = 0) {
		if (width > 0 && height > 0)
			this.createCanvas(width, height);
	}

	private createCanvas (width: number, height: number) {
		this._canvas = document.createElement("canvas");
		this._context = this._canvas.getContext("2d")!;
		this._canvas.width = width;
		this._canvas.height = height;
		this.createBaseTexture(this._canvas);
	}
	private ensureCanvas () {
		if (!this._canvas) {
			if (this._image) {
				this.createCanvas(this._image.width, this._image.height);
				this._context.drawImage(this._image, 0, 0);
			} else {
				this.createCanvas(0, 0);
			}
		}
	}
	private destroyCanvas () {
		if (this._canvas) {
			this._canvas.width = 0;
			this._canvas.height = 0;
			this._canvas = null as unknown as HTMLCanvasElement;
		}
	}
	private createBaseTexture (source: HTMLCanvasElement | HTMLImageElement) {
		this._baseTexture = new PIXI.BaseTexture(source);
		this._baseTexture.mipmap = PIXI.MIPMAP_MODES.OFF;
		this._baseTexture.width = source.width;
		this._baseTexture.height = source.height;
		this.updateScaleMode();
	}
	private updateScaleMode () {
		if (this._baseTexture) {
			if (this._smooth)
				this._baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
			else
				this._baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
		}
	}

	public addLoadListener (listener: (bitmap: Bitmap) => void) {
		if (!this.isReady())
			this._loadListeners.push(listener);
		else
			listener(this);
	}
	private startLoad () {
		this._image = new Image();
		this._image.addEventListener("load", () => {
			this.createBaseTexture(this._image!);
			this._state = BitmapLoadingState.Loaded;
			this.callLoadListeners();
		});
		this._image.addEventListener("error", () => this._state = BitmapLoadingState.Error);
		this.destroyCanvas();

		this._state = BitmapLoadingState.Loading;
		this._image.src = this._url;
	}
	private callLoadListeners () {
		while (this._loadListeners.length > 0)
			this._loadListeners.shift()!(this);
	}

	public retry () {
		this.startLoad();
	}

	//#region Drawing
	public clearRect (x: number, y: number, width: number, height: number) {
		this.context.clearRect(x, y, width, height);
		this._baseTexture.update();
	}
	public clear () {
		if (!this.context) return;
		this.context.clearRect(0, 0, this.width, this.height);
	}

	public blt (source: Bitmap, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number = sw, dh: number = sh) {
		try {
			const image = source._canvas || source._image;
			if (!image) return;

			this.context.globalCompositeOperation = "source-over";
			this.context.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
			this._baseTexture.update();
		} catch (e) {
			//
		}
	}
	public fillRect (x: number, y: number, width: number, height: number, color: string) {
		const context = this.context;
		context.save();
		context.fillStyle = color;
		context.fillRect(x, y, width, height);
		context.restore();
		this._baseTexture.update();
	}
	public fillAll (color: string) {
		this.fillRect(0, 0, this.width, this.height, color);
	}
	public strokeRect (x: number, y: number, width: number, height: number, color: string) {
		const context = this.context;
		context.save();
		context.strokeStyle = color;
		context.strokeRect(x, y, width, height);
		context.restore();
		this._baseTexture.update();
	}
	public gradientFillRect (x: number, y: number, width: number, height: number, colorFrom: string, colorTo: string, vertical: boolean) {
		const context = this.context;
		const x1 = vertical ? x : x + width;
		const y1 = vertical ? y + height : y;
		const grad = context.createLinearGradient(x, y, x1, y1);
		grad.addColorStop(0, colorFrom);
		grad.addColorStop(1, colorTo);
		context.save();
		context.fillStyle = grad;
		context.fillRect(x, y, width, height);
		context.restore();
		this._baseTexture.update();
	}
	public drawCircle (x: number, y: number, radius: number, color: string) {
		const context = this.context;
		context.save();
		context.fillStyle = color;
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, false);
		context.fill();
		context.restore();
		this._baseTexture.update();
	}
	public drawText (text: string, x: number, y: number, maxWidth: number, lineHeight: number, align: CanvasTextAlign) {
		const context = this.context;
		const alpha = context.globalAlpha;
		maxWidth = maxWidth || 0xffffffff;
		let tx = x;
		let ty = Math.round(y + lineHeight / 2 + this.fontSize * 0.35);
		if (align === "center") {
			tx += maxWidth / 2;
		}
		if (align === "right") {
			tx += maxWidth;
		}
		context.save();
		context.font = this.makeFontNameText();
		context.textAlign = align;
		context.textBaseline = "alphabetic";
		context.globalAlpha = 1;
		this.drawTextOutline(text, tx, ty, maxWidth);
		context.globalAlpha = alpha;
		this.drawTextBody(text, tx, ty, maxWidth);
		context.restore();
		this._baseTexture.update();
	}

	public getPixel (x: number, y: number): string { // HTML Hex Color
		if (!this.context) return "";
		const data = this.context.getImageData(x, y, 1, 1).data;
		let result = "#";
		for (let i = 0; i < 3; i++)
			result += data[i].toString(16).padStart(2, "0");
		return result;
	}
	public getPixelAlpha (x: number, y: number): number { // 0~255
		if (!this.context) return 0;
		return this.context.getImageData(x, y, 1, 1).data[3];
	}
	//#endregion

	public measureTextWidth (text: string): number {
		if (!this._baseTexture) return 0;
		const context = this.context;
		context.save();
		context.font = this.makeFontNameText();
		const width = context.measureText(text).width;
		context.restore();
		return width;
	}

	private makeFontNameText (): string {
		const italic = this.fontItalic ? "Italic " : "";
		const bold = this.fontBold ? "Bold " : "";
		return italic + bold + this.fontSize + "px " + this.fontFace;
	}
	private drawTextOutline (text: string, tx: number, ty: number, maxWidth: number) {
		const context = this.context;
		context.strokeStyle = this.outlineColor;
		context.lineWidth = this.outlineWidth;
		context.lineJoin = "round";
		context.strokeText(text, tx, ty, maxWidth);
	}
	private drawTextBody (text: string, tx: number, ty: number, maxWidth: number) {
		const context = this.context;
		context.fillStyle = this.textColor;
		context.fillText(text, tx, ty, maxWidth);
	}

	public resize (width: number, height: number) {
		width = Math.max(width || 0, 1);
		height = Math.max(height || 0, 1);
		if (this._canvas) {
			this._canvas.width = width;
			this._canvas.height = height;
		}
		if (this._baseTexture) {
			this._baseTexture.width = width;
			this._baseTexture.height = height;
		}
	}
	public destroy () {
		if (this._baseTexture) {
			this._baseTexture.destroy();
			this._baseTexture = null as unknown as PIXI.BaseTexture;
		}
		this.destroyCanvas();
	}

	public isReady () {
		return this._state === BitmapLoadingState.Loaded || this._state === BitmapLoadingState.None;
	}
	public isError () {
		return this._state === BitmapLoadingState.Error;
	}

	static load (url: string): Bitmap {
		const bitmap = new Bitmap();
		const p = url.split("/");
		if (p[p.length - 1].includes("."))
			bitmap._url = `assets/${url}`;
		else
			bitmap._url = `assets/${url}.png`;
		bitmap.startLoad();
		return bitmap;
	}

	static snap (stage: Stage) {
		const width = Game.width;
		const height = Game.height;
		const bitmap = new Bitmap(width, height);
		const renderTexture = PIXI.RenderTexture.create({ width, height });
		if (stage) {
			const renderer = Game.app.renderer;
			renderer.render(stage, { renderTexture: renderTexture });
			stage.worldTransform.identity();

			if (renderer instanceof PIXI.Renderer) {
				const canvas = new PIXI.Extract(renderer).canvas(renderTexture);
				bitmap.context?.drawImage(canvas, 0, 0);
				canvas.width = 0;
				canvas.height = 0;
			}
		}
		renderTexture.destroy(true);
		bitmap.baseTexture.update();
		return bitmap;
	}
}
