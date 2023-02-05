import Game from "..";

import Layer from "@/core/Layer";
import Sprite from "@/core/Sprite";

import FadeSprite from "@/component/FadeSprite";

export interface ScriptSelection {
	key: string;
	text: string;
}
type ScriptLine = () => void;

type GraphicCallback = (el: FadeSprite | null, sprite?: Sprite) => void;

interface ScriptEventMap {
	next: (line: number) => void;
	load: (script: GameScript) => void;
	loaded: (line: number) => void;

	block: () => void;
	unblock: () => void;
	lock: () => void;
	unlock: () => void;

	error: (error: string, line: number) => void;
	end: () => void;

	close: (cb: () => void) => void;
	text: (text: string) => void;
	say: (teller: string, text: string) => void;
	selection: (selections: Array<ScriptSelection | string>) => void;

	shake: (threshold: number, duration: number) => void;

	bg: (bg: string | null | undefined, cb: GraphicCallback) => void;
	picture: (id: number, picture: string | null | undefined, cb: GraphicCallback) => void;
}

export default class GameScript extends Layer {
	private _isBlocked = false;
	private _isLocked = false;

	protected lock () {
		if (this._isLocked) return;

		this._isLocked = true;
		this.callEvent("lock");

		this.block();
	}
	protected unlock () {
		this._isLocked = false;
		this.callEvent("unlock");

		this.unblock();
	}

	protected block () {
		this._isBlocked = true;
		this.callEvent("block");
	}
	public unblock () {
		if (this._isLocked) return;

		this._isBlocked = false;
		this.callEvent("unblock");
	}

	public readonly scriptName: string = "GameScript";
	private _scriptCursor: number = 0;
	private _scriptList: ScriptLine[] = [];

	private _eventMap: Record<string, Function[]> = {};

	private _ended = false;
	public get ended () { return this._ended; }

	public get scriptCursor () { return this._scriptCursor; }

	private _targetLine: number = 0;
	protected get targetLine () { return this._targetLine; }

	protected get isReady () { return this.scriptCursor >= this._targetLine; }

	private _selected: string = "";
	public get selected () { return this._selected; }
	public set selected (value: string) { this._selected = value; }

	private _shaking = false;
	protected get isShaking () { return this._shaking; }

	private _onFrames: Record<string, () => void> = {};
	private _cursorMemory: number[] = [];

	constructor () {
		super();
		this.sortableChildren = true;

		this.width = Game.width;
		this.height = Game.height;
	}

	protected init (targetLine: number, scripts: ScriptLine[]) {
		this._scriptCursor = 0;
		this._scriptList = scripts;

		this._targetLine = targetLine;
	}

	public update () {
		super.update();

		Object.keys(this._onFrames)
			.forEach(k => this._onFrames[k]());
	}

	protected onFrame (key: string, cb: () => void) {
		this._onFrames[key] = cb;
	}
	protected removeFrame (key: string) {
		delete this._onFrames[key];
	}

	public addEventListener<K extends keyof ScriptEventMap> (type: K, callback: ScriptEventMap[K]) {
		if (!(type in this._eventMap))
			this._eventMap[type] = [];

		const map = this._eventMap[type];
		if (!map.includes(callback))
			map.push(callback);
	}
	private callEvent (type: keyof ScriptEventMap, ...args: any[]) {
		if (type in this._eventMap)
			this._eventMap[type].forEach(cb => (cb as Function).apply(null, args));
	}

	public next () {
		if (this.isBlocked()) return;

		if (this._scriptCursor < this._scriptList.length) {
			if (this._scriptCursor === this._targetLine)
				this.callEvent("loaded", this._scriptCursor);

			this._scriptList[this._scriptCursor]();
			this._scriptCursor++;

			this.callEvent("next", this._scriptCursor);
		} else {
			if (this.ended)
				this.callEvent("error", "End of Script", this._scriptCursor);
			else {
				this.callEvent("end", this.scriptName);
				this._ended = true;
			}
		}
	}

	protected load (script: GameScript): void {
		this.callEvent("load", script);
	}
	protected wait (time: number): Promise<void> {
		if (time > 0)
			console.log("wait: ", `${time} secs`);
		return new Promise<void>(resolve => setTimeout(resolve, Math.max(10, time * 1000)));
	}

	protected close () {
		console.log("close");

		this.lock();
		this.callEvent("close", () => this.unlock());
	}
	protected t (text: string) {
		console.log("t: ", text);

		if (this.isReady) this.block();
		this.callEvent("text", text);
	}
	protected s (teller: string, text: string) {
		console.log("s: ", teller, ">", text);

		if (this.isReady) this.block();
		this.callEvent("say", teller, text);
	}

	protected bg (cb: GraphicCallback): void;
	protected bg (bg: null): void;
	protected bg (bg: string, cb: GraphicCallback): void;
	protected bg (bg: GraphicCallback | string | null, cb?: GraphicCallback): void {
		if (typeof bg === "function")
			this.callEvent("bg", undefined, bg);
		else
			this.callEvent("bg", bg, cb || (() => void (0)));
	}

	protected picture (id: number, cb: GraphicCallback): void;
	protected picture (id: number, picture: null): void;
	protected picture (id: number, picture: string, cb: GraphicCallback): void;
	protected picture (id: number, picture: GraphicCallback | string | null, cb?: GraphicCallback): void {
		if (typeof picture === "function")
			this.callEvent("picture", id, undefined, picture);
		else
			this.callEvent("picture", id, picture, cb || (() => void (0)));
	}

	protected sel (...selections: Array<ScriptSelection | string>): void {
		console.log("sel: ", selections.map(x => typeof x === "string" ? x : `${x.key}=>${x.text}`).join(" / "));
		if (this.isReady) {
			this.block();
			this.callEvent("selection", selections);
		}
	}

	protected shake (threshold: number, duration: number): void {
		console.log("shake: ", threshold, duration);
		if (this.isReady) {
			this.block();
			this.callEvent("shake", threshold, duration);
			this._shaking = true;
		}
	}

	public unshake () {
		this._shaking = false;
	}

	public isBlocked () { return this._isBlocked; }

	protected scg (id: number, free: null, dur?: number): void;
	protected scg (id: number, path: string, pos?: number, dur?: number): void;
	protected scg (from: number, to: number, path: string, pos?: number, dur?: number): void;
	protected scg (from: number, to_path: number | string | null, path_pos?: string | number, pos_dur?: number, dur?: number): void {
		this.lock();

		if (to_path === null) {
			const id = from;
			const dur = typeof path_pos === "number" ? path_pos : 90;

			this.picture(id * 2 - 1, async pic => {
				const target = pic ? id * 2 - 1 : id * 2;

				new Promise<void>(resolve => {
					if (from > 0) {
						this.picture(target, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? dur : 0);
							while (pic.isFading())
								await this.wait(0);

							this.picture(target, null);
							resolve();
						});
					}
				}).then(() => this.unlock());
			});
			return;
		}

		if (typeof to_path === "string") {
			const id = from;
			const path = to_path;
			const pos = (path_pos as number | undefined) || 0.5;
			const dur = pos_dur ?? 90;

			this.picture(id * 2 - 1, async pic => {
				if (pic)
					this.scg(id * 2 - 1, id * 2, path, pos, dur);
				else
					this.scg(id * 2, id * 2 - 1, path, pos, dur);
			});
			return;
		}

		const to = to_path;
		const path = path_pos as string;
		const pos = (pos_dur as number | undefined) || 0.5;

		Promise.all([
			new Promise<void>(resolve => {
				if (from > 0) {
					this.picture(from, async (pic) => {
						if (!pic) return resolve();

						pic.startFadeOut(this.isReady ? (dur ?? 90) : 0);
						while (pic.isFading())
							await this.wait(0);

						this.picture(from, null);
						resolve();
					});
				}
			}),
			new Promise<void>(resolve => {
				if (to > 0) {
					this.picture(to, path, async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(pos, 1);
						sprite.transform.position.set(Game.width * pos, Game.height + 20);

						pic.startFadeIn(this.isReady ? (dur ?? 90) : 0);
						while (pic.isFading())
							await this.wait(0);

						resolve();
					});
				}
			}),
		]).then(() => this.unlock());
	}

	protected scgFn (id: number, cb: GraphicCallback) {
		this.picture(id * 2 - 1, (pic, sprite) => {
			if (pic) return cb(pic, sprite);

			this.picture(id * 2, (pic, sprite) => {
				if (pic) return cb(pic, sprite);

				cb(null);
			});
		});
	}

	protected memory () {
		this._cursorMemory.push(this._scriptCursor);
	}
	protected unmemory () {
		this._cursorMemory.pop();
	}
	protected rollback () {
		if (this._cursorMemory.length === 0) return;
		this._scriptCursor = this._cursorMemory[this._cursorMemory.length - 1];
	}

	protected when (key: string, scripts: ScriptLine[]): Array<() => void>;
	protected when (key: () => boolean, scripts: ScriptLine[]): Array<() => void>;
	protected when (key: string | (() => boolean), scripts: ScriptLine[]) {
		const predict = this.isReady
			? typeof key === "string"
				? () => this.selected === key
				: key
			: () => true;  // Ready 후 조건절에 걸리도록

		return scripts.map(fn => () => {
			if (predict())
				fn();
		});
	}
}
