import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch3Part1";

export default class GameCh2Part5 extends GameScript {
	public readonly scriptName: string = "Ch2Part5";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playSE({
				name: "2-6_Clatter",
				volume: 100,
			}),

			() => this.s("유미", "관리자님, 아까부터 뭐하시는 거에요?"),
			() => this.s("나", "…."),
			() => this.s("유미", "관리자님~?"),
			() => this.s("나", "어!?"),
			() => this.s("유미", "뜬금없이 웬 청소도구들을 사 오시지를 않나, 오자마자 세제 물을 만드시지를 않나."),
			() => this.s("유미", "대체 이런 걸로 뭘 하시려고…."),
			() => this.s("나", "잠자는 기지국을 깨우려고."),
			() => this.s("유미", "네…?"),
			() => this.close(),

			() => AudioManager.stopSE(),

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

			() => this.t("다음 날, 마침내 아침이 밝았다."),
			() => this.t("어젯밤의 성과를 보여 줄 시간이 왔다."),
			() => this.t("세월의 풍파로 잠들어 버린 기지국을 다시 깨울 때이다."),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Starlight",
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

			() => this.s("나", "일어나!!!!!"),

			() => this.scg(1, "SCG/STD_03_22"),
			() => this.s("유미", "히이이익!?"),

			() => this.t("내 힘찬 고함에 방 전체가 흔들렸다."),
			() => this.t("세상 모르게 잠들었던 유미는 해괴망측한 비명을 지르며 벌떡 일어났다."),

			() => this.scg(1, "SCG/STD_03_19"),
			() => this.s("유미", "왜 아침부터 소리를 지르고 그래요?"),
			() => this.s("유미", "하으… 잘 자고 있었는데…"),

			() => this.t("아직 비몽사몽 한 유미를 말없이 끌고 나갔다."),
			() => this.t("유미는 막연한 공포 반, 기대 반이 섞인 표정으로 터덜터덜 따라왔다."),

			() => this.scg(1, "SCG/STD_03_19"),
			() => this.s("유미", "진짜 무슨 사고라도 치신 거 아니죠?"),
			() => this.s("유미", "그랬다가는 저까지 잘릴지도 모른다고요…."),

			() => this.t("단잠을 방해받은 유미가 핀잔했지만, 그런 것이 귀에 들어올 리가 없었다."),
			() => this.t("무슨 말을 듣든 바보처럼 웃기만 하면서 기지국 바깥으로 유미를 끌고 나왔다."),

			() => this.s("나", "어때?"),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "이게 무슨…."),

			() => this.t("유미는 잠을 깨자마자 눈 앞에 펼쳐진 기묘한 풍경에 말하는 법을 잊고 말았다."),
			() => this.t("아주 만족스러운 반응이다."),

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
			() => {
				this.lock();

				this.bg("8_radar(Clean day time)", async bg => {
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

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "이거… 설마 관리자님이 혼자 하신 거예요?"),

			() => this.t("고개를 끄덕이자 유미는 입을 떡 벌리고 경악했다."),
			() => this.t("아침햇살을 받아 반짝이는 기지국의 표면은 완전히 새것처럼 잡티 하나 없이 깨끗했다."),
			() => this.t("외벽을 타고 오르던 덩굴도, 틈새 사이사이 끼어 있던 이끼와 녹도 전부 사라져 금속 특유의 은빛 광택을 되찾았다."),
			() => this.t("역전승의 신화와 같은 카타르시스를 느끼며 뒤를 돌아보자 울먹거리는 유미가 있었다."),

			() => this.scg(1, "SCG/STD_03_6"),
			() => this.s("유미", "시키지도 않은 일이나 하시고…."),
			() => this.s("유미", "잠도 못 주무셨을 텐데 왜 그러셨어요?"),

			() => this.t("엄지손가락을 치켜들며 얼간이처럼 싱긋 웃자 유미도 어이가 없다는 듯이 미소 지었다."),

			() => this.scg(1, "SCG/STD_03_15"),
			() => this.s("유미", "정말 관리자님 같은 인간님은 처음 봐요."),
			() => this.s("유미", "도저히 종잡을 수가 없잖아요."),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "그것보다, 어디 다치신 곳은 없어요?"),
			() => this.s("유미", "높아서 위험했을 텐데…."),

			() => this.t("오랜만에 몸을 써서 근육통이 몰려왔을 뿐, 다행히 별다른 부상은 없었다."),
			() => this.t("그마저도 환골탈태한 기지국의 모습을 보고 있자니 잊을 수 있었다."),

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "정말 여러 가지 의미로 대단하신 분이네요."),
			() => this.s("유미", "청소도구를 이런 곳에 쓰려고 사신 거였어요?"),
			() => this.s("나", "좋지 않아? 몇십 년 동안 묵은 때라서 엄청 더럽던데."),

			() => this.scg(1, "SCG/STD_03_15"),
			() => this.s("유미", "제가 좋은 게 문제가 아니잖아요."),
			() => this.s("유미", "한낱 사무직 바이오로이드한테 왜 그렇게 잘해주시는지…."),

			() => this.t("바이오로이드라고 인간과 다르다고 생각하지는 않는다."),
			() => this.t("또 모르지. 언젠가 인간은 다 죽고 바이오로이드만 남게 될지도."),
			() => this.t("그런 시대가 오면 외려 인간이 바이오로이드에게 의지해야 할지도 모른다."),

			() => this.scg(1, "SCG/STD_03_12"),
			() => this.s("유미", "… 어쨌든 감사해요, 관리자님."),
			() => this.s("유미", "어쩐지 후련하기도 하고 시원섭섭하기도 하네요."),
			() => this.s("유미", "지난 세월의 흔적이 전부 사라져 버렸으니."),
			() => this.s("유미", "얼른 들어가서 쉬세요. 밥은 제가 차릴게요."),
			() => this.s("유미", "… 그래봤자 인스턴트지만요."),
			() => this.s("나", "응? 아직 못 쉬는데?"),

			() => this.t("시간이 없어서 미처 끝내지 못했지만, 아직 남은 과제가 하나 더 있다."),
			() => this.t("그 과제는 유미의 손으로 직접 끝내는 것이 더 좋겠지."),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "아저씨요…?"),

			() => this.t("지난 30년의 풍파를 담고 있는 것은 기지국뿐만이 아니었다."),
			() => this.t("분명히 알 수 있었다."),
			() => this.t("유미의 낯에 스민 그림자의 정체에 대하여 말이다."),
			() => this.t("차갑게 드리운 그 그늘은 필시 과거의 나와 닮아 있었다."),

			() => this.t("그렇기에 경비 로봇 램파트의 몸을 감싼 녹과 넝마 역시도 그림자의 산물임을 금방 눈치챌 수 있었다."),
			() => this.t("외롭게 방치된 상황 속에서 느낀 무기력함이 기지국과 램파트의 방치로 이어졌던 거겠지."),

			() => this.t("굳이 하지 않아도 될 청소를 먼저 나서서 한 것은 물론 보기 흉한 까닭도 있었지만, 무엇보다 큰 이유는 유미가 어두웠던 과거를 잊고 앞만 보기를 바라서였다."),
			() => this.t("그 첫걸음의 마무리는 바로 램파트의 청소가 될 거다."),
			() => this.t("즉흥적인 행동 없이는 아무것도 바꾸지 못한다."),
			() => this.t("그것이 심적인 변화를 위한 것이라면 더더욱."),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "… 진짜 특이한 분이셔."),
			() => this.s("유미", "알겠어요. 옷 금방 갈아입고 올게요."),

			() => this.scg(1, "SCG/STD_03_19"),
			() => this.s("유미", "지금 얼어 죽을 것 같거든요…."),
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

			() => this.t("맞다, 지금 가을이었지."),
			() => this.t("나 역시 내복만 입었음을 자각하자 몸이 으슬으슬 떨렸다."),
			() => this.t("활동복으로 갈아입은 우리는 기지국 앞의 마당으로 램파트를 호출했다."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_04_1", async (pic, sprite) => {
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
			() => this.s("램파트", "안녕하십니까, 관리자님."),
			() => this.s("램파트", "호출받고 도착했습니다."),

			() => this.t("경위를 설명하자 램파트는 금방 이해하고 무장을 해제했다."),

			() => this.s("램파트", "본 기체는 오메가 산업의 방수 기능을 사용하여 태풍, 폭우 등의 악천후에서도 활동할 수 있으며 위생 관리가 간편합니다. 또한…"),

			() => this.t("자회사의 기술력을 광고하는 목소리를 애써 무시하고 청소를 시작했다."),
			() => this.t("덕지덕지 달라붙은 먼지와 덩굴을 자르거나 떼어내고 작은 받침대를 타고 올라가 머리 위에서 물을 끼얹었다."),
			() => this.t("간단한 작업은 끝났고, 이번에는 솔로 구석구석을 닦아줄 차례였다."),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "제가 아래를 맡을 테니까, 관리자님이 머리 쪽을 맡아주세요."),

			() => this.t("언제 챙겼는지 고무장갑까지 낀 유미의 제안대로 그녀가 다리를, 내가 그 위를 맡았다."),

			() => this.s("나", "장갑 끼면 땀 찰 텐데 괜찮아?"),
			() => this.s("나", "차라리 소매를 걷ㄱ..."),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "맨손으로 하면 손 시릴 것 같아서요."),

			() => this.t("확실히, 20도 안팎을 맴도는 날씨이니 물에 젖으면 추울 법도 했다."),
			() => this.t("말을 의도적으로 끊는 것이 미심쩍었지만, 아무렇지도 않게 걸레를 물에 적시는 모습을 보자 금방 잊혔다."),

			() => this.t("수세미로 표면을 문질러대니 시커먼 때와 눌어붙은 이끼가 그대로 밀렸다."),
			() => this.t("그중에서도 오래된 것은 잘 떼어지지도 않아 락스를 끼얹고 한참이나 문질러서야 겨우 깔끔해졌다."),

			() => this.t("팔이 빠질 것처럼 힘들었지만, 그렇다고 묵묵히 할 일만 하는 것은 도저히 성미에 맞지 않는다."),
			() => this.t("벗겨진 때를 쓸어내기 위해 호스로 물을 뿌리다 장난기가 발동한 나는 그 끝을 손가락으로 살짝 잡아서..."),

			() => this.scg(1, "SCG/STD_04_7"),
			() => this.s("유미", "꺅! 관리자님, 물 튀잖아요!"),
			() => this.s("나", "한 번 더 받아라!"),

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
			() => this.s("유미", "아, 진짜! 잡히면 배로 갚아줄 거야!"),

			() => this.t("유미는 전에 없이 즐거운 표정으로 청소를 도왔다."),
			() => this.t("원래의 색을 되찾아가는 램파트를 보고 있자니 내 마음이 다 후련해졌다."),
			() => this.t("이걸로 유미의 가슴 속에 담긴 잡념과 고독까지 전부 쓸려 내려가기를 빌었다."),

			() => this.t("청소가 끝난 시점에서는 우리 모두 홀딱 젖어버렸으나 한창 물장난에 맛을 들인 아이들처럼 마냥 즐겁기만 했다."),
			() => this.t("잠시 휴전 협정을 맺고 서로의 몰골을 확인한 우리는 그만 폭소하고 말았다."),

			() => this.t("얼마 만인지 모를 순수하게 즐거웠던 시간이 지나고, 풍성한 거품에 둘러싸인 램파트에게 시원하게 물을 끼얹는 것으로써 기나긴 목욕은 마무리되었다."),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_08.jpg", async (pic, sprite) => {
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

			() => this.s("유미", "우와…."),

			() => this.t("얼마나 빡빡 문질렀는지 하얗고 파란 강철 몸체가 광택마저 뿜었다."),
			() => this.t("비록 도색이 조금 벗겨지기는 했지만, 숲의 흔적에 둘러싸여 거의 녹색이나 다름없던 전에 비하면 비약적인 발전이었다."),
			() => this.t("유미는 어딘지 개운한 표정으로 서서 램파트의 손을 잡았다."),

			() => this.s("유미", "진작에 해드릴걸."),
			() => this.s("유미", "이렇게 멋진 로봇이었구나…."),

			() => this.t("깔끔해진 램파트의 곳곳을 손으로 더듬으며 감탄하던 유미는 어느덧 우수에 고인 눈으로 생글거리고 있었다."),
			() => this.t("그렇게 웃으며 이걸로 몇 번째인지도 모를 감사를 전하였다."),
			() => this.t("내심 수많은 고민 끝에 준비한 서프라이즈가 예상보다 큰 효과를 보인 것 같았다."),

			() => this.s("유미", "헤헤, 어쩐지 후련하네요."),

			() => this.t("그동안 청소를 하지 않았던 이유를, 굳이 묻지 않더라도 알 수 있을 것 같았다."),
			() => this.t("그만큼 유미는 이상하리만치 나와 닮아 있었다."),
			() => this.t("폐인처럼 방안에 처박혀 온갖 쓰레기를 집안에 쌓아두었던 나날…"),
			() => this.t("이미 이런 상황을 극복한 적이 있었기에 타개하는 방법 역시 잘 알고 있었다."),
			() => this.t("유미는 분명 회의를 느낀 것이리라."),
			() => this.t("앞으로 유미에게 필요한 것은 과거로부터의 탈피와 새로운 자극이었다."),

			() => this.t("꼭 구해주고 싶었다."),
			() => this.t("실의에 빠진 생명을 돕고 싶어지는 것은 당연한 본능이니까."),
			() => this.t("비록 그 대상이 바이오로이드일지라도, 그녀 역시 살아있는 생명이니까."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),
			() => this.scg(1, null),
			() => {
				this.lock();

				Promise.all([
					new Promise<void>(resolve => {
						this.picture(1001, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? 60 * 2 : 0);
							while (pic.isFading())
								await this.wait(0);

							this.picture(1001, null);
							resolve();
						});
					}),
					new Promise<void>(resolve => {
						this.bg(async bg => {
							if (!bg) return resolve();

							if (this.isReady) {
								bg.startFadeOut(60 * 2); // 2초 fadeout
								while (bg.isFading())
									await this.wait(0);
							} else
								bg.startFadeOut(0);

							this.bg(null);
							resolve();
						});
					}),
				]).then(() => this.unlock());
			},

			() => this.load(new NextScript()),
		]);
	}
}
