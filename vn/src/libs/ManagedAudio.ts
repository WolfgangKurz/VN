import config from "@/config";

export default class ManagedAudio {
	private _isBGM: boolean;
	private _fading: number | null = null;
	private _audio: HTMLAudioElement;
	private _src: string;

	private _muteUnsub: () => void;
	private _volUnsub: () => void;

	public destroyAfterPlay: boolean = false;

	private fadeCb: (() => void) | null = null;

	constructor (is_bgm?: boolean) {
		this._audio = new Audio();

		this._isBGM = !!is_bgm;
		if (is_bgm) {
			this._audio.volume = config.volume_BGM.value / 100; // 0.0 ~ 1.0
			this._volUnsub = config.volume_BGM.subscribe(v => {
				this._audio.volume = v / 100; // 0.0 ~ 1.0
			});

			this.loop(true);
		} else {
			this._audio.volume = config.volume_SFX.value / 100; // 0.0 ~ 1.0
			this._volUnsub = config.volume_SFX.subscribe(v => {
				this._audio.volume = v / 100; // 0.0 ~ 1.0
			});
		}

		this._src = "";
		this._audio.muted = config.volatile_Mute.value;
		this._muteUnsub = config.volatile_Mute.subscribe(v => {
			this._audio.muted = v;
		});

		this._audio.addEventListener("ended", () => {
			if (!this._audio.loop && this.destroyAfterPlay)
				this.destroy();
		});
	}

	public destroy () {
		if (this._muteUnsub)
			this._muteUnsub();

		this._audio.pause();
		this._audio.remove();
		this._volUnsub();
	}

	public load (src: string): Promise<void> {
		if (!this._audio.paused)
			this._audio.pause();

		this.fadeSkip(false);
		this.resetVolume();

		return new Promise<void>((resolve, reject) => {
			const onLoad = (() => {
				this._audio.removeEventListener("canplaythrough", onLoad);
				this._audio.removeEventListener("error", onError);
				resolve();
			}).bind(this);
			const onError = ((e: Event) => {
				this._audio.removeEventListener("canplaythrough", onLoad);
				this._audio.removeEventListener("error", onError);
				reject(e);
			}).bind(this);

			this._audio.addEventListener("canplaythrough", onLoad);
			this._audio.addEventListener("error", onError);

			this._audio.src = this._src = src;
		});
	}

	public play (): Promise<void> {
		if (this._audio.paused)
			return this._audio.play();

		return Promise.resolve();
	}

	public pause () {
		if (!this._audio.paused)
			this._audio.pause();
	}

	public stop () {
		this.fadeSkip(false);
		this.pause();
		// this._audio.currentTime = 0;
	}

	public get currentTime () {
		return this._audio.currentTime;
	}

	public get playing () {
		return !this._audio.paused && !this._audio.ended;
	}

	public src () {
		return this._src;
	}

	public loop (loop: boolean) {
		this._audio.loop = loop;
	}

	public resetVolume () {
		const _vol = (this._isBGM ? config.volume_BGM.peek() : config.volume_SFX.peek()) / 100;
		this._audio.volume = _vol;
	}

	/** default `1000` msec */
	public fadeOut (duration: number = 1000) {
		this.fade(duration, true);
	}

	/** default `1000` msec */
	public fadeIn (duration: number = 1000) {
		this.fade(duration, false);
	}

	public fadeSkip (callCallback: boolean = true) {
		if (this._fading !== null) {
			if (this.fadeCb) {
				if (callCallback) this.fadeCb();
				this.fadeCb = null;
			}

			window.clearInterval(this._fading);
			this._fading = null;
		}
	}

	protected fade (duration: number, is_out: boolean) {
		if (this._fading) {
			console.warn("[ManagedAudio] Already fading, Remove previous fade and Overwrite to new");
			this.fadeSkip(); // remove previous fade
		}

		const begin = Date.now();
		const _vol = (this._isBGM ? config.volume_BGM.peek() : config.volume_SFX.peek()) / 100;

		this.fadeCb = () => (this._audio.volume = (is_out ? 0 : 1) * _vol);

		this._fading = window.setInterval(() => {
			const p = Math.min(1, (Date.now() - begin) / duration);

			if (p >= 1 || !this._fading) {
				if (this.fadeCb) {
					this.fadeCb();
					this.fadeCb = null;
				}

				if (this._fading !== null) {
					window.clearInterval(this._fading);
					this._fading = null;
				}
			}

			const _vol = (this._isBGM ? config.volume_BGM.peek() : config.volume_SFX.peek()) / 100; // real-time config value
			this._audio.volume = (is_out ? 1 - p : p) * _vol;
		}, 20);
	}
}
