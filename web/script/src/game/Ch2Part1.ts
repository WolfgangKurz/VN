import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch2Part2";

export default class GameCh2Part1 extends GameScript {
	public readonly scriptName: string = "Ch2Part1";

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

				this.picture(1001, "SOLID/white.png", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 0.5);
					sprite.transform.position.set(Game.width * 0.5, Game.height * 0.5);

					const cb = (sprite: Sprite): void =>
						void (sprite.transform.scale.set(Game.width / sprite.width, Game.height / sprite.height));

					if (sprite.bitmap.isReady())
						cb(sprite);
					else
						sprite.bitmap.addLoadListener(() => cb(sprite));

					pic.startFadeIn(this.isReady ? 90 : 0); // 1.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.unlock();
				});
			},

			() => this.s("의문의 사내", "고작 이정도인가."),
			() => this.s("나", "…"),
			() => this.s("의문의 사내", "실망스럽군."),
			() => this.s("의문의 사내", "실적만큼은 최근 입사한 애송이들 사이에서 가장 봐줄 만한 수준이라 기대했건만."),
			() => this.s("나", "… 죄송합니다."),
			() => this.s("의문의 사내", "가끔 신입들이 까먹는 사실이 있다네."),
			() => this.s("의문의 사내", "개인의 실적보다 중요한건 화합이야."),
			() => this.s("의문의 사내", "멋대로 설쳐대며 이곳 저곳 들쑤시고 다니면 어떻게 되겠나?"),
			() => this.s("나", "..."),
			() => this.s("의문의 사내", "멋대로 해봐. 어디까지 가나 한번 보고 싶군."),
			() => this.s("의문의 사내", "실적만큼은 최근 입사한 애송이들보다 봐줄만한 수준이니 말이야."),
			() => this.s("의문의 사내", "뒤도 안돌아보고, 옆 사람과 화합따위는 고려하지 않은 그 길의 말로엔 뭐가 있을지 궁금하지 않나?"),
			() => this.s("의문의 사내", "그 끝에서 거대한 괴물이 아가리를 열고 기다리고 있을지도 모를 일이지."),

			() => this.t("그 말을 끝으로 오한이 돋게 웃어 보인 남자의 몸이 기괴하게 뒤틀리기 시작했다."),
			() => this.close(),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.5);
				this.unlock();
			},
			() => {
				AudioManager.playSE({
					name: "2-1_Horror",
					volume: 100,
				});
			},

			() => this.s("의문의 사내", "그 바이오로이드 년, 유미라고 했던가?"),
			() => this.s("의문의 사내", "그게 아마 자네한테 큰 족쇄가 될 것이야. 암."),
			() => this.s("의문의 사내", "자네는 바이오로이드 같은 물건 따위에게도 정을 베푸는 머저리니까."),

			() => this.t("전신이 입고 있던 검은 정장과 같은 색으로 물든 남자가 내 쪽으로 돌아보았다."),

			() => this.s("의문의 사내", "열심히 해봐. 자네가 어디까지 나아갈 수 있을지, 내 끝까지 지켜봐 주겠네."),
			() => this.s("의문의 사내", "… 그 전에."),
			() => this.close(),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.5);
				this.unlock();
			},
			() => {
				this.lock();

				this.picture(1002, "SOLID/red.png", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 0.5);
					sprite.transform.position.set(Game.width * 0.5, Game.height * 0.5);

					const cb = (sprite: Sprite): void =>
						void (sprite.transform.scale.set(Game.width / sprite.width, Game.height / sprite.height));

					if (sprite.bitmap.isReady())
						cb(sprite);
					else
						sprite.bitmap.addLoadListener(() => cb(sprite));

					pic.startFadeIn(this.isReady ? 90 : 0); // 1.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.picture(1001, null);

					this.unlock();
				});
			},

			() => this.t("본능적으로 뒷걸음질 쳤다."),
			() => this.t("놈이 비틀거리며 내게 다가오고 있었다."),
			() => this.t("그러나 탈출구는 없다. 문은 이미 잠겨 있었다."),

			() => this.s("의문의 사내", "여기서 살아나갈 수 있을 지부터 고민해야겠지만."),
			() => this.close(),

			() => {
				AudioManager.playSE({
					name: "2-2_Wake",
					volume: 100,
				});
			},
			() => {
				this.lock();

				this.picture(1002, async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					pic.startFadeOut(this.isReady ? 30 : 0); // 0.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.picture(1002, null);
					this.unlock();
				});
			},
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

			() => this.s("나", "…!"),

			() => this.t("머리가 깨질 듯이 아프다."),
			() => this.t("가슴이 뒤틀릴 것처럼 매스껍고, 뱃속은 전쟁이라도 난 듯 아우성친다."),
			() => this.t("머리부터 발끝까지 땀범벅이 되어 불쾌하다."),
			() => this.t("명치를 세게 얻어맞은 것처럼 숨이 쉬어지지 않아 고통스럽다."),
			() => this.t("역겹기 짝이 없는 악몽."),
			() => this.t("나는 힘겹게 몸을 일으켜 걸어가 가장 가까운 곳에 허리를 숙여 바닥을 짚었다."),

			() => this.t("… 부드럽다."),

			() => this.scg(1, "SCG/STD_03_16"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => { // 바들바들
					if (!pic || !sprite || !this.isReady) return this.unlock();

					for (let _ = 0; _ < 16; _++) { // 16회 반복
						let f = 2;
						let target = Game.width * 0.495;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.x += (target - sprite.x) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);

						f = 2;
						target = Game.width * 0.505;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.x += (target - sprite.x) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);
					}
					sprite.x = Game.width * 0.5;

					this.unlock();
				});
			},

			() => this.s("유미", "으음… 누구야…."),
			() => this.s("나", "…?"),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "…?"),
			() => this.s("나", "어…?"),

			() => this.scg(1, "SCG/STD_03_22"),
			() => this.s("유미", "히이익…!"),
			() => this.s("나", "아."),

			() => this.scg(1, "SCG/STD_03_7"),
			() => this.s("유미", "꺄아아아아아악!!!!!!!"),

			() => {
				this.lock();

				AudioManager.playSE({
					name: "2-3_Hentai!",
					volume: 100,
				});
				AudioManager.playBGM({
					name: "Battle_03",
					volume: 100,
				});
				new Promise<void>(async resolve => {
					this.shake(20, 90);

					while (this.isShaking)
						await this.wait(0);

					resolve();
				}).then(() => this.unlock());
			},

			() => this.scg(1, "SCG/STD_03_7"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => { // 바들바들
					if (!pic || !sprite || !this.isReady) return this.unlock();

					for (let _ = 0; _ < 16; _++) { // 16회 반복
						let f = 2;
						let target = Game.width * 0.495;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.x += (target - sprite.x) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);

						f = 2;
						target = Game.width * 0.505;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.x += (target - sprite.x) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);
					}
					sprite.x = Game.width * 0.5;

					this.unlock();
				});
			},

			() => this.s("유미", "ㄱ, 관리자님!? 우리 아직 이런 사이 아니거든요!?"),
			() => this.s("유미", "만지더라도 허락은 받고… 아니, 애초에 곤히 잠든 숙녀한테 손을 대다니요!"),

			() => this.t("더럽게 아프네, 진짜…"),
			() => this.t("손찌검을 맞고 거의 세 걸음 정도는 날아간 나는 마룻바닥에 주저앉은 채로 10분이 넘는 잔소리를 들어야 했다."),
			() => this.t("아니, 오히려 이 정도로 끝난 게 다행인 건가?"),

			() => this.scg(1, "SCG/STD_03_14"),
			() => this.s("유미", "흥, 뭐… 이해가 안 되는 건 아니에요."),
			() => this.s("유미", "이런 섹시한 몸매의 여자가 무방비한 상태로 눈앞에 있는데 정욕을 참기가 쉽지는 않으셨겠죠."),

			() => this.t("하고픈 말은 많았지만, 괜히 반박했다가는 쓴소리만 듣게 될 것이 뻔했기에 입을 닫았다."),
			() => this.t("근데 이 분위기 어떡하지…?"),

			() => this.sel(
				{ key: "1", text: "야한 농담을 던진다." },
				{ key: "2", text: "별수가 없다. 화가 풀릴 때까지 가만히 있자." },
			),
			() => this.close(),

			...this.when("1", [
				() => this.s("나", "네 가슴 쩔더라?"),

				() => this.scg(1, "SCG/STD_03_17"),
				() => this.s("유미", "뭣…"),
				() => this.s("나", "떡볶이집 순대보다 쫀득쫀득했어!"),

				() => this.scg(1, "SCG/STD_03_7"),
				() => this.s("유미", "으… 으윽… 무슨 소릴 하는 거야, 이 저질!"),
				() => this.s("유미", "미쳤나 봐, 진짜!"),
				() => this.close(),

				() => AudioManager.playSE({
					name: "4-3_Boom!",
					volume: 100,
				}),
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

				() => this.t("아…"),
				() => this.t("일이 단단히 꼬여버린 것 같다."),
				() => this.t("유미는 괴상한 비명을 지르며 화장실로 뛰어 들어가 버렸다."),
				() => this.t("잠이 덜 깬 모양인지, 평소라면 하지도 않았을 무리수를 둔 것 같다."),
				() => this.t("그냥 가만히 있었으면 중간은 갔을 것을…"),
				() => this.t("망연자실하고 있을 때, 유미가 고개를 빼꼼 내밀며 소리쳤다."),
				() => this.close(),

				() => {
					this.lock();

					new Promise<void>(resolve => {
						this.picture(1, "SCG/STD_03_7", async (pic, sprite) => {
							if (!pic || !sprite) return resolve();

							sprite.anchor.set(0.5, 1);
							sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

							// 오른쪽에서 빼꼼
							const xStart = Game.width + 150; // 시작 위치
							const xEnd = Game.width - 100; // 도착 위치

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
				() => this.s("유미", "샤워할 테니까 훔쳐보지 말아요!"),
				() => this.close(),

				() => {
					this.lock();

					new Promise<void>(resolve => {
						this.picture(1, async (pic, sprite) => {
							if (!pic || !sprite) return resolve();

							// 빼꼼에서 오른쪽으로 슬라이딩
							const xStart = Game.width - 100; // 시작 위치
							const xEnd = Game.width + 150; // 도착 위치

							const begin = Game.frameCount;
							const easing = Bezier.EaseIn; // Ease-In 커브
							while (true) {
								const elapsed = Game.frameCount - begin;
								const p = elapsed / 30; // 0.5초
								if (p > 1) break;

								sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
								await this.wait(0);
							}

							this.picture(1, null);
							resolve();
						});
					}).then(() => this.unlock());
				},
			]),
			...this.when("2", [
				() => this.t("유미는 한참이나 씩씩댔고, 나는 그녀 앞에 꿇어앉아 고개를 숙이고 있었다."),

				() => this.scg(1, "SCG/STD_03_14"),
				() => this.s("유미", "… 관리자님."),
				() => this.s("나", "응?"),

				() => this.scg(1, "SCG/STD_03_21"),
				() => this.s("유미", "느낌, 좋았어요…?"),

				() => this.t("대체 무슨 대답을 원하는 거니."),

				() => this.scg(1, "SCG/STD_03_17"),
				() => this.s("유미", "난 또 뭐라는 거야…."),

				() => this.scg(1, "SCG/STD_03_21"),
				() => this.s("유미", "그냥 못 들은 셈해주세요."),
				() => this.s("유미", "아직 술이 덜 깼나 봐요."),
				() => this.s("유미", "실수라고 하시니까 용서해드릴게요."),
				() => this.s("유미", "샤워하고 올 동안 잠 좀 깨시고요."),
				() => this.close(),

				() => {
					this.lock();

					new Promise<void>(resolve => {
						this.scgFn(1, async (pic, sprite) => {
							if (!pic || !sprite) return resolve();

							// 중앙에서 오른쪽으로 슬라이딩
							const xStart = Game.width * 0.5; // 시작 위치
							const xEnd = Game.width + 150; // 도착 위치

							const begin = Game.frameCount;
							const easing = Bezier.EaseIn; // Ease-In 커브
							while (true) {
								const elapsed = Game.frameCount - begin;
								const p = elapsed / 60; // 1초
								if (p > 1) break;

								sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
								await this.wait(0);
							}

							this.scg(1, null);
							resolve();
						});
					}).then(() => this.unlock());
				},

				() => this.t("유미는 얼굴을 붉히더니 도망치듯 화장실로 들어갔다."),
			]),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(1.5);
				this.unlock();
			},
			() => AudioManager.playBGM({
				name: "Daily",
				volume: 100,
			}),

			() => this.t("졸지에 혼자 남게 된 나는 부스스한 머리를 긁적이며 소파에 털썩 주저앉았다."),
			() => this.t("그런데 생각해보니…."),

			() => this.s("나", "나 여자랑 같은 방에서 잔 건가?"),

			() => this.t("결국 의식하고 말았다."),
			() => this.t("부모님께서 돌아가신 이후로는 여자는커녕 누군가와 잔 적조차 없었다."),
			() => this.t("물론 흔히 생각하는 므흣한 일 따위는 일어나지 않았고, 일어날 가능성도 없었으나 한 번 의식해 버린 이상 얼굴이 화끈거리는 것은 어쩔 수가 없었다."),

			() => this.s("나", "그러고보니 방이 하나네…?"),

			() => this.t("여기는 바닥이 네 제곱미터 남짓의 좁은 단칸방이다."),
			() => this.t("화장실을 포함하면 조금 더 넓어지기는 하겠지만, 창문 하나 나지 않아 반지하나 다름없는 이곳에서 생전 처음 보는 남녀가 단 둘이 살아야 한다는 말이다."),

			() => this.s("나", "그래도... 별일이야 있겠어?"),

			() => this.t("아무래도 술은 자제해야 할 것 같다."),
			() => this.t("근무지에서 괜한 실수라도 했다가는 정말 재기불능일 테니까."),
			() => this.t("근질근질한 느낌에 발버둥 치는 사이, 유미가 화장실 문틈으로 고개를 빼꼼 내밀었다."),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_03@_1", async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(1, 1);
						sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

						// 오른쪽에서 빼꼼
						const xStart = Game.width + 150; // 시작 위치
						const xEnd = Game.width + 10; // 도착 위치, 마진 10px

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
			() => this.s("유미", "ㄱ, 관리자님 계세요?"),
			() => this.s("나", "응. 왜 그래?"),

			() => this.t("아무 일도 없었던 것처럼, 천연덕스럽게 대답했다."),

			() => this.s("유미", "옷 좀 갖다주세요…."),
			() => this.s("나", "?"),

			() => { // this.scg(1, "SCG/STD_03@_2", 1),
				this.lock();

				const from = 1;
				const to = 2;

				Promise.all([
					new Promise<void>(resolve => {
						this.picture(from, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? 90 : 0);
							while (pic.isFading())
								await this.wait(0);

							this.picture(from, null);
							resolve();
						});
					}),
					new Promise<void>(resolve => {
						this.picture(to, "SCG/STD_03@_2", async (pic, sprite) => {
							if (!pic || !sprite) return resolve();

							sprite.anchor.set(1, 1);
							sprite.transform.position.set(Game.width + 10 /* 여기 때문에 직접 구현 */, Game.height + 20);

							pic.startFadeIn(this.isReady ? 90 : 0);
							while (pic.isFading())
								await this.wait(0);

							resolve();
						});
					}),
				]).then(() => this.unlock());
			},
			() => this.s("유미", "ㅃ, 빨리요! 대체 무슨 엉큼한 생각을 하시는 거예요!"),

			() => this.t("유미가 농익은 토마토처럼 새빨개진 얼굴로 고함을 질렀다."),
			() => this.t("헐레벌떡 옷장을 열어 그녀가 시키는 대로 따랐다."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(2, async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(1, 1);
						sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

						// 빼꼼에서 오른쪽으로
						const xStart = Game.width + 10; // 시작 위치, 마진 10px
						const xEnd = Game.width + 150; // 도착 위치

						const begin = Game.frameCount;
						const easing = Bezier.EaseIn; // Ease-In-Out 커브
						while (true) {
							const elapsed = Game.frameCount - begin;
							const p = elapsed / 30; // 0.5초
							if (p > 1) break;

							sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
							await this.wait(0);
						}

						this.picture(2, null);
						resolve();
					});
				}).then(() => this.unlock());
			},
			() => this.t("나는 아무 생각이 없다…. 나는 아무 생각이 없다…."),
			() => this.t("열반에 든 부처처럼 마음을 비운 채로 옷을 꺼내 유미에게 건넸다."),
			() => this.t("소파 쿠션에 고개를 숨긴 채 심신을 달래고 있자니 곧 새 옷으로 갈아입은 유미가 터벅터벅 힘없는 걸음으로 걸어 나왔다."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_03_16", async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(0.5, 1);
						sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

						// 오른쪽에서 빼꼼
						const xStart = Game.width + 300; // 시작 위치
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

			() => this.s("유미", "…."),
			() => this.s("나", "…."),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "…."),
			() => this.s("나, 유미", "저기…."),
			() => this.s("나, 유미", "먼저 말…."),

			() => this.t("하하, 확실히 끝장이다."),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "… 관리자님은 안 씻으실 거예요?"),
			() => this.s("나", "ㅆ, 씻어야지."),

			() => this.scg(1, "SCG/STD_03_21"),
			() => this.s("유미", "수건은 욕실 안에 있으니까 그거 쓰시면 돼요."),
			() => this.s("유미", "옷은 꼭 챙기시고요."),
			() => this.s("나", "그래…."),

			() => AudioManager.fadeOutBGM(1.5),
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

			() => AudioManager.playSE({
				name: "1-4_shower",
				volume: 100,
			}),

			() => this.t("아직 훈기가 남은 욕실에서 증기처럼 스멀스멀 피어오르는 잡생각을 떨쳐내기 위해 뼈가 시리도록 차가운 물로 샤워를 했다."),
			() => this.t("그제야 비로소 남아있던 음울한 기운이 사라지는 것 같았다."),
			() => this.t("짧은 주기로 바깥에서 절규가 섞인 비명이 들려왔지만, 애써 무시했다."),
			() => this.t("울고 싶은 건 오히려 내 쪽인데…."),
			() => this.close(),

			() => AudioManager.stopSE(),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(1);
				this.unlock();
			},

			() => this.t("평소보다 조금 더 오래 몸을 헹구고 나온 나는 고개를 기울일 수밖에 없었다."),
			() => this.close(),

			() => {
				this.lock();
				this.bg("13_yumi_room", async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeIn(60 * 2); // 2초 fadein
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeIn(0);

					this.unlock();
				});
			},

			() => this.s("나", "뭐해…?"),

			() => this.scg(1, "SCG/STD_04_2"),
			() => AudioManager.playBGM({
				name: "Talk_05",
				volume: 100,
			}),

			() => this.s("유미", "이제 일 해야죠~"),
			() => this.s("유미", "이렇게 우울한 기분일수록 몸을 움직여야 한다고요."),

			() => this.t("유미는 그렇게 말하며 가방에 주섬주섬 공구를 담고 있었다."),
			() => this.t("아까와 같은 사람이 맞는지 의심스러울 지경이었다."),

			() => this.scg(1, "SCG/STD_04_12"),
			() => this.s("유미", "오늘은 크래들산에 있는 통신기를 정비하러 갈 거예요."),
			() => this.s("유미", "전파는 기지국에서 내보내지만, 거리가 거리인지라 2차 통신망을 거치거든요."),

			() => this.scg(1, "SCG/STD_04_15"),
			() => this.t("정비한 지 꽤 오래 지나기도 했고, 무엇보다 혼자서는 엄두가 안 나서 말이죠."),

			() => this.t("유미가 지도를 꺼내어 호수 옆의 산등성이를 짚었다."),
			() => this.t("아까 몇 번 소리를 지르더니 조금 진정된 듯싶었다."),
			() => this.t("먼저 나서서 꼬인 분위기를 풀어주는 유미가 내심 기특했다."),
			() => this.t("나는 굳이 토를 달지 않고 고개만 끄덕였다."),

			() => this.scg(1, "SCG/STD_04_12"),
			() => this.s("유미", "아, 관리자님도 어서 챙기세요. 생각보다 멀거든요."),
			() => this.s("유미", "늦게 갔다가 밤이 되기라도 하면 위험해져요."),

			() => this.t("어느덧 시계의 시침은 10을 향해가고 있었다."),
			() => this.t("첫 임무부터 등산이라는 것이 영 마음에 걸렸지만, 그래도 기대가 되지 않는다면 거짓이겠지."),
			() => this.t("‘호주’라고 하면 가장 먼저 떠오르는 것은 광활하고 신비로운 자연, 그 자체로 아름다운 천연의 초록빛이 아니던가."),

			() => this.scg(1, "SCG/STD_04_16"),
			() => this.s("유미", "관리자님은 이것 좀 들어주실래요?"),
			() => this.s("나", "이게 뭐야?"),

			() => this.scg(1, "SCG/STD_04_9"),
			() => this.s("유미", "당연히 오늘 점심이죠!"),

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "크래들산의 정상에서 꿈 같은 경치를 바라보며 피크닉…!"),
			() => this.s("유미", "낭만적이지 않나요? 그 풍경을 보면 산을 오르며 느꼈던 고생도 잊게 된다고요."),

			() => this.t("크래들산이라…."),
			() => this.t("호바트의 명물인 만큼, 당연히 오기 전에 정보를 찾아봤었다."),
			() => this.t("호수를 둘러싼 모양이 마치 요람 같다고 하여 붙여진 이름인데, 이 섬에서 여섯 번째로 높은 산이라고 한다."),

			() => this.scg(1, "SCG/STD_04_16"),
			() => this.s("유미", "음, 연장은 다 챙겼고…. 가서 먹을 간식이랑 물도 있고."),
			() => this.s("유미", "혹시 모르니까 무전기도 챙기고…. 아, 돗자리도 챙겨야지!"),

			() => this.t("챙길 게 뭐 그렇게 많은지 유미의 가방은 제 몸보다도 크게 부풀어 있었다."),
			() => this.t("아무리 바이오로이드라지만 저걸 혼자서 들 수 있을까?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_7"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => { // 바들바들
					if (!pic || !sprite || !this.isReady) return this.unlock();

					for (let _ = 0; _ < 16; _++) { // 16회 반복
						let f = 2;
						let target = Game.width * 0.495;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.x += (target - sprite.x) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);

						f = 2;
						target = Game.width * 0.505;

						this.onFrame("e00001", () => {
							if (f > 0) {
								sprite.x += (target - sprite.x) / f;
								f--;
							} else
								this.removeFrame("e00001");
						});
						while (f > 0)
							await this.wait(0);
					}
					sprite.x = Game.width * 0.5;

					this.unlock();
				});
			},
			() => this.s("유미", "읏챠…!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_11"),
			() => this.s("유미", "응? 표정이 왜 그러세요?"),

			() => this.t("나도 모르게 입이 벌어졌나 보다."),
			() => this.t("바이오로이드가 작은 체구로부터 발산하는 상식 외의 힘은 그녀들이 인간이 아니라는 사실을 상기시켜주고는 한다."),
			() => this.t("마음 깊은 곳으로는 나 역시 바이오로이드를 꺼리고 있는지도 몰랐다."),

			() => this.scg(1, "SCG/STD_04V2_11"),
			() => this.s("유미", "관리자님?"),
			() => this.s("나", "어어?"),

			() => this.scg(1, "SCG/STD_04V2_11"),
			() => this.s("유미", "고민이라도 있으세요?"),
			() => this.s("나", "아니, 잠깐 생각할 거리가 있어서."),

			() => this.scg(1, "SCG/STD_04V2_2"),
			() => this.s("유미", "산을 오르다 보면 고민도 사라질 거에요."),
			() => this.s("유미", "마침 날씨도 선선하니까, 등산하기에는 오늘만 한 날도 없을걸요?"),
			() => this.close(),

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
