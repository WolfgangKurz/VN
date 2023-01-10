import Utils from "./Utils";

export default class WebAudio {
	//#region static
	private static _masterVolume = 1;
	public static get masterVolume () { return this._masterVolume; }

	private static _masterVolumeValue = 1;

	private static _instances: WebAudio[] = [];

	private static _fadeStart = 0;
	private static _fadeEnd = 0;
	private static _fadeDir = 0;
	private static _fadeId: number | false = false;

	public static fadeIn (dur: number) {
		this._fadeStart = Date.now();
		this._fadeEnd = this._fadeStart + dur;
		this._fadeDir = 1;
		this.startMasterFade();
	}
	public static fadeOut (dur: number) {
		this._fadeStart = Date.now();
		this._fadeEnd = this._fadeStart + dur;
		this._fadeDir = -1;
		this.startMasterFade();
	}
	private static startMasterFade () {
		if (this._fadeId !== false) {
			window.clearInterval(this._fadeId);
			this._fadeId = false;
		}

		this._fadeId = window.setInterval(() => this.updateMasterVolume(), 10);
	}
	private static updateMasterVolume () {
		const t = Date.now();
		const s = this._fadeDir > 0 ? 0 : this._masterVolume;
		const e = this._masterVolume - s;

		if (t > this._fadeEnd) {
			this._masterVolumeValue = e;
			if (typeof this._fadeId === "number")
				window.clearInterval(this._fadeId);
			this._fadeId = false;
		} else {
			const dur = this._fadeEnd - this._fadeStart;
			const prog = Utils.clamp((t - this._fadeStart) / dur, 0, 1);
			const v = s + (e - s) * prog * WebAudio._masterVolumeValue;
			this._masterVolumeValue = v;
		}

		this._instances.forEach(inst => inst.resetVolume());
	}

	private static addInstance (inst: WebAudio) {
		this._instances.push(inst);
	}
	private static removeInstance (inst: WebAudio) {
		while (true) {
			const idx = this._instances.indexOf(inst);
			if (idx < 0) break;

			this._instances.splice(idx, 1);
		}
	}

	public static setMasterVolume (vol: number) {
		this._masterVolume = vol;

		if (this._fadeId === false)
			this._masterVolumeValue = vol;

		this._instances.forEach(inst => inst.resetVolume());
	}
	//#endregion

	private _url: string = "";
	public get url () { return this._url; }

	private _volume: number = 1;
	public get volume () { return this._volume; }
	public set volume (vol: number) {
		this._volume = vol;

		if (this._audio) {
			this._fadeDir = 0;
			this.resetVolume();
		}
	}

	private _audio: HTMLAudioElement | null = null;
	private _startOffset: false | number = false;

	private _isError = false;
	private _isLoaded = false;

	private _loopCount: number = 0;
	private _loop: boolean | number = false;
	public get loop () { return this._loop; }

	private _fadeStart = 0;
	private _fadeEnd = 0;
	private _fadeDir = 0;

	public name: string = "";
	public frameCount: number = 0;

	private _endedListeners: Array<(audio: WebAudio) => void> = [];

	constructor (url: string) {
		this.clear();
		this._url = url;

		this._audio = new Audio(url);
		this.addEventHandlers();
		this.reload();

		WebAudio.addInstance(this);
	}
	private clear () {
		this.stop();
		this._audio?.remove();
		this._startOffset = false;

		this._loop = false;
		this._loopCount = 0;

		this._volume = 1;
		this._isLoaded = false;
		this._isError = false;

		this._fadeStart = 0;
		this._fadeEnd = 0;
		this._fadeDir = 0;
	}

	public addEndedListener (cb: (audio: WebAudio) => void) {
		this._endedListeners.push(cb);
	}
	private onEnded () {
		this._endedListeners.forEach(cb => cb(this));
	}

	private addEventHandlers () {
		if (!this._audio) return;

		this._audio.addEventListener("canplaythrough", () => {
			if (!this._isLoaded) {
				this._isError = false;
				this._isLoaded = true;

				if (this._startOffset !== false)
					this.start(this._startOffset);
			}
		});
		this._audio.addEventListener("ended", () => {
			if (this._loopCount !== 0) {
				if (this._loopCount > 0)
					this._loopCount--;

				this.start(0);
			} else
				this.onEnded();
		});
		this._audio.addEventListener("timeupdate", () => {
			const t = this._audio!.currentTime;

			if (this._fadeDir !== 0) {
				if (t >= this._fadeStart && t <= this._fadeEnd)  // Fading
					this.resetVolume();

				if (t > this._fadeEnd) // Fade done
					this._fadeDir = 0;
			}
		});
	}
	private resetVolume () {
		if (!this._audio) return;

		const t = this._audio.currentTime;
		if (this._fadeDir !== 0) {
			const s = this._fadeDir > 0 ? 0 : this._volume;
			const e = this._volume - s;

			const dur = this._fadeEnd - this._fadeStart;
			const prog = Utils.clamp((t - this._fadeStart) / dur, 0, 1);
			const v = s + (e - s) * prog * WebAudio._masterVolumeValue;
			this._audio.volume = v;
		} else
			this._audio.volume = this._volume * WebAudio._masterVolumeValue;
	}

	public isReady = () => this._isLoaded;
	public isError = () => this._isError;
	public isPlaying = () => this._audio && !this._audio.paused;

	public play (loop: boolean | number, offset: number = 0) {
		this._loop = loop;
		if (typeof loop === "boolean")
			this._loopCount = loop ? -1 : 0;
		else
			this._loopCount = loop;

		if (this.isReady())
			this.start(offset);
		else
			this._startOffset = offset;
	}
	public reload () {
		if (!this._audio) return;

		this._audio.load();
	}
	private start (pos: number) {
		if (!this._audio) return;

		this._audio.currentTime = pos;
		this._audio.play();
	}

	public stop () {
		this._audio?.pause();
	}

	public destroy () {
		this.clear();
		WebAudio.removeInstance(this);
	}

	public fadeIn (dur: number) {
		if (this.isReady()) {
			this._fadeStart = this.time();
			this._fadeEnd = this._fadeStart + dur;
			this._fadeDir = 1;
		}
	}
	public fadeOut (dur: number) {
		if (this.isReady()) {
			this._fadeStart = this.time();
			this._fadeEnd = this._fadeStart + dur;
			this._fadeDir = -1;
		}
	}
	public time (): number {
		if (this._audio)
			return this._audio.currentTime || 0;
		return 0;
	}
}
