import Game from "..";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch1Part2";

export default class GameCh1Part1 extends GameScript {
	public readonly scriptName: string = "Ch1Part1";

	private _shakeFadeout = 0;
	private _shakeThreshold = 3;

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},
			() => {
				this.lock();

				console.log("play Rattle bgm");
				AudioManager.playBGM({
					name: "Rattle",
					volume: 100, // %
				});
				AudioManager.fadeInBGM(2);

				console.log("set BG");
				this.bg("1_Airplane window", bg => {
					if (!bg) return this.unlock();

					const _this = this;
					const w = Game.width;
					const h = Game.height;

					if (this.isReady)
						bg.startFadeIn(2 * 60);
					else
						bg.startFadeIn(0);

					bg.scale.set((w + 3) / w, (h + 3) / h); // 흔들림 마진 조정
					bg.onUpdate(function () {
						const th = _this._shakeThreshold;

						if (_this._shakeFadeout > 0) { // 흔들림 감소 처리
							_this._shakeThreshold -= _this._shakeThreshold / _this._shakeFadeout;
							_this._shakeFadeout--;
						}

						// 흔들림 처리
						const r = this as typeof this & {
							transition: {
								X: number;
								Y: number;
								count: number;
							};
						};
						if (!r.transition)
							r.transition = { X: 0, Y: 0, count: 0 };

						if (r.transition.count === 0) {
							r.transition.X = Math.random() * th - th / 2 - 1.5;
							r.transition.Y = Math.random() * th - th / 2 - 1.5;
							r.transition.count = 60;
						}

						r.x += (r.transition.X - r.x) / r.transition.count;
						r.y += (r.transition.Y - r.y) / r.transition.count;
						r.transition.count--;
					});

					const interval = setInterval(() => {
						if (!bg.isFading()) {
							this.unlock();
							this.unblock();
							clearInterval(interval);
						}
					}, 20);
				});
			},
			() => this.t("호주의 하늘이라고 한국과 다를 것은 없다."),
			() => this.t("그저 조금 더 푸를 뿐이다."),
			() => {
				this._shakeFadeout = 120 * 3; // 3초 fadeout
				AudioManager.fadeOutBGM(3);
				this.t("창가에 기댄 손에 턱을 괴고 홀연히 창밖을 바라보며 사색에 잠기자, 곧 비행기는 목적지에 다다랐다.");
			},
			() => this.close(), // 대사창 닫기

			() => {
				this.lock();

				// BG 페이드아웃
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(60 * 2); // 2초 fadeout
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeOut(0);

					this.bg(null);
					this.unlock();
				});
			},

			() => this.load(new NextScript()),
		]);
	}
}
