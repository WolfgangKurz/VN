import Game from "..";

import Sprite from "@/core/Sprite";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

// import NextScript from "./Ch4Part3";
import NextScript from "./Ch4Part1";

export default class GameCh4Part2 extends GameScript {
	public readonly scriptName: string = "Ch4Part2";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Battle_04",
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

			() => this.s("나", "대체 언제 오는 거야…."),

			() => this.t("유미가 말했던 관제탑까지는 왕복으로 길어봤자 1시간밖에 걸리지 않는다."),
			() => this.t("그러나 시계의 시침은 어느덧 2칸이나 움직였고, 이제는 3칸을 향해가고 있었다."),
			() => this.t("폭풍우의 영향인지 램파트를 호출하는 리모컨도 말을 듣지 않았다."),
			() => this.t("유미는 간단한 공구 몇 개만을 챙겨 나갔었다."),
			() => this.t("수리에 시간을 쓰고 있는 걸까…."),
			() => this.t("조금 인내심을 가지고 기다려보기로 했다."),

			() => this.s("나", "… 역시 가봐야겠어."),

			() => this.t("초조하게 방안을 이리저리 서성이며 기다려도 유미는 올 기미가 없어 보였다."),
			() => this.t("유미가 나간 지 벌써 4시간이 넘었다."),
			() => this.t("한 시간 전 즈음에 쏟아지기 시작한 소나기는 이제 장대비가 되어 내렸다."),
			() => this.t("이건 명백한 사고다."),
			() => this.t("유미가 위험에 빠진 것이 틀림없다."),
			() => this.t("판단을 마친 나는 옷걸이에 걸린 우비를 챙겨 입었다."),
			() => this.t("바람에 강한 데다 숲이 우거진 탓에 우산은 의미가 없다."),
			() => this.t("비상용 손전등까지 뽑아 주머니에 넣은 나는 서둘러 현관으로 나갔다."),
			() => this.close(),

			async () => {
				this.lock();

				await new Promise<void>(async resolve => {
					for (let i = 0; i < 4; i++) { // 4번
						this.shake(20, 15);

						AudioManager.playSE({
							name: "4-3_Boom!",
							volume: 100,
						});
						await this.wait(0.25);
					}

					resolve();
				});

				this.unlock();
			},

			() => this.s("나", "왜 이렇게… 안 열려…!"),

			() => this.t("온 힘을 다해 밀어도 문은 꿈쩍도 하지 않았다."),
			() => this.t("이대로 아무것도 못 하고 유미를 방치할 수는 없다."),
			() => this.close(),

			async () => {
				this.lock();

				AudioManager.playSE({
					name: "4-4_Kaboom!",
					volume: 100,
				});
				await this.wait(0.5);

				this.unlock();
			},

			() => this.t("바람이 잠깐 약해진 틈을 타 전력으로 문에 몸을 던지자 마치 풍선이 터지는 것 같은 경쾌한 소음과 함께 밖으로 나갈 수 있었다."),
			() => this.t("몸이 나가자마자 거세게 불어닥친 바람에 밀린 문이 엄청난 소리를 내며 쾅 닫혔다."),
			() => this.close(),

			// 폭풍우 치는 숲

			() => {
				this.lock();
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(60); // 1초 fadeout
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeOut(0);

					this.bg(null);
					this.unlock();
				});
			},
			() => this.shake(5, -1), // duration == -1 -> infinity
			() => AudioManager.playSE({
				name: "4-5_Heavy_rain",
				volume: 100,
				loop: true,
			}),
			() => {
				this.lock();

				this.bg("10_Forest_night", async bg => {
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

			() => this.t("한 고비 넘겼나 싶었으나 문을 연 것은 겨우 첫 번째 고비에 불과했다."),
			() => this.t("이리저리 몰아치는 강풍에 몸을 일으키기조차 힘든 지경이었다."),
			() => this.t("바람을 따라 힘없이 날아가 벽이나 나무에 사정없이 부딪혔다."),
			() => this.t("머리를 보호한 덕분에 중상은 면했지만, 여기저기 부딪힌 몸은 몇 걸음 떼기도 전에 이미 걸레짝이 되어 버렸다."),

			() => this.t("그 추태를 비웃기라도 하듯, 빗방울이 온몸을 구타했다."),
			() => this.t("거센 바람에 흩날리는 비는 그 자체로 흉기나 다름이 없었다."),
			() => this.t("비가 기관총의 탄환처럼 전신을 때릴 때마다 몸이 휘청였다."),
			() => this.t("나무를 잡고 겨우 몸을 일으킨 나는 숲속으로 들어가 겨우 태풍의 폭거에서 벗어날 수 있었다."),
			() => this.t("그렇게나 위험한 상황에도 떠오르는 것은 단 한 가지 뿐이었다."),

			() => this.s("나", "유미…!"),

			() => this.t("나보다도 몸이 가벼운 유미가 이런 강풍에서 무사할 것이라는 생각은 들지 않았다."),
			() => this.t("아무리 힘이 강하다고 한들, 자연의 힘 앞에서는 모두가 평등할 뿐이니까."),
			() => this.t("세게 부딪힌 탓에 아려오는 어깨를 부여잡고 계속 발걸음을 옮겼다."),
			() => this.t("2시간쯤 지났을 때 고민하지 말고 나갔어야 했다."),
			() => this.t("아니, 3시간이 지났을 때라도 눈치채고 나갔어야 했다."),

			() => this.s("나", "이 멍청이...!"),

			() => this.t("이미 늦었다면…?"),
			() => this.t("너무 늦게 출발했다면…?"),
			() => this.t("유미가 이미 돌아올 수 없는 강을 건넜다면…?"),
			() => this.t("비관에 빠져 허우적거리는 내 앞에 유미의 환상이 나타났다."),
			() => this.close(),

			() => this.shake(0, 0), // 흔들림 제거

			() => this.scg(1, "STD_02_26"),
			() => this.s("유미", "관리자님도 참, 말이 씨가 된다고요."),
			() => this.s("유미", "재수 없는 말씀은 그쯤 해두세요."),
			() => this.close(),
			() => this.scg(1, null),

			() => this.t("그래, 비관하지 말자."),
			() => this.t("유미는 분명 무사할 것이다."),
			() => this.t("스멀스멀 고개를 내미는 불안감의 목덜미를 잡아 진창에 처박고 그녀가 무사하기만을 빌었다."),
			() => this.t("비를 맞은 땅은 진흙이 되어 발을 붙잡고, 여기저기 쓰러진 나무가 길을 막았다."),
			() => this.t("자연의 경고를 무시한 대가를 치르는 것일까."),
			() => this.t("길이 험한 탓에 평소보다 두 배는 많은 시간이 소요됐다."),
			() => this.t("관제탑 근처에 도착했을 즈음에는 눈앞을 가득 메운 비와 어둠 때문에 거의 아무것도 보이지 않았다."),
			() => this.t("완전한 암흑에 둘러싸인 숲속을 용케 헤쳐 나갔다."),

			() => this.t("손전등의 작은 빛줄기 하나에 의지해 발걸음을 옮겼다."),
			() => this.t("이 절망적인 상황에도 앞을 비춰주는 이 보잘것없는 빛은 내게 용기를 불어넣어 주었다."),
			() => this.t("스스로 생각해도 놀랄 정도로 무모하고 과감한 행동이었다."),
			() => this.t("이 모든 것을 가능하게 해준 것은 전적으로 작은 손전등의 힘이었다."),
			() => this.t("이토록 암울한 상황에서도 해낼 수 있을 거라는 희망이 솟았다."),

			() => this.s("나", "유미! 유미! 어딨어!"),

			() => this.t("번개에 타 그을린 통신기는 아슬아슬하게 수리되어 재가동하고 있었다."),
			() => this.t("관제탑 구석구석을 뒤지며 애타게 불러도 돌아오는 답은 없었다."),
			() => this.t("여기에 없다면 숲속이다."),
			() => this.t("하지만 그 드넓은 숲에서 어떻게 유미를 찾는다는 말인가…."),
			() => this.t("건물 안에 풀썩 주저앉아 절망에 빠진 내 머릿속에 순간 한 장소가 떠올랐다."),

			() => this.s("나", "무너진 창고…!"),

			() => this.t("이곳으로부터 30분 정도의 거리밖에 되지 않는 곳이다."),
			() => this.t("게다가 유용한 장비나 비상식량이 있어 조난을 한 사람들이 자주 찾는 장소라고 했었다."),
			() => this.t("비록 산사태에 밀려온 토사에 부딪혀 반파되기는 했으나 쏟아지는 비 정도는 막아줄 수 있는 수준이었다."),
			() => this.t("만약 유미가 정말 잘못된 것이 아니라면, 분명 그곳에서 도움을 기다리고 있을 것이다."),
			() => this.t("생각을 마칠 새도 없이 자리를 박차고 미친 듯이 달렸다."),
			() => this.close(),

			() => this.shake(5, -1), // duration == -1 -> infinity
			() => AudioManager.playBGM({
				name: "Drinking",
				volume: 100,
			}),
			() => AudioManager.playSE({
				name: "4-6_Squishy",
				volume: 100,
				loop: true,
			}),

			() => this.t("발목을 잡는 진창도, 눈 앞을 가리는 폭우도 앞길을 막을 수는 없었다."),
			() => this.t("쓰러진 나무와 땅 위로 드러난 뿌리에 걸려 몇 번을 넘어져도 아프지 않았다."),
			() => this.t("바닥에 뒹굴고 절뚝거리면서도 계속해서 앞으로 나아갔다."),
			() => this.t("몸이 상하는 것보다도 유미의 안위가 몇 제곱은 걱정되었다."),
			() => this.close(),

			() => AudioManager.stopSE(),

			() => this.s("나", "제발 무사해 줘…."),

			() => this.t("그저 한없이 빌었다."),
			() => this.t("존재하는지도 알 수 없는 신이라도, 내 목소리를 들어줄 그 누구라도 좋았다."),
			() => this.t("아직 늦지 않았기를, 번뇌처럼 스친 예상이 들어 맞기를 바랄 뿐이었다."),
			() => this.t("이것이 내가 태어나서 처음으로 빈 소원이었다."),

			() => this.t("딱 한 번만, 단 한 번이라도 좋으니 그녀에게 제 진심을 전하게 해주세요."),
			() => this.t("다시는, 다시는 혼자 두지 않을 테니까 그녀를 다시 한 번 품에 안게 해주세요."),
			() => this.t("다가오는 차가운 현실에도 이어진 운명의 실이 끊어지지 않게 해주세요."),

			() => this.t("조금씩 숲이 걷히고 이내 창고가 저 멀리 보이기 시작했다."),
			() => this.t("나는 광기에 찬 이교도처럼 맹목적으로 그것을 향해 달렸다."),
			() => this.t("문이 굳건히 닫힌 채로 우두커니 서 있는 창고."),
			() => this.t("창고 바로 앞까지 왔을 때 나는 이미 제정신이 아니었다."),

			() => AudioManager.playSE({
				name: "4-3_Boom!",
				volume: 100,
			}),
			() => this.t("문을 부술 기세로 열고 들어가자…"),
			() => this.close(),

			() => this.shake(0, 0),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_11.jpg", async (pic, sprite) => {
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

			() => this.s("나", "유미!"),
			() => this.s("유미", "ㄱ, 관리자님!? 여긴 어떻ㄱ…."),

			() => this.t("유미는 창고 구석에 등을 기댄 채로 두려움에 빠진 표정으로 앉아 있었다."),
			() => this.t("안광을 부라리는 나를 보고 화들짝 놀라 무어라 말하려던 유미였으나 다짜고짜 달려가 그 연약한 몸을 품에 안자 말을 잇지 못했다."),

			() => {
				this.lock();
				this.bg("16_garage_off", async bg => {
					if (!bg) return this.unlock();
					bg.startFadeIn(0);
					this.unlock();
				});
			},
			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1001, async (pic) => {
						if (!pic) return resolve();

						pic.startFadeOut(this.isReady ? 60 : 0);
						while (pic.isFading())
							await this.wait(0);

						this.picture(1001, null);
						resolve();
					});
				}).then(() => this.unlock());
			},

			() => this.s("나", "괜찮아? 다친 곳은 없고?"),
			() => this.close(),

			() => this.scg(1, "STD_04_3"),
			() => this.s("유미", "바보… 나오지 말라니까…."),
			() => this.s("나", "난 괜찮으니까 걱정하지 마."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_27"),
			() => this.s("유미", "괜찮기는 뭐가 괜찮아요!"),
			() => this.s("유미", "얼굴에 피 나고 있잖아…."),
			() => this.s("나", "나뭇가지에 스친 거야."),
			() => this.s("나", "너야말로 다친 곳은 없어?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_24"),
			() => this.s("유미", "대체 왜 이러는 거야…."),
			() => this.s("유미", "나 같은 게 뭐가 중요하다고…."),
			() => this.s("나", "미안해. 더 일찍 왔어야 했는데…."),
			() => this.close(),

			() => {
				this.lock();
				new Promise<void>(async resolve => {
					this.shake(20, 90);

					while (this.isShaking)
						await this.wait(0);

					resolve();
				}).then(() => this.unlock());
			},

			() => this.scg(1, "SCG/STD_04_27"),
			() => this.s("유미", "그 말이 아니잖아요!"),
			() => this.s("유미", "관리자님까지 다치면 제 마음이 어떨지는 생각이나 해봤어요?"),
			() => this.s("유미", "이러다가 둘 다 죽으면 그때는 어쩔 건데!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
			() => this.s("유미", "저는 바이오로이드잖아요."),
			() => this.s("유미", "관리자님은 인간이라고요."),
			() => this.s("유미", "저는 다시 만들 수 있는 공산품이지만, 관리자님은 인간이라는 말이에요."),
			() => this.s("유미", "죽으면 그걸로 끝이라고요!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_24"),
			() => this.s("유미", "소중한 사람이 나 때문에 다치면 얼마나 아플지는… 관리자님이 가장 잘 아실 거 아니에요…."),

			() => this.t("공산품… 공산품…"),
			() => this.t("넌 바이오로이드, 난 인간."),
			() => this.t("대체 그것이 뭐가 중요하다는 것인가."),
			() => this.t("누군가는 날 ‘병신’이라고 욕할지도 모르지."),
			() => this.t("영혼이 없는 인형을 사랑하는 머저리라고 매도할지도 몰라."),
			() => this.t("그러나 그것이 우리의 관계를 부정할 수는 없어."),

			() => this.t("선민의식에 찌든 기만자라고 해도, 권력 앞에 무릎 꿇은 나약한 인간이라고 해도 좋아."),
			() => this.t("진작에 알고 있었으면서도 나 스스로 부정하고 있었다."),
			() => this.t("이제는 알 수 있다."),
			() => this.t("이제는 말할 수 있다."),
			() => this.t("마침내 깨달았다."),
			() => this.t("나는… 나는..."),

			() => this.s("나", "… 다시 만들어진 유미는 네가 아니잖아."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
			() => this.s("유미", "네...?"),
			() => this.s("나", "다시 만들어진 유미에게는 너의 기억이 없잖아."),
			() => this.s("나", "겉만 같다고 다 같은 사람인 줄 알아?"),
			() => this.s("나", "내가 네 외모만 보고 아끼는 거라고 생각했어?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_27"),
			() => this.s("유미", "도구 따위에게 정 쓰지 마세요!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
			() => this.s("유미", "관리자님은 절 동정하고 연민할 뿐이잖아요."),
			() => this.s("유미", "제가 아니라 다른 유미였어도, 관리자님은 똑같이 대해주셨겠죠."),
			() => this.s("유미", "제게 잘 대해주셔봤자 그 사실이 변하지 않는 한, 상처만 늘어갈 뿐이라고요."),
			() => this.s("유미", "관리자님도 잘 아시잖아요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_24"),
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

			() => this.s("유미", "이런 관계는 서로에게 고통스러울 뿐이에요."),
			() => this.s("유미", "차라리 여기서 죽는 게 나았어요."),
			() => this.s("유미", "그 편이 관리자님에게도... 저에게도… 더…."),

			() => this.t("어절 하나하나가 비수처럼 날아와 꽂혔다."),
			() => this.t("부정할 생각은 없다."),
			() => this.t("그러나..."),

			() => this.s("나", "네가 잘못 알고 있는 게 있어."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_24"),
			() => this.s("유미", "위로하실 필요 없어요."),
			() => this.s("유미", "그게 현실인 걸요."),
			() => this.s("나", "난 ‘너’가 좋은 거야."),
			() => this.s("나", "바이오로이드 커넥터 유미가 아니라."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_27"),
			() => this.s("유미", "그래도…!"),
			() => this.s("나", "내 말 아직 안 끝났어."),
			() => this.s("나", "그래, 소중한 사람이 나 때문에 죽거나 다치면 고통스럽지."),
			() => this.s("나", "온몸이 찢어지는 것처럼 아프지."),
			() => this.s("나", "그런데, 그걸 막을 수 있으면서도 아무것도 안 했다면?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
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

			() => this.s("유미", "…!"),
			() => this.s("나", "충분히 살릴 수 있었는데 아무것도 하지 못한 사람의 심정이 얼마나 비참할지 네가 알기나 해…?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
			() => this.s("유미", "아…."),
			() => this.s("나", "… 미안해."),
			() => this.s("나", "너무 늦게 와서 미안해…."),

			() => this.t("내 진심에 마음이 동한 걸까."),
			() => this.t("긴장이 풀린 유미는 이내 울음을 터뜨렸다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_5"),
			() => this.s("유미", "흐윽… 흐아아... 무서웠어요…"),
			() => this.s("유미", "이대로 죽을까 봐…"),
			() => this.s("유미", "관리자님을 영영 못 보게 될까 봐…"),
			() => this.s("유미", "너무 무서웠어요…"),

			() => this.t("유미 역시 같은 고민을 품고 있던 모양이었다."),
			() => this.t("내가 자신을 그저 연민하는 것이 아닐까, 하는 번뇌로 방황하고 있었겠지."),
			() => this.t("그러나 이젠 괜찮다."),
			() => this.t("이 감정에 솔직해지기로 했다."),
			() => this.t("나는 유미를… 사랑하고 있었다."),

			() => this.s("나", "괜찮아. 나 여기 있어. 이제 괜찮아."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),

			() => this.t("유미를 달래주느라 잊고 있었지만, 창고에는 점점 물이 차오르고 있었다."),
			() => this.t("만약 구하러 오지 않았더라면... 생각하기도 싫은 결말이다."),
			() => this.close(),

			() => {
				AudioManager.playBGM({
					name: "Nervous 1",
					volume: 100,
				});
				AudioManager.fadeInBGM(1.5);
			},

			() => this.s("나", "걸을 수 있어?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_23"),
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

			() => this.s("유미", "하윽… 죄송해요…."),

			() => this.t("조금만 힘이 들어갔을 뿐인데 유미는 가쁜 숨을 내뱉었다."),
			() => this.t("이미 그녀의 다리는 성한 곳이 없었다."),
			() => this.t("정강이가 세로로 찢어져 뜨끈한 피가 여전히 줄줄 흐르고 있었다."),
			() => this.t("나는 후들거리는 다리로 유미를 등에 업었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_23"),
			() => this.s("유미", "안 돼요…!"),
			() => this.s("유미", "이러면 우리 둘 다 죽어요!"),
			() => this.s("나", "죽긴 누가 죽어."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_14"),
			() => this.s("유미", "바보. 맨날 제멋대로야…."),
			() => this.s("나", "상관없어. 너만 있으면 돼."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "…."),

			() => this.t("빗물이 벌써 발목까지 차올랐다."),
			() => this.t("이제는 정말 지체할 시간이 없다."),
			() => this.close(),

			() => {
				this.lock();
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(60); // 1초 fadeout
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeOut(0);

					this.bg(null);
					this.unlock();
				});
			},
			() => this.shake(5, -1), // duration == -1 -> infinity
			() => AudioManager.playSE({
				name: "4-5_Heavy_rain",
				volume: 100,
				loop: true,
			}),
			() => {
				this.lock();

				this.bg("10_Forest_night", async bg => {
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

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "안 무거워요…?"),
			() => this.s("나", "가볍기만 하네."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "이런 상황에 아부가 나와요?"),
			() => this.s("나", "진짜로."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "…."),

			() => this.t("말은 그렇게 해도, 혼자서도 버거운 공기의 저항을 뚫고 30kg이 넘는 짐을 진 채 걷는 것이 마냥 쉬운 일은 아니었다."),
			() => this.t("그러나 내가 넘어지면 유미까지 덩달아 크게 다치게 된다."),
			() => this.t("멍든 다리가 시리고 어깨가 비명을 질러대도 멈출 수는 없었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_27"),
			() => this.s("유미", "저는 버리고 먼저 가요, 제발."),
			() => this.s("유미", "이러다 관리자님 죽겠어요!"),
			() => this.s("나", "…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
			() => this.s("유미", "제발…."),

			() => this.t("온몸이 고통에 덜덜 떨리는 것으로 모자라 얼어붙을 듯이 추웠다."),
			() => this.t("우비는 진작에 찢어져 어디론가 사라져버렸으므로 우리는 그 비를 몸으로 맞으며 10도 안팎을 넘나드는 추위와 싸워야 했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_6"),
			() => this.s("유미", "관리자님…."),

			() => this.t("유미의 호흡도 가늘게 떨리고 있었다."),
			() => this.t("불안정하고 거칠어진 숨이 목덜미에서 흩어졌다."),

			() => this.s("나", "잠들면 안 돼!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_25"),
			() => this.s("유미", "…."),
			() => this.s("나", "정신 차려!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_8"),
			() => this.s("유미", "헉…!"),

			() => this.t("유미가 추위에 부들부들 떠는 것이 고스란히 등에 느껴졌다."),
			() => this.t("어쩌면 정말 여기서 죽을지도 모르겠다는 생각이 불현듯 스쳤다."),
			() => this.t("단순한 비관이 아니라, 더는 다리에 힘이 들어가지 않았다."),
			() => this.t("초인적인 힘으로 발걸음을 내딛고는 있지만, 아직도 기지국까지는 한참이다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_22"),
			() => this.s("유미", "ㄱ, 관리자님…! 앞에! 앞에!"),
			() => this.s("나", "아…."),

			() => this.t("긴박한 외침에 고개를 드니 거대한 나뭇가지가 우리 머리 위로 떨어지고 있었다."),
			() => this.t("피할 방도도 없다."),
			() => this.t("이렇게 허무하게 죽는구나…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_8"),
			() => this.s("유미", "… 어?"),
			() => this.s("나", "넌…!"),
			() => this.close(),

			() => this.shake(0, 0),

			() => {
				this.lock();

				AudioManager.playSE({
					name: "4-8_Broken_tree",
					volume: 100,
				});
				this.picture(1001, "CUT/cut_12.jpg", async (pic, sprite) => {
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

			() => this.t("주마등이 스쳐 가기도 전에 머리 위에서 나뭇가지가 부딪혀 박살 났다."),

			() => this.s("램파트", "생명 신호를 감지하고 긴급히 달려왔습니다."),
			() => this.s("램파트", "이제는 안전하니 침착하게 제 지시에 따라주십시오."),

			() => this.t("램파트의 거대한 방패가 우릴 지켜주었다."),
			() => this.t("유미를 램파트에게 맡기자 한결 걸음이 수월해졌다."),
			() => this.t("그가 건넨 우비를 입고 방패 뒤에 숨어 이동하니 바람의 세기도 비교적 약하게 다가왔다."),

			() => this.t("그로부터 20분이나 더 걸었을까?"),
			() => this.t("우리는 그제야 기지국까지 다다를 수 있었다."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1001, async (pic) => {
						if (!pic) return resolve();

						pic.startFadeOut(this.isReady ? 60 : 0);
						while (pic.isFading())
							await this.wait(0);

						this.picture(1001, null);
						resolve();
					});
				}).then(() => this.unlock());
			},

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

			// () => this.load(new NextScript()),
		]);
	}
}
