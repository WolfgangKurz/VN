import config from "@/config";

export default class ManagedAudio {
	private _isBGM: boolean;
	private _fading = false;
	private _audio: HTMLAudioElement;
	private _volUnsub: () => void;

	constructor (is_bgm?: boolean) {
		this._audio = new Audio();

		this._isBGM = !!is_bgm;
		if (is_bgm) {
			this._audio.volume = config.volume_BGM.value / 100; // 0.0 ~ 1.0
			this._volUnsub = config.volume_BGM.subscribe(v => {
				this._audio.volume = config.volume_BGM.value / 100; // 0.0 ~ 1.0
			});

			this.loop(true);
		} else {
			this._audio.volume = config.volume_SFX.value / 100; // 0.0 ~ 1.0
			this._volUnsub = config.volume_SFX.subscribe(v => {
				this._audio.volume = config.volume_SFX.value / 100; // 0.0 ~ 1.0
			});
		}
	}

	public destroy () {
		this._audio.pause();
		this._audio.remove();
		this._volUnsub();
	}

	public load (src: string, play?: boolean) {
		this._audio.src = src;

		const _vol = (this._isBGM ? config.volume_BGM.peek() : config.volume_SFX.peek()) / 100;
		this._audio.volume = _vol;

		if (play) this._audio.play();
	}

	public play () {
		if (this._audio.paused)
			this._audio.play();
	}

	public pause () {
		if (!this._audio.paused)
			this._audio.pause();
	}

	public stop () {
		this.pause();
		this._audio.currentTime = 0;
	}

	public currentTime () {
		return this._audio.currentTime;
	}

	public src () {
		return this._audio.src;
	}

	public loop (loop: boolean) {
		this._audio.loop = loop;
	}

	/** default `1000` msec */
	public fadeOut (duration: number = 1000) {
		this.fade(duration, true);
	}

	/** default `1000` msec */
	public fadeIn (duration: number = 1000) {
		this.fade(duration, false);
	}

	protected fade (duration: number, is_out: boolean) {
		if (this._fading) {
			console.warn("[ManagedAudio] Already fading");
			return;
		}
		this._fading = true;

		const begin = Date.now();
		const _vol = (this._isBGM ? config.volume_BGM.peek() : config.volume_SFX.peek()) / 100;
		const interval = setInterval(() => {
			const p = Math.min(1, (Date.now() - begin) / duration);
			if (p >= 1) {
				this._fading = false;
				clearInterval(interval);
			}

			this._audio.volume = (is_out ? 1 - p : p) * _vol;
		}, 20);
	}
}
