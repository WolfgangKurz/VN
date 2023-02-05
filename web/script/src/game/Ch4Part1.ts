import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch4Part2";

export default class GameCh4Part1 extends GameScript {
	public readonly scriptName: string = "Ch4Part1";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Christmas_02",
				volume: 100,
			}),
			() => {
				this.lock();

				this.bg("13_yumi_room", async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeIn(30); // 0.5초 fadein
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeIn(0);

					this.unlock();
				});
			},

			() => this.t("여전히 오로라는 뜨지 않았다."),
			() => this.t("머핀에 박힌 건포도처럼 무수한 별이 뜬 칠흑만이 계속될 뿐이었다."),
			() => this.t("헤어짐의 시간이 다가올수록 그렇게나 자신만만하던 기세는 어디로 가고 유미의 낯은 불안에 찌들어갔다."),
			() => this.t("물론 그렇게나 초조해하는 것도 이해가 갔다."),
			() => this.t("오직 오로라만을 보기 위해 호바트까지 먼 여행을 오는 이도 많을 정도로 이곳의 오로라는 무척이나 아름답다고 했다."),
			() => this.t("그런 절경을 소중한 이와 함께 나누고 싶은 것은 당연한 본능이다."),
			() => this.t("아무리 그래도…."),

			() => this.s("나", "너무 마음 쓰지 않아도 되는데…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_7"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => { // 방방
					if (!pic || !sprite || !this.isReady) return this.unlock();

					for (let _ = 0; _ < 2; _++) { // 2회 반복
						let f = 20;
						let target = Game.height + 20 + 10;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.y += (target - sprite.y) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);

						f = 20;
						target = Game.height + 20;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.y += (target - sprite.y) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);
					}

					this.unlock();
				});
			},
			() => this.s("유미", "아직 포기하기는 일러요!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_6"),
			() => this.s("유미", "아직… 아직 나흘이나 남았잖아요…."),

			() => this.t("유미는 잔뜩 풀이 죽어 가여운 모습이 되어버렸다."),
			() => this.t("온화한 표정으로 머리를 헝클어주자 얼굴을 붉히는 것이 귀여웠다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_14"),
			() => this.s("유미", "그런다고 마음이 풀어질 줄 아세요?"),
			() => this.s("나", "싫어?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_21"),
			() => this.s("유미", "ㅁ, 멈추지는 마시고…."),

			() => this.t("이렇게 단란한 일상이 어느새 끝나간다니, 쓴웃음을 삼키며 겉으로는 애써 괜찮은 척 어깨를 펴 보였다."),
			() => this.t("무릎 위에 앉아 우울한 기색을 그대로 내비치던 유미가 뒤를 돌아보며 웅얼거렸다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "꼭 보여드리고 싶은데…."),

			() => this.t("일 년이 지나도록 행방이 묘연한 오로라를 걱정하는 유미를 부둥켜안으며 위로해주고 있자 어째 바깥에서 뒤숭숭한 분위기가 감돌기 시작했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_15"),
			() => this.s("유미", "으… 또 비가 오네요."),
			() => this.s("나", "그러게… 겨우 그쳤나 싶었더니."),

			() => this.t("겨우 며칠 잠잠했던 하늘이 또 눈물을 쏟아내기 시작했다."),
			() => this.t("그런데 이번에는 그 기세가 영 심상치 않았다."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(0.5),

			() => this.s("나", "… 태즈메이니아에도 태풍이 부나?"),

			() => this.scg(1, "SCG/STD_03_15"),
			() => this.s("유미", "아… 요즘은 꽤 흔해요."),
			() => this.s("유미", "정말 날씨가 미치기라도 한 건지, 호주 최남단에 사이클론이라니."),
			() => this.s("유미", "저번 여름에는 온도가 30도가 넘게 오르는 바람에 쪄 죽는 줄 알았다니까요?"),

			() => this.t("나의 부모님 세대를 건너, 증조부 세대 전부터 시작된 지구온난화의 영향인 듯싶었다."),
			() => this.t("2000년대 초부터 이어진 이슈라던데 정작 아직도 그렇다 할 방안을 내놓지 못해 한국의 여름은 불지옥을 아득히 초월한 더위를 자랑한다."),
			() => this.t("그 영향이 적도 너머 호주에까지 손아귀를 뻗고 있는 것이었다."),
			() => this.close(),

			() => {
				this.lock();

				AudioManager.playSE({
					name: "4-1_Thunder",
					volume: 100,
				});
				new Promise<void>(async resolve => {
					this.shake(20, 90);

					while (this.isShaking)
						await this.wait(0);

					resolve();
				}).then(() => this.unlock());
			},

			() => this.scg(1, "SCG/ STD_03_22"),
			() => this.s("유미", "꺄아아악!"),
			() => this.s("나", "으아아아아악!"),

			() => this.t("유미의 비명에 나까지 덩달아 놀라 자빠졌다."),
			() => this.t("기지국을 강타한 천둥소리 때문이었다."),
			() => this.t("반지하에 있는 터라 그 진동은 마치 지진을 방불케 했다."),
			() => this.t("땅이 갈라지는 듯한 막대한 소리에 놀란 유미는 고막이 찢어지도록 비명을 질렀다."),
			() => this.t("번개는 그 뒤로도 몇 번이나 지면에 내려꽂혔고, 그때마다 유미의 고막 테러를 감내해야 했다."),
			() => this.t("그러나 진짜 문제는 그다음에 발생했다."),
			() => this.close(),

			() => AudioManager.playBGM({
				name: "Talk_04",
				volume: 100,
			}),
			() => AudioManager.playSE({
				name: "4-2_Siren",
				volume: 100,
			}),

			// 화면 점멸 (빨강)
			() => {
				this.lock();

				this.picture(1001, "SOLID/red.jpg", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 0.5);
					sprite.transform.position.set(Game.width * 0.5, Game.height * 0.5);

					const cb = (sprite: Sprite): void =>
						void (sprite.transform.scale.set(Game.width / sprite.width, Game.height / sprite.height));

					if (sprite.bitmap.isReady())
						cb(sprite);
					else
						sprite.bitmap.addLoadListener(() => cb(sprite));

					pic.startFadeIn(this.isReady ? 15 : 0); // 0.25초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.unlock();
				});
			}, // 깜
			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1001, async (pic) => {
						if (!pic) return resolve();

						pic.startFadeOut(this.isReady ? 15 : 0);
						while (pic.isFading())
							await this.wait(0);

						this.picture(1001, null);
						resolve();
					});
				}).then(() => this.unlock());
			}, // 빡
			() => {
				this.lock();

				this.picture(1001, "SOLID/red.jpg", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 0.5);
					sprite.transform.position.set(Game.width * 0.5, Game.height * 0.5);

					const cb = (sprite: Sprite): void =>
						void (sprite.transform.scale.set(Game.width / sprite.width, Game.height / sprite.height));

					if (sprite.bitmap.isReady())
						cb(sprite);
					else
						sprite.bitmap.addLoadListener(() => cb(sprite));

					pic.startFadeIn(this.isReady ? 15 : 0); // 0.25초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.unlock();
				});
			}, // 깜
			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1001, async (pic) => {
						if (!pic) return resolve();

						pic.startFadeOut(this.isReady ? 15 : 0);
						while (pic.isFading())
							await this.wait(0);

						this.picture(1001, null);
						resolve();
					});
				}).then(() => this.unlock());
			}, // 빡

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "이런, 통신기가 망가졌나…!"),

			() => this.t("저 멀리에서 들린 천둥소리를 기점으로, 기지국 벽에 조그맣게 고개를 내밀고 있던 용도 모를 빨간 사이렌들 중 하나가 울리기 시작했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "관리자님, 저 잠깐 나갔다 올게요."),
			() => this.s("유미", "위험하니까 여기 가만히 계셔야 해요. 아셨죠?"),
			() => this.s("나", "어디 가려고?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "관제탑 근처에요."),
			() => this.s("유미", "아마 그곳의 통신기가 벼락에 맞은 것 같아요."),
			() => this.s("나", "위험한 건 너도 마찬가지잖아!"),
			() => this.s("나", "바람 멎으면 그때 가."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_26"),
			() => this.s("유미", "비 안 올 때 빨리 끝내야 해요."),
			() => this.s("유미", "한번 쏟아지기 시작하면 다음 날까지는 계속된다고요."),
			() => this.s("유미", "그때까지 사람들이 전파를 못 쓰게 둘 수는 없어요."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.scgFn(1, async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						// 중앙에서 오른쪽으로 슬라이딩
						const xStart = Game.width * 0.5; // 시작 위치
						const xEnd = Game.width; // 도착 위치

						const begin = Game.frameCount;
						const easing = Bezier.EaseIn; // Ease-In 커브
						while (true) {
							const elapsed = Game.frameCount - begin;
							const p = elapsed / 60; // 1초
							if (p > 1) break;

							sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
							await this.wait(0);
						}

						this.scg(1, null, 0);
						resolve();
					});
				}).then(() => this.unlock());
			},

			() => this.s("나", "잠ㄲ…"),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_04_7", async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(0.5, 1);
						sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

						// 오른쪽에서 중앙으로 슬라이딩
						const xStart = Game.width; // 시작 위치
						const xEnd = Game.width * 0.5; // 도착 위치

						const begin = Game.frameCount;
						const easing = Bezier.SmoothOut; // Ease-In-Out 커브
						while (true) {
							const elapsed = Game.frameCount - begin;
							const p = elapsed / 30; // 0.5초
							if (p > 1) break;

							sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
							await this.wait(0);
						}

						sprite.transform.position.x = xEnd;
						resolve();
					});
				}).then(() => this.unlock());
			},
			() => this.scg(1, "SCG/STD_04_7"),
			() => this.s("유미", "절대 나오시면 안 돼요!"),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.scgFn(1, async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						// 중앙에서 오른쪽으로 슬라이딩
						const xStart = Game.width * 0.5; // 시작 위치
						const xEnd = Game.width; // 도착 위치

						const begin = Game.frameCount;
						const easing = Bezier.EaseIn; // Ease-In 커브
						while (true) {
							const elapsed = Game.frameCount - begin;
							const p = elapsed / 60; // 1초
							if (p > 1) break;

							sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
							await this.wait(0);
						}

						this.scg(1, null, 0);
						resolve();
					});
				}).then(() => this.unlock());
			},

			() => this.t("유미가 바람 때문에 쉬이 열리지 않는 문을 아등바등 열고 나가며 마지막으로 당부했다."),
			() => this.t("무어라 말릴 새도 없이 단호한 기세에 밀려버렸다."),
			() => this.t("또 방안에 홀로 남아버린 나는 한심한 자신을 비관하며 막연히 기다릴 수밖에 없었다."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(2),
			() => this.scg(1, null),
			() => {
				this.lock();
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
