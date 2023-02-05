import Game from "..";
import WebAudio from "@/core/WebAudio";
import Global from "@/core/Global";

export interface AudioMetadata {
	name: string;
	volume: number;
	pos?: number;
	loop?: boolean;
}

interface MergedAudio {
	metadata: AudioMetadata;
	audio: WebAudio;
}

class AudioManagerClass {
	public static readonly audioFileExt = ".mp3";

	private _bgmVolume = Global.get<number>("volume.bgm", 100);
	public get bgmVolume () { return this._bgmVolume; }
	public set bgmVolume (value: number) {
		this._bgmVolume = value;
		this.updateBGMParams(this._currentBGM);
	}

	private _seVolume = Global.get<number>("volume.sfx", 100);
	public get seVolume () { return this._seVolume; }
	public set seVolume (value: number) {
		this._seVolume = value;
		this._seList.forEach(x => this.updateSEParams(x.audio, x.metadata));
	}

	private _blocked = false;
	public get blocked () { return this._blocked; }
	public set blocked (value: boolean) {
		this._blocked = value;

		if (this._currentBGM)
			this._bgmBuffer?.play(true);
	}

	private _currentBGM: AudioMetadata | null = null;
	private _bgmBuffer: WebAudio | null = null;
	private readonly _seList: MergedAudio[] = [];
	private _replayFadeTime = 0.5;
	private _path = "assets/";

	public playBGM (bgm: AudioMetadata, pos: number = 0) {
		if (this.isCurrentBGM(bgm))
			this.updateBGMParams(bgm);
		else {
			this.stopBGM();
			if (bgm.name) {
				this._bgmBuffer = this.createBuffer("BGM/", bgm.name);
				this.updateBGMParams(bgm);

				if (!this.blocked)
					this._bgmBuffer.play(true);
			}
		}
		this.updateCurrentBGM(bgm, pos);
	}
	public replayBGM (bgm: AudioMetadata) {
		if (this.isCurrentBGM(bgm))
			this.updateBGMParams(bgm);
		else {
			this.playBGM(bgm, bgm.pos);
			if (this._bgmBuffer)
				this._bgmBuffer.fadeIn(this._replayFadeTime);
		}
	}
	public isCurrentBGM (bgm: AudioMetadata) {
		return this._currentBGM && this._bgmBuffer && this._currentBGM.name === bgm.name;
	}
	private updateBGMParams (bgm: AudioMetadata | null) {
		this.updateBufferParams(this._bgmBuffer, this._bgmVolume, bgm);
	}
	private updateCurrentBGM (bgm: AudioMetadata, pos: number) {
		this._currentBGM = {
			name: bgm.name,
			volume: bgm.volume,
			pos: pos
		}
	}
	public stopBGM () {
		if (this._bgmBuffer) {
			this._bgmBuffer.destroy();
			this._bgmBuffer = null;
			this._currentBGM = null;
		}
	}
	public fadeOutBGM (duration: number) {
		if (this._bgmBuffer && this._currentBGM) {
			this._bgmBuffer.fadeOut(duration);
			this._currentBGM = null;
		}
	}
	public fadeInBGM (duration: number) {
		if (this._bgmBuffer && this._currentBGM) {
			this._bgmBuffer.fadeIn(duration);
		}
	}

	public playSE (se: AudioMetadata) {
		if (this.blocked) return;

		if (se.name) {
			// 같은 프레임에 같은 SE 동시 재생 방지
			if (this._seList.some(se => se.audio.frameCount === Game.frameCount && buffer.name === se.audio.name))
				return;

			const buffer = this.createBuffer("SE/", se.name);
			this.updateSEParams(buffer, se);
			buffer.play(se.loop || false);

			this.cleanupSE();
			this._seList.push({
				audio: buffer,
				metadata: se,
			});
		}
	}
	public updateSEParams (buffer: WebAudio, se: AudioMetadata) {
		this.updateBufferParams(buffer, this._seVolume, se);
	}
	public cleanupSE () {
		for (const buffer of this._seList)
			if (!buffer.audio.isPlaying())
				buffer.audio.destroy();

		let i = 0;
		while (i < this._seList.length) {
			if (this._seList[i].audio.isPlaying()) {
				i++;
				continue;
			}
			this._seList.splice(i, 1);
		}
	}
	public stopSE () {
		this._seList.forEach(se => se.audio.destroy());
		this._seList.splice(0, this._seList.length);
	}

	public stopAll () {
		this.stopBGM();
		this.stopSE();
	}

	public saveBGM (): AudioMetadata {
		if (this._currentBGM) {
			const bgm = this._currentBGM;
			return {
				name: bgm.name,
				volume: bgm.volume,
				pos: this._bgmBuffer ? this._bgmBuffer.time() : 0
			}
		} else {
			return this.makeEmptyAudioObject();
		}
	}
	public makeEmptyAudioObject (): AudioMetadata {
		return { name: "", volume: 0 }
	}

	public createBuffer (dir: string, name: string) {
		const url = this._path + dir + encodeURIComponent(name).replace(/%2F/, "/") + AudioManagerClass.audioFileExt;
		const buffer = new WebAudio(url);
		buffer.name = name;
		buffer.frameCount = Game.frameCount;
		return buffer;
	}

	public updateBufferParams (buffer: WebAudio | null, configVolume: number, audio: AudioMetadata | null) {
		if (buffer && audio)
			buffer.volume = (configVolume * (audio.volume || 0)) / 10000;
	}

	public checkErrors () {
		const buffers = [this._bgmBuffer, ...this._seList.map(x => x.audio)];
		for (const buffer of buffers) {
			if (buffer && buffer.isError())
				this.throwLoadError(buffer);
		}
	}
	public throwLoadError (webAudio: WebAudio) {
		const reload = webAudio.reload.bind(webAudio);
		throw ["LoadError", webAudio.url, reload];
	}
}

const AudioManager = new AudioManagerClass();
export default AudioManager;
