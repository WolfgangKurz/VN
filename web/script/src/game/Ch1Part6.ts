import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";
import Session from "@/core/Session";

import NextScript from "./Ch2Part1";

export default class GameCh1Part6 extends GameScript {
	public readonly scriptName: string = "Ch1Part6";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			() => {
				this.lock();

				this.bg("5_radar(moss day time)", async bg => {
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

			() => this.t("나무가 드문 공터 한 가운데 우뚝 선 기지국은 마치 동화 속 난쟁이들이 사는 숲 속 오두막처럼 보였다."),
			() => this.t("제 기능을 하는지도 의심스러운 그것에서는 아까 만났던 램파트처럼, 세월의 흔적이 물씬 풍겼다."),
			() => this.t("금속으로 된 벽면은 대부분 산화되어 붉게 물들었고, 넝쿨과 이끼가 끼어 자연과 동화되어 가고 있었다."),
			() => this.t("자연과 문명이 절묘하게 섞인 아름다운 풍경에 백치가 된 듯 감탄하기도 잠시, 유미의 부름에 정신을 차렸다."),

			() => this.scg(1, "SCG/STD_01_12"),
			() => this.s("유미", "에헤헤, 수고하셨어요. 오는 길이 꽤 험했죠?"),
			() => this.s("유미", "딱히 나갈 일도 없는 데다가 들어오는 사람도 없어서…."),
			() => this.sel(
				"넌 왜 바깥에 안 나가?",
				"들어오는 사람이 없다고?",
			),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_28"),
			() => this.s("유미", "앗… 헤헤, 방금 말은 못 들은 걸로 해주세요."),

			() => this.scg(1, "SCG/STD_01_18"),
			() => this.s("유미", "여자한테는 말 못할 비밀 한두 개 정도는 있는 법이라고요."),

			() => this.t("유미는 허를 찌른 질문에 황당했다가 이내 실실 웃으며 둘러댔다."),
			() => this.t("숨기는 것이 있는 모양인데…."),
			() => this.t("아무래도 자세한 내막을 알기까지는 많은 시간이 필요할 것 같다."),

			() => this.scg(1, "SCG/STD_01_19"),
			() => this.s("유미", "여기서 이러고 있지 말고 어서 들어가요."),
			() => this.s("유미", "온통 땀투성이라 빨리 씻고 싶네요."),
			() => this.s("유미", "모처럼 새로운 분을 만난다고 해서 차려입었는데 이게 뭐람."),
			() => this.s("나", "올 때는 깨끗해 보이던데?"),

			() => this.scg(1, "SCG/STD_01_11"),
			() => this.s("유미", "그야 올 때는 덜 거친 길로 돌아갔으니까요."),
			() => this.s("유미", "트럭이 예정보다 늦게 도착한 바람에 어쩔 수가 없었어요."),
			() => this.s("유미", "그 길로 왔으면 아직 반도 못 왔을걸요?"),
			() => this.s("유미", "밤이 되면 숲은 엄~청 위험해지니까 별수 있나요."),

			() => this.t("아직 노을이 지지는 않았으나 조금만 지체했다면 밤이 됐을 것이다."),
			() => this.t("빠른 길은 거칠고 안전한 길은 돌아가야 한다니, 대체 누가 이런 곳에 기지국을 세울 생각을 한 걸까."),
			() => this.t("정말 오지에 왔음이 뼈에 시리도록 실감했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_7"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => {// 방방
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

			() => this.s("유미", "관리자니임~! 빨리 안 들어오시면 문 닫을 거예요!"),

			() => this.t("잠시 생각에 빠진 틈에 유미는 어느새 현관까지 들어가 손을 흔들고 있었다."),
			() => this.t("난쟁이들의 집에 들어가는 백설공주의 기분이 이랬을까."),
			() => this.close(),

			() => this.scg(1, null),
			() => {
				this.lock();

				this.bg(async (bg, sprite) => {
					if (!bg || !sprite) return this.unlock();

					bg.startFadeOut(this.isReady ? 90 : 0); // 1.5초 fadein
					while (bg.isFading())
						await this.wait(0);

					this.bg(null);
					this.unlock();
				});
			},

			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => {
				this.lock();

				AudioManager.playBGM({
					name: "Talk_07",
					volume: 100,
				});

				this.bg("14_yumi_room_lights_off", async bg => {
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

			() => this.s("나", "이… 이건…."),
			() => this.scg(1, "SCG/STD_01_8"),
			() => this.s("유미", "아…."),

			() => this.t("방안을 들여다본 유미와 나는 동시에 굳어버리고 말았다."),
			() => this.t("이루 형용할 수가 없는 거대한 충격이 뒤통수를 후려친 것 같았다."),
			() => this.t("말도 안 돼. 이런 일이 내 눈앞에 펼쳐지다니…."),

			() => this.scg(1, "SCG/STD_01_17"),
			() => this.s("유미", "관리자님…? 이건 그러니까…."),

			() => this.t("나는 시큰거리는 이마를 부여잡으며 소리쳤다."),

			() => AudioManager.playBGM({
				name: "Talk_05",
				volume: 100,
			}),

			() => this.s("나", "집안 꼴이 대체 이게 뭐야!"),
			() => this.close(),

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
			() => this.s("유미", "히익…! 죄송해요!"),

			() => this.scg(1, "SCG/STD_01_3"),
			() => this.s("유미", "손님이 오신다는 말에 신나서 그만…."),

			() => this.t("평소에도 이러고 살았다는 말이겠지."),
			() => this.t("마시다 만 물병, 다 쓴 휴지심, 게다가 저건 뭐야..."),
			() => this.t("그다지 넓지도 좁지도 않은 방, 유미의 마지막 남은 자존심을 짓밟을 만한 물건들이 각지에 널려 있었다."),

			() => this.s("나", "유미, 저건 설마 ㄷ…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_7"),
			() => this.s("유미", "꺄아아아악! 그만, 그만! 그건 얘기하지 말아 주세요!"),

			() => this.t("거의 울기 일보 직전이 되어버린 유미가 팔에 매달리며 외쳤다."),
			() => this.t("저렇게 큰 게 다 들어가…?"),
			() => this.t("보면 볼수록 바이오로이드는 신묘한 존재다."),
			() => this.t("저 작은 몸집에 어떻게…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_5"),
			() => this.s("유미", "흐윽… 흐아앙… 이게 뭐야…."),
			() => this.s("유미", "다 치웠다고 생각했는데…. 이제 다 끝났어…."),

			() => this.t("양심에 손을 얹고 다시 생각해봐."),

			() => this.scg(1, "SCG/STD_01_24"),
			() => this.s("유미", "관리자님. 죄송해요. 이런 방법은 쓰지 않으려고 했는데...."),
			() => this.s("나", "어? 방금 뭐라고 했어?"),

			() => this.t("유미가 입술을 꽉 깨물며 무어라 중얼거렸다."),
			() => this.t("뭔가 불길한 소리를 한 것 같았는데."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_17"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => {// 방방
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

			() => this.s("유미", "어!? 저게 뭐지!?"),
			() => this.s("나", "어어? 뭔데!"),

			() => this.t("의중을 파악하기도 전에 유미가 화들짝 놀라며 방 한쪽을 손가락으로 가리켰다."),
			() => this.close(),

			() => AudioManager.playSE({
				name: "1-3_Ouch",
				volume: 100,
			}),

			async () => {
				this.lock();

				if (!this.isReady) {
					this.bg(null);
					this.scg(1, null, 0);
					return this.unlock();
				}

				let fading = 2;

				this.shake(20, 120);
				this.bg(async bg => {
					if (!bg) return;
					bg.startFadeOut(120);

					while (bg.isFading())
						await this.wait(0);

					fading--;
				});
				this.scgFn(1, async pic => {
					if (!pic) return;
					pic.startFadeOut(120);

					while (pic.isFading())
						await this.wait(0);

					fading--;
				});

				while (this.isShaking || fading > 0)
					await this.wait(0);

				this.bg(null);
				this.scg(1, null, 0);
				this.unlock();
			},

			() => this.t("그리고 곧 무언가 차갑고 딱딱한 것이 뒤통수를 강타했다."),
			() => this.t("비유적 표현이 아니라, 정말로."),

			() => this.s("유미", "잠깐 주무시고 일어나시면… 후후, 분명 상쾌할 거예요."),
			() => this.s("유미", "관리자님은 아무것도 못 보신 거예요. 아 셨 죠 ?"),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => this.t("."),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.25);
				this.unlock();
			},

			() => this.t(".."),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.25);
				this.unlock();
			},

			() => this.t("..."),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.25);
				this.unlock();
			},

			() => this.close(),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => this.s("???", "… 님…!"),
			() => this.s("???", "… 자님…!"),
			() => this.s("???", "… 눈을 뜨세요…!"),
			() => this.s("???", "관리자님!"),

			() => this.t("헉!"),
			() => this.close(),

			() => {
				this.lock();

				AudioManager.playBGM({
					name: "Talk_06",
					volume: 100,
				});

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

			() => this.t("…잠깐 잠들었던가?"),
			() => this.t("분명 유미를 따라 기지국 안으로 들어와서…."),
			() => this.t("음, 그다음에는 무언가 충격적인 것을 봤던 것 같은데…."),
			() => this.t("전혀 모르겠다. 기지국에 들어온 뒤의 일은 아무것도 기억나지 않는다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "어휴, 드디어 일어나셨네."),
			() => this.s("유미", "지금이 몇 시인지 아세요?"),

			() => this.t("…누구세요?"),

			() => this.t("잠시 멈칫하며 응시하니 뚜렷한 이목구비가 눈에 들어왔다."),
			() => this.t("여자의 변신은 무죄라더니, 머리만 묶었을 뿐인데도 다른 사람처럼 보인다."),
			() => this.t("그건 논외로 치더라도, 화장을 지워서 그대로 드러난 진한 다크 서클과 속이 비춰 보일 듯 말 듯한 후줄근한 내복…."),
			() => this.s("나", "기지국에 들어오자마자 잠들었던 거야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "네. 제가 뭐라 하기도 전에 소파에 쓰러지시더니 그대로 잠드셨어요."),
			() => this.s("유미", "말 그대로 귀신들린 듯이 주무시더라고요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_14"),
			() => this.s("유미", "나 참, 숙녀의 집에 들어왔는데 너무 무방비하신 거 아니신가요?"),

			() => this.t("누가 할 말인데."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "너무 피곤해 보이셔서 차마 깨우지는 못했지만, 다른 여성분들한테 그러셨다가는 정말 뺨 맞는 거 아시죠?"),

			() => this.t("…뭔가 이상한데. 아니, 너무 피곤해서 그런 거겠지."),
			() => this.t("왠지 세게 얻어맞은 것처럼 뒤통수가 욱신거린다."),
			() => this.t("게다가 방은 방금 청소한 것처럼 먼지 한 톨 없이 깨끗하다."),
			() => this.t("전등이 그리 밝지는 않지만, 바닥에서 윤기가 나는 것처럼 보일 지경이다."),
			() => this.t("이 기시감은 뭘까."),
			() => this.t("시계를 보자 벌써 한밤이었다."),
			() => this.t("이 기지국에 들어왔을 때가 석양이 뜨지 않은 초저녁 무렵이었으니 꽤 오래 잠들었던 모양이었다."),
			() => this.t("멍하니 방안을 둘러보고 있자니 유미가 기겁하며 핀잔했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_15"),
			() => this.s("유미", "잠기운 다 갔으면 어서 씻으세요. 지금 엄청 냄새나거든요?"),
			() => this.s("유미", "제가 아까 씻었으니까 아직 따뜻할 거예요."),
			() => this.s("유미", "더 추워지기 전에 씻는 게 좋을 걸요?"),
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

			() => AudioManager.playSE({
				name: "1-4_shower",
				volume: 100,
			}),

			() => this.t("거의 등 떠밀리듯이 욕실로 들어가 샤워를 마쳤다."),
			() => this.t("그제야 피로가 풀리는 기분이었다."),
			() => this.t("숲 속의 흙과 먼지를 훌훌 털어내고 나니 비로소 몸이 가벼워졌다."),
			() => this.t("얼얼하던 뒤통수의 고통도 사라진 것 같았다."),

			() => AudioManager.stopSE(),
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

			() => this.t("상쾌해진 발걸음으로 욕실에서 나오자 무언가 부지런히 준비하고 있는 유미가 보였다."),

			() => this.s("나", "지금 뭐하는 거야?"),
			() => this.close(),

			() => AudioManager.playBGM({
				name: "HeartbeatOME",
				volume: 100,
			}),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "그야 당연히 술자리 준비죠~!"),
			() => this.s("유미", "우리의 첫 만남을 기념 해야하지 않겠어요?"),
			() => this.s("유미", "이런 날 술을 안 마시면 바보지."),

			() => this.t("술이라…."),
			() => this.t("많은 생각이 뇌리에 스친다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "혹시 맥주 좋아하세요?"),
			() => this.s("유미", "저는 이 맥주가 그렇게 좋더라구요~"),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_05.png", async (pic, sprite) => {
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

			() => this.t("그렇게 말하며 들어 보인 맥주 캔에는 초록 바탕에 노란 코끼리 그림이 그려져 있었다."),
			() => this.t("맥주가 몇 캔이나 쌓인 바닥과 탁자."),
			() => this.t("이미 탁자 위는 함께 먹을 안주와 버리지 않은 비닐봉지로 가득했다."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1001, async (pic) => {
						if (!pic) return resolve();

						pic.startFadeOut(this.isReady ? 90 : 0);
						while (pic.isFading())
							await this.wait(0);

						this.picture(1001, null);
						resolve();
					});
				}).then(() => this.unlock());
			},

			() => this.scg(1, "SCG/STD_03_9"),
			() => this.s("유미", "자~ 여기 앉으세요. 우리 건배해요, 건배!"),

			() => this.t("약간 상기된 표정으로 옆자리를 탁탁 두드리는 유미."),
			() => this.t("바닥에 캔 몇 개가 나뒹구는 것을 보아 벌써 취한 모양이다…."),

			() => this.s("유미", "멀뚱멀뚱 서 계시지 말구~"),
			() => this.s("유미", "히힛, 어서 시원~하게 마시고 뻗자구요!"),

			() => this.sel(
				{ key: "1", text: "역시 이런 날에는 마셔줘야지!" },
				{ key: "2", text: "아무래도 술은 좀…." },
			),
			() => {
				Session.set("Ch1Part6Sel", this.selected);
			},

			() => this.scg(1, "SCG/STD_03_9"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => {// 방방
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

			...this.when("1", [
				() => this.s("유미", "헤헷, 역시 뭘 좀 아시네~"),
				() => this.s("유미", "자자, 시원하게 들이키세요!"),
				() => this.s("유미", "꺄아~ 상남자시네~ 자, 한 캔 더!"),

				() => this.t("술이 내가 되고 내가 술이 된다."),
				() => this.t("몰아치는 알코올 파도와 유미의 재롱에 힘입어 바닥에 쌓여 있던 맥주들은 어느새 대부분 빈 병이 되어 갔다."),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "히끅… 헤헤, 관리자니임…. 술… 흐끅! 진짜 잘 드신다…."),
				() => this.s("유미", "다른 사람이랑… 술 마시는 게 대체 얼마 만인지... 딸꾹!"),

				() => this.t("이미 몸도 제대로 가누지 못하는 지경이 된 유미가 비틀거리며 피식 웃었다."),
				() => this.t("거나하게 취한 것은 나도 마찬가지라서, 지금 무슨 말을 뱉는지도 모르는 꼴이었다."),

				() => this.scg(1, "SCG/STD_03_6"),
				() => this.s("유미", "있죠오… 저, 지인짜 외로웠거든요… 히끅!"),
				() => this.s("유미", "아조씨랑 이야기하는 것도 하루 이틀이지, 30년이었다구요, 30년."),
				() => this.s("나", "푸흡… 그러엄 너어는 30살 노처녀라는 거네에?"),

				() => this.scg(1, "SCG/STD_03_7"),
				() => this.s("유미", "머래… 저어 아직 젊거든여!?"),
				() => this.s("유미", "이것 봐여! 아직 이마에 주름 하나 없는데… 흐윽…내가 노처녀 소리나 듣고…."),
				() => this.s("나", "왜 또 울어어! 울지 마! 뚝!"),

				() => this.scg(1, "SCG/STD_03_5"),
				() => this.s("유미", "제가 관리자님이랑 만나는 걸 얼마나 기대했는지 알아여!?"),
				() => this.s("유미", "근데 그런 망발이나 하고… 짜증나~!"),
				() => this.s("나", "끅... 얼마나 외로웠는데에?"),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "엄~청 외로웠어여…."),
				() => this.s("유미", "매애애앤날, 허구한 날… 아무도 찾아오지도 않는 숲 속에서 떠돌고…"),
				() => this.s("유미", "그런데 관리자님이 오신다구 해서 엄~청 조아써여... 히힛…."),

				() => this.t("혀가 꼬여 알아듣는 어려웠지만, 그녀가 어떤 마음으로 숲속 생활을 견뎌냈을지는 조금이나마 알 수 있을 것 같았다."),

				() => this.s("나", "내가 한국에서 얼마나 힘들게 펙스에 취업했는데…."),
				() => this.s("나", "이런 촌구석에 처박히려고 열심히 일 한 줄 알아?"),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "히끅… 촌구석이 왜요오~ 저는 좋기만 한데…."),
				() => this.s("나", "난 말이야! 가족도 친구도 없이 머저리처럼 공부만 했다고. 살아남기 위해서!"),
				() => this.s("나", "네가 그 고통을 알기나 해?"),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "헤헤… 알 것 같아요. 왠지 비슷하네요, 우리."),
				() => this.s("나", "푸흡… 그러네에… 둘 다 친구도 뭣도 없는 백치는 맞네…."),

				() => this.scg(1, "SCG/STD_03_13"),
				() => this.s("유미", "… 그래도, 이젠 혼자가 아니라서 다행이라고 생각해요."),
				() => this.s("나", "뭐?"),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "히힛, 아무것도 아니에여!"),
				() => this.s("유미", "자자, 이럴 시간에 한 잔이라도 더 마셔요!"),

				() => this.t("일순, 술기운이 달아난 것 같았다."),
				() => this.t("잠깐이었지만 유미의 표정에 나로서는 감히 짐작조차 하기 힘든 고독과 고초, 안도가 동시에 드러났었다."),
				() => this.t("나는 그 모습을 기억 속에서 지우려는 듯, 금시의 신세에 대해 한탄하며 억지로 술을 들이켰다."),
				() => this.t("텅 빈 무대에서 연극을 마치고 쇠주로 마음을 달래는 소리꾼처럼 외롭고, 비참하게."),
				() => this.t("달마저 저물어가고 여명이 떠오를 무렵까지 자리를 이어간 우리는 결국 쓰러지듯 탁자 위에 엎어져 잠들고 말았다."),
				() => this.t("난장판이 된 방에서 다시 눈을 떴을 때는 이미 하루가 지난 뒤의 아침이었다."),
			]),
			...this.when("2", [
				() => this.scg(1, "SCG/STD_03_17"),
				() => this.s("유미", "네!? 이제 와서 빼는 거예요?"),
				() => this.s("유미", "으으, 진짜 서운하네요…."),
				() => this.s("유미", "진짜 안 드실 거예요? 정말 저 혼자 마시라고요?"),

				() => this.t("어쩔 수가 없다."),
				() => this.t("난 술이라면 손도 대지 못하는 데다가, 그리 좋아하지도 않으니까."),

				() => this.scg(1, "SCG/STD_03_19"),
				() => this.s("유미", "와… 진짜 너무하신다…."),
				() => this.s("유미", "이럴 때는 눈치껏 같이 마셔주셔야죠!"),

				() => this.t("유미는 무척이나 실망한 것 같았다."),
				() => this.t("마음은 이해하지만 싫은 걸 어떡해…."),

				() => this.scg(1, "SCG/STD_03_14"),
				() => this.s("유미", "으이그, 설마 바로 주무실 건 아니죠?"),
				() => this.s("유미", "안주 드시면서 말동무라도 해주세요."),
				() => this.s("유미", "혼자 술 마시면서 혼잣말하는 건 정말이지 지긋지긋하거든요."),

				() => this.scg(1, "SCG/STD_03_15"),
				() => this.s("유미", "… 기대하고 있었는데."),

				() => this.t("유미는 그 작은 몸으로 마치 물 마시듯이 술을 넘겼다."),
				() => this.t("거의 10캔 가까이 연달아 마시더니 결국 말도 제대로 못 할 정도로 취하고 말았지만."),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "딸꾹! 그래서 있죠, 제가 몇 년이나 여기에서 산 줄 아세요?"),
				() => this.s("유미", "무려 30년이 다 돼 간다고요!"),
				() => this.s("유미", "키힛… 놀라시기는… 이젠 아주 지긋지긋하던 차였는데… 마침 지령이 오더라고요?"),
				() => this.s("유미", "그래, 관리자님이 오신다느은… 전보가 왔어요."),
				() => this.s("유미", "흐흣… 너무 좋아서 방방 뛰다가…"),

				() => AudioManager.playSE({
					name: "4-3_Boom!",
					volume: 100,
				}),
				() => {
					this.lock();

					new Promise<void>(async resolve => {
						this.shake(20, 90);

						while (this.isShaking)
							await this.wait(0);

						resolve();
					}).then(() => this.unlock());
				},

				() => this.scg(1, "SCG/STD_03_7"),
				() => this.s("유미", "쾅!!!!!!!!!!!!!"),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "실수로 의자를 부숴버렸지 머에여…?"),

				() => this.t("아마 자기가 무슨 말을 하는지도 모르고 있겠지."),
				() => this.t("… 안주가 맛있네."),

				() => this.scg(1, "SCG/STD_03_6"),
				() => this.s("유미", "저어, 진짜 외로웠다고요."),

				() => this.scg(1, "SCG/STD_03_13"),
				() => this.s("유미", "… 그래도, 이젠 혼자가 아니라 다행이라고 생각해요."),

				() => this.t("잠깐이었지만 분위기가 아주 달라졌었다."),
				() => this.t("가져가던 육포를 떨어뜨릴 뻔했으나 곧 정신을 차리고 입안으로 집어넣었다."),
				() => this.t("유미의 쓰디쓴 미소에는 헤아리기도 힘든 비애와 고독이 묻어 있었다."),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "헤에… 관리자니임…."),
				() => this.s("나", "응?"),

				() => this.scg(1, "SCG/STD_03_20"),
				() => this.s("유미", "안녕히 주무세여…."),
				() => this.s("나", "…?"),

				() => this.t("한참이나 넋두리를 풀어놓던 유미는 마지막 남은 맥주를 한입에 털어 넣더니 그 말을 끝으로 꿈나라로 떠났다."),
				() => this.t("고개를 탁자에 처박은 채로 말이다."),
				() => this.t("시간은 이미 아침을 향해가고 있었다."),
				() => this.t("그녀를 침대로 옮겨준 나는 소파 위에 누워서 천천히 눈을 감았다."),
				() => this.t("상부에게 속았다는 것을 알았을 때 느꼈던 강렬한 분노도 어느덧 사그라졌다."),
				() => this.t("어쩌면 이것이 잘된 일일지도 모르겠다는 생각마저 들었다."),
				() => this.t("적어도 무인도나 다름없는 곳에 갇힌 이 소녀에게는 나의 불행이 오히려 구원일지도 모르는 일이었다."),
			]),

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
