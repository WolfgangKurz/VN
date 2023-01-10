export interface XY {
	x: number;
	y: number;
}

interface InputState {
	triggered: boolean;
	cancelled: boolean;
	moved: boolean;
	hovered: boolean;
	released: boolean;
	wheelX: number;
	wheelY: number;
}

class InputClass {
	public static readonly keyRepeatWait = 24;
	public static readonly keyRepeatInterval = 6;
	public static readonly moveThreshold = 10;

	private _mousePressed = false;
	private _screenPressed = false; // Touch
	private _pressedTime = 0;
	private _clicked = false;

	private _newState = this.createNewState();
	private _currentState = this.createNewState();

	private _pos: XY = { x: 0, y: 0 };
	private _trigger: XY = { x: 0, y: 0 };
	private _moved = false;
	private _date = 0;

	private _lastClick = 0;

	public isClicked = () => this._clicked;
	public isPressed = () => this._mousePressed || this._screenPressed;
	public isTriggered = () => this._currentState.triggered;
	public isRepeated = () => this.isPressed() &&
		(this.isTriggered() || (this._pressedTime >= InputClass.keyRepeatWait && this._pressedTime % InputClass.keyRepeatInterval === 0));
	public isLongPressed = () => this.isPressed() && this._pressedTime >= InputClass.keyRepeatWait;
	public isCanceled = () => this._currentState.cancelled;
	public isMoved = () => this._currentState.moved;
	public isHovered = () => this._currentState.hovered;
	public isReleased = () => this._currentState.released;

	public get wheelX () { return this._currentState.wheelX; }
	public get wheelY () { return this._currentState.wheelY; }
	public get x () { return this._pos.x; }
	public get y () { return this._pos.y; }
	public get date () { return this._date; }

	public get lastClick () { return this._lastClick; }
	public set lastClick (value: number) { this._lastClick = value; }

	constructor () {
		this.clear();

		const pf = { passive: false };
		document.addEventListener("mousedown", e => {
			if (e.button === 0)
				this.onLeftButtonDown(e);
			else if (e.button === 1)
				this.onMiddleButtonDown(e);
			else if (e.button === 2)
				this.onRightButtonDown(e);
		});
		document.addEventListener("mousemove", e => {
			if (this._mousePressed)
				this.onMove(e.pageX, e.pageY);
			else
				this.onHover(e.pageX, e.pageY);
		});
		document.addEventListener("mouseup", e => {
			if (e.button === 0) {
				this._mousePressed = false;
				this.onRelease(e.pageX, e.pageY);
			}
		});
		document.addEventListener("wheel", e => {
			this._newState.wheelX += e.deltaX;
			this._newState.wheelY += e.deltaY;
			e.preventDefault();
		}, pf);
		// document.addEventListener("touchstart", e => { }, pf);
		// document.addEventListener("touchmove", e => { }, pf);
		// document.addEventListener("touchend", e => { });
		// document.addEventListener("touchcancel", e => { });
		window.addEventListener("blur", () => this.clear());
	}

	public clear () {
		this._mousePressed = false;
		this._screenPressed = false;
		this._pressedTime = 0;
		this._clicked = false;
		this._newState = this.createNewState();
		this._currentState = this.createNewState();
		this._pos = { x: 0, y: 0 };
		this._trigger = { x: 0, y: 0 };
		this._moved = false;
		this._date = 0;
	}
	public update () {
		this._currentState = this._newState;
		this._newState = this.createNewState();

		this._clicked = this._currentState.released && !this._moved;
		if (this.isPressed())
			this._pressedTime++;
	}

	private createNewState (): InputState {
		return {
			triggered: false,
			cancelled: false,
			moved: false,
			hovered: false,
			released: false,
			wheelX: 0,
			wheelY: 0,
		};
	}

	private onLeftButtonDown (e: MouseEvent) {
		this._mousePressed = true;
		this._pressedTime = 0;
		this.onTrigger(e.pageX, e.pageY);
	}
	private onMiddleButtonDown (e: MouseEvent) {
		// Placeholder
	}
	private onRightButtonDown (e: MouseEvent) {
		this.onCancel(e.pageX, e.pageY);
	}
	private onTrigger (x: number, y: number) {
		this._newState.triggered = true;
		this._pos = { x, y };
		this._trigger = { x, y };
		this._moved = false;
		this._date = Date.now();
	}
	private onCancel (x: number, y: number) {
		this._newState.cancelled = true;
		this._pos = { x, y };
	}
	private onMove (x: number, y: number) {
		const dx = Math.abs(x - this._trigger.x);
		const dy = Math.abs(y - this._trigger.y);
		if (dx > InputClass.moveThreshold || dy > InputClass.moveThreshold) this._moved = true;

		if (this._moved) {
			this._newState.moved = true;
			this._pos = { x, y };
		}
	}
	private onHover (x: number, y: number) {
		this._newState.hovered = true;
		this._pos = { x, y };
	}
	private onRelease (x: number, y: number) {
		this._newState.released = true;
		this._pos = { x, y };
	}
}

const Input = new InputClass();
export default Input;
