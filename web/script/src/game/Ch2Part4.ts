import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch2Part5";

export default class GameCh2Part4 extends GameScript {
	public readonly scriptName: string = "Ch2Part4";

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

				this.bg("4_Village street", async bg => {
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

			() => this.t("숲을 가로지르는 대신 호수를 빙 돌아 험하지 않은 길로 가는 탓에 꽤 먼 길을 걷게 됐으나 유미가 내내 종알종알 이야기보따리를 풀어내 지루할 틈은 없었다."),
			() => this.t("얼마나 하고 싶은 이야기가 많았는지 마을에 도착할 때까지도 그칠 기미가 없었다."),
			() => this.t("처음 마을에서 기지국으로 갈 때보다 3배 정도 긴 시간이 소요됐지만, 워낙 빨리 출발한 덕분에 도착했을 당시 마을은 이제 막 생기를 되찾아 가는 시간이었다."),
			() => this.close(),

			() => AudioManager.playBGM({
				name: "WithYou",
				volume: 100,
			}),

			() => this.scg(1, "SCG/STD_02V1_9"),
			() => this.s("유미", "관리자님, 우리 어디부터 갈까요?"),
			() => this.s("유미", "식당? 기념품점? 아니, 쇼핑부터 할까요?"),
			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.scgFn(1, async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						// 중앙에서 왼쪽으로 슬라이딩
						const xStart = Game.width * 0.5; // 시작 위치
						const xEnd = -300; // 도착 위치

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

			() => this.t("자연이 아닌 인공벽돌로 된 땅을 밟자 유미는 무척이나 신이 났다."),
			() => this.t("동에 번쩍 서에 번쩍 쏘다니는 그녀를 따라잡느라 고생 좀 해야 했지만, 그에 대한 피로보다는 뿌듯함이 더 컸다."),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_02V1-2_9", async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(0.5, 1);
						sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

						// 왼쪽에서 중앙으로 슬라이딩
						const xStart = -300; // 시작 위치
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
			() => this.s("유미", "관리자님, 여기 좀 와 보세요!"),
			() => this.s("유미", "우리 소프트 아이스크림 사 먹어요!"),

			() => this.t("문득 생각해보니 항구 도시에서 유미의 반응도 이해가 됐다."),
			() => this.t("1년에 한 번 겨우 문명의 모습을 볼 수 있는 그녀에게, 구시대적인 마을도 아닌 관광 명소로 유명한 도시라면 더할 나위 없는 충격으로 다가왔으리라."),
			() => this.t("경위를 알고 나니 지금까지 보여줬던 유미의 모습들이 측은하게만 느껴졌다."),

			() => this.scg(1, "SCG/STD_02V1-2_9"),
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
			() => this.s("유미", "관리자님, 빨리요~!"),
			() => this.s("나", "금방 갈게!"),

			() => this.t("유미가 가자는 곳을 하나하나 거치며 숙원을 풀어주었다."),
			() => this.t("양손 가득 먹고 싶었던 음식을 꼭 쥔 모습이 철부지 어린아이 같아 웃음이 났다."),
			() => this.t("가장 기억에 남는 것은 유미와 마을 사람들의 관계였다."),
			() => this.t("그들은 하나 같이 친절했다."),

			() => this.t("오랜만에 만난 그녀를 반갑게 맞아주며 다정한 인사를 건네거나 반찬을 싸주는 등, 문명의 여파가 많이 닿지 않은 이곳에는 아직 이웃 간의 정이 살아있었다."),
			() => this.t("이곳의 통신망을 유지해주는 유미를 당연하게 생각하거나 물건 취급하기는커녕 감사를 표했다."),
			() => this.t("이질적이지만, 어쩌면 이것이야말로 우리가 추구해야 할 미래의 모습일지도 몰랐다."),

			() => this.t("마침 최근 들어 세계 곳곳의 도시에서 바이오로이드의 권리 향상에 대한 운동이 거세지고 있었다."),
			() => this.t("인간과 바이오로이드가 조화를 이루는 시대가 머지않아 오게 된다면 이런 모습이지 않을까."),
			() => this.close(),

			() => this.scg(1, null),
			() => {
				this.lock();
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(30); // 0.5초 fadeout
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeOut(0);

					this.bg(null);
					this.unlock();
				});
			},
			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.5);
				this.unlock();
			},
			() => {
				this.lock();

				this.bg("6_Market", async bg => {
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

			() => this.t("우리가 마지막으로 들른 곳은 쇼핑몰이었다."),
			() => this.t("쇼핑몰이라고는 해도 작은 동네 슈퍼 정도에 불과하지만, 유미에게는 그마저도 신세계처럼 느껴졌을 것이다."),

			() => this.scg(1, "SCG/STD_02V1-2_21"),
			() => this.s("유미", "우와아…."),

			() => this.t("각종 인스턴트 식품과 냉동식품, 온갖 생활용품들이 가득한 그곳에 들어서자 유미는 문화충격을 받아 입구에 멈춰 섰다."),

			() => this.scg(1, "SCG/STD_02V1-2_17"),
			() => this.s("유미", "작년까지만 해도 이런 곳은 없었는데…."),

			() => this.t("아무리 작은 마을이라지만 관광지로 통하는 마지막 관문이기에 1년이면 많은 것이 변하기 충분한 시간일 것이다."),
			() => this.t("황망한, 그러나 기대에 찬 표정으로 가만히 서서 진열대가 늘어선 복도를 바라보던 유미는 침을 꿀꺽 한번 삼키더니 조심스럽게 발걸음을 옮겼다."),

			() => this.scg(1, "SCG/STD_02V1-2_8"),
			() => this.s("유미", "이건… 단종된 줄만 알았던 감자칩…!"),
			() => this.s("유미", "뭣? 흔들기만 해도 슬러시가 만들어져…?"),

			() => this.scg(1, "SCG/STD_02V1-2_7"),
			() => this.s("유미", "관리자님! 저 이거 살래요! 이건 사야만 해요!"),

			() => this.t("사실 이곳에 온 진짜 이유는 따로 있었기에, 유미에게 쇼핑카트를 건네준 나는 따로 떨어져 내 목적을 성취하기 위해 청소도구 코너로 향했다."),

			() => this.s("나", "수세미랑… 락스랑… 장대랑…"),

			() => this.t("미리 메모해둔 것들을 품에 바리바리 싸 들고 계산대로 향하자 흡족한 표정의 유미가 뒤를 따라왔다."),
			() => this.t("널찍한 쇼핑카트가 발 디딜 틈도 없이 가득 차 있었다."),
			() => this.t("돈 좀 깨지겠네…."),

			() => this.scg(1, "SCG/STD_02V1-2_11"),
			() => this.s("유미", "그게 다 뭐에요? 웬 청소도구?"),
			() => this.s("나", "다 쓸 데가 있지."),

			() => this.scg(1, "SCG/STD_02V1-2_18"),
			() => this.s("유미", "뭐야~ 궁금하게."),
			() => this.t("얼른 가자는 투로 일축하자 유미는 더 캐묻지 않고 쇼핑카트 가득 담은 물건들을 계산대에 올려놓기 시작했다."),
			() => this.s("나", "유미야…?"),

			() => this.scg(1, "SCG/STD_02V1-2_17"),
			() => this.s("유미", "어… 죄송해요…."),

			() => this.t("계산대 기계에 찍히는 숫자가 늘어날수록 카드를 든 손의 떨림도 커졌다."),
			() => this.t("몸을 움츠리고 눈치를 살살 보며 어색하게 눈웃음을 짓는 그녀가 얄미웠다."),
			() => this.t("그래도 반년간 쌓였을 숙원의 크기를 생각하면 이마저도 부족한 것이 아닌가 싶었다."),

			() => this.s("나", "사고 싶은 건 다 샀어?"),

			() => this.scg(1, "SCG/STD_02V1-2_21"),
			() => this.s("유미", "네…."),
			() => this.s("나", "다 먹을 거네?"),

			() => this.scg(1, "SCG/STD_02V1-2_17"),
			() => this.s("유미", "ㄱ, 그런 건 말씀 안 하셔도 알거든요?"),
			() => this.s("유미", "아껴먹으면 살 안 찐다고요!"),
			() => this.s("나", "더 안 사도 돼?"),

			() => this.scg(1, "SCG/STD_02V1-2_18"),
			() => this.s("유미", "네? 어… 네. 이제 괜찮아요."),
			() => this.s("나", "다행이네."),

			() => this.scg(1, "SCG/STD_02V1-2_21"),
			() => this.s("유미", "…."),

			() => this.t("마을 여기저기 돌아다니는 내내 음식점이나 길거리 음식들을 사 먹은 덕분에 따로 점심을 먹을 필요는 없었다."),
			() => this.t("들고 온 쇼핑백 가득 먹거리를 담은 우리는 아까 왔던 길을 따라 기지국으로 돌아갔다."),
			() => this.close(),

			() => {
				this.lock();

				AudioManager.fadeOutBGM(1.5);
				Promise.all([
					new Promise<void>(resolve => {
						this.bg(async bg => {
							if (!bg) return resolve();

							if (this.isReady) {
								bg.startFadeOut(60 * 1.5); // 1.5초 fadeout
								while (bg.isFading())
									await this.wait(0);
							} else
								bg.startFadeOut(0);

							this.bg(null);
							resolve();
						});
					}),
					new Promise<void>(resolve => {
						this.picture(1001, "../BG/7_Forest_sunset", async (pic, sprite) => {
							if (!pic || !sprite) return resolve();

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

							resolve();
						});
					}),
				]).then(() => {
					this.bg("7_Forest_sunset", async bg => {
						if (!bg) return this.unlock();
						bg.startFadeIn(0);
						this.unlock();
					});
				});
			},

			() => this.t("때는 어느덧 붉게 물든 황혼이었다."),
			() => this.t("노을에 비쳐 상기된 유미의 표정은 어느 때보다 맑고 평온했다."),

			() => {
				AudioManager.playBGM({
					name: "Daily",
					volume: 0,
				});
				AudioManager.fadeInBGM(90);
			},

			() => this.scg(1, "SCG/STD_02V1-3_21"),
			() => this.s("유미", "관리자님."),

			() => this.t("목이 막히지도 않는지 그 쥐방울만 한 작은 입에 물도 없이 주민에게 받은 감자를 욱여넣던 유미가 넌지시 불렀다."),

			() => this.scg(1, "SCG/STD_02V1-3_12"),
			() => this.s("유미", "저희, 또 여기 올 수 있을까요?"),

			() => this.sel(
				"물론이지.",
				"다음 주에 또 올까?",
			),
			() => this.close(),

			() => this.scg(1, "SCG/STD_02V1-3_21"),
			() => this.s("유미", "…."),

			() => this.scg(1, "SCG/STD_02V1-3_2"),
			() => this.s("유미", "네, 기대하고 있을게요."),

			() => this.t("그 뒤로는 별다른 대화가 이어지지 않았다."),
			() => this.t("유미와 만난 뒤로 처음 있는 고요였다."),
			() => this.t("그러나 어색하다거나 불편하게 느껴지지는 않았다."),
			() => this.t("도리어 편안하고, 이것이 당연한 일상처럼 다가왔다."),
			() => this.t("은은하게 떠오른 유미의 미소엔 이제 어떤 불안도 보이지 않았다."),
			() => this.t("그녀의 수다는 끝없이 가라앉는 우울을 잊기 위한 수단이었을 지도 몰랐다."),
			() => this.t("그렇기에 나는 이 기분 좋은 정적을 굳이 깨지 않았다."),
			() => this.t("호주의 가을을 포근하게 감싸는 석양을 따라 기지국에 도착할 때까지, 우리는 영원한 침묵을 유지했다."),
			() => this.close(),

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

			() => this.load(new NextScript()),
		]);
	}
}
