import Game from "..";

import Sprite from "@/core/Sprite";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch3Part2";

export default class GameCh3Part1 extends GameScript {
	public readonly scriptName: string = "Ch3Part1";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Talk_07",
				volume: 100,
			}),
			() => {
				this.lock();

				this.bg("14_yumi_room_lights_off", async bg => {
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

			() => this.scg(1, "SCG/STD_03_23"),
			() => this.s("유미", "하으윽…"),
			() => this.close(),

			() => this.t("손목을 타고 검붉은 피가 흘렀다."),
			() => this.t("쓰라린 통각에 숨을 헐떡이면서도 역설적으로 입꼬리는 올라가 있다."),
			() => this.t("날카롭게 벼린 칼날에도 핏방울이 맺혀 뚝뚝 떨어졌다."),
			() => this.t("새로운 흉터가 늘었다."),
			() => this.t("불이 꺼져 환풍기 소리만 외롭게 울리는 방안에서 유미는 울고 있었다."),
			() => this.t("눈물이 피와 섞여 비처럼 바닥을 적셨다."),
			() => this.t("이걸로 몇 번째인지도 몰랐다."),
			() => this.t("사무치는 외로움에서 벗어나기 위해 시작한 이 짓거리도 슬슬 질려갔다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "그냥 확 죽어버릴까…?"),
			() => this.close(),

			() => this.t("어둡고 칙칙한 반지하 방에서 유미는 그렇게 중얼거렸다."),
			() => this.t("환한 아침인데도 창문 하나 나지 않은 탓에 암막 안에 들어온 것처럼 어두웠다."),
			() => this.t("마지막으로 울린 것이 언제인지도 기억나지 않는 사이렌의 은은한 붉은 빛만이 깜빡거릴 뿐이었다."),
			() => this.t("그 연한 빛 때문에 이미 아문 흉터조차 갓 생긴 상처처럼 빨갛게 보였다."),
			() => this.close(),

			() => this.t("고통이 쾌감으로 변하는 모순의 편린 속에서 미치광이처럼 미소를 지었다."),
			() => this.t("입이 찢어질 정도로 귀에 걸려서 그 틈으로 체액이 줄줄 흘렀다."),
			() => this.t("그러나 이내 그마저도 관뒀다."),
			() => this.t("낡은 붕대로 대충 상처를 감싸고 다시 침대에 누웠다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "일… 해야 하는데…."),
			() => this.close(),

			() => this.t("인간의 명령은 절대적이지만, 해석할 여지는 있다."),
			() => this.t("기지국을 관리하라는 명령을 제멋대로 해석한 탓에, 통신의 기본적인 유지 이외에는 하는 일이 없다."),
			() => this.t("물론 처음부터 그랬던 것은 아니었다."),
			() => this.t("주마다 기지국의 외벽을 타고 올라오는 식물들을 쳐내고, 녹슨 부분이 있다면 아세톤으로 닦아내고, 기지국 앞마당에 자란 잡초를 베어내고…."),
			() => this.close(),

			() => this.t("이 비좁은 섬에 발령되고 첫 10년 정도는 보람을 느꼈다."),
			() => this.t("그러나 그것이 2번, 3번 정도 반복되자 더는 어떤 의미도 갖지 못하게 되었다."),
			() => this.t("사실상 방치된 섬이었기에 통신이 끊기지 않는 한, 감독이 들어오거나 상부에서 검사를 오는 일이 없었던 탓도 있었다."),
			() => this.t("기지국을 깨끗하게 유지하라는 명령은 없었기에 외벽의 청소를 관두었다."),
			() => this.t("램파트를 날마다 청소하라는 명령은 없었기에 가장 친한 친구인 아저씨의 목욕도 관두었다."),
			() => this.close(),

			() => this.t("단지 ‘귀찮아서’라는 말로 함축하기에는 많은 이해관계가 얽혀 있었다."),
			() => this.t("‘귀찮아서’ 끼니를 굶은 지도 일주일이 다 되어갔다."),
			() => this.t("더 굶었다가는 생명에 지장이 생긴다."),
			() => this.t("상부의 감시가 끊긴 와중에도 기특하게 할 일을 계속해주는 드론으로부터 받은 맥주 한 잔과 부식으로 나온 건빵 한 봉지를 억지로 욱여넣고는 다시 드러누웠다."),
			() => this.t("제대로 된 음식을 먹지 않아 내장이 뒤틀리듯이 아팠다."),
			() => this.t("피가 너무 많이 빠져나가 머리가 지끈거렸다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_19"),
			() => this.s("유미", "허억… 허억…"),
			() => this.close(),

			() => this.t("무슨 약이라도 먹지 않으면 정말 죽을 것만 같았다."),
			() => this.t("죽으려고 마음을 먹었다가도 막상 죽음의 위기가 닥치면 두려워지는 것은 왜일까."),
			() => this.t("침대에서 굴러떨어진 유미는 숨을 헐떡이며 약상자가 든 서랍까지 기어가기는 했으나 이윽고 그대로 정신을 잃고 말았다."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(0.5),
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

			() => this.t("이대로 죽는 건가, 하는 한탄 아닌 한탄을 하며 기절한 그녀가 다시 눈을 뜬 것은 하루 하고도 반나절이 지난 후의 밤이었다."),
			() => this.close(),

			() => {
				this.lock();

				this.bg("14_yumi_room_lights_off", async bg => {
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

			() => this.scg(1, "SCG/STD_03_23"),
			() => this.s("유미", "아악…! 하윽… 배가…."),
			() => this.close(),

			() => this.t("칼로 도려내는 듯한 통증에 번뜩 정신을 차렸다."),
			() => this.t("허겁지겁 진통제를 욱여넣고도 사라지지 않는 격통에 한바탕 바닥에서 나뒹굴고 나서야 겨우 이성을 찾은 유미는 한동안 씻지도 않아 방안을 가득 채운 체취와 텁텁한 기운을 내보내기 위해 문부터 열었다."),
			() => this.close(),

			() => {
				this.lock();

				AudioManager.playSE({
					name: "3-1 Door",
					volume: 100,
				});
				this.picture(1001, "CUT/cut_07-2.png", async (pic, sprite) => {
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
			() => {
				AudioManager.playBGM({
					name: "Moment",
					volume: 100,
				});
				AudioManager.fadeInBGM(1.5);
			},

			() => this.s("유미", "와아…."),

			() => this.t("어둡게 물든 밤인데도 세상은 또렷하게 밝았다."),
			() => this.t("그 광원을 찾기 위해 슬쩍 고개를 들며 아픈 것도 잊고 감탄했다."),
			() => this.t("넓게 걸린 오로라, 그것을 양분하는 은하수가 하늘을 네 갈래로 가르고 있었다."),

			() => this.s("유미", "마지막으로 하늘을 올려다본 게 언제였더라…."),

			() => this.t("최근에 이르러서는 바깥에 나온 적 자체도 드물었지만, 밤에 나온 것은 더욱 드물었고, 그중에 하늘을 본 것은 더더욱 드물었다."),
			() => this.t("오로라의 명소라고 해서 기대했건만, 막상 보이는 것은 새까만 하늘뿐이라 실망했던 기억을 떠올린 유미는 저도 모르게 실소를 뿜었다."),
			() => this.t("처음으로 보았던 오로라에 압도당했던 기억이 뒤이어 떠올랐다."),

			() => this.s("유미", "… 조금만 더 버텨보자."),
			() => this.s("유미", "일주일만, 일주일만 더 버텨보자."),

			() => this.t("어째서 갑자기 삶의 의지가 솟아났는지는 그녀 자신도 알 수 없었다."),
			() => this.t("외롭게 하늘을 밝혀주는 오로라가 자신의 처지와 비슷하게 느껴졌기 때문인가?"),
			() => this.t("아니면 그저 저 고독한 십자가로부터 작은 용기를 얻었던 것일지도 몰랐다."),
			() => this.t("유미는 문득 이 일을 계속했던 계기를 떠올렸다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "예전에는 보람이 있었는데."),

			() => this.t("그녀의 존재의의는 오지의 사람들에게 무선통신의 혜택을 누리게 해주는 것이었다."),
			() => this.t("서로 닿지 않아 안부조차 물을 수 없는 사람들이 마음을 전할 수 있도록 통신망을 유지하는 것이 자신의 사명이라고, 유미는 생각하고 있었다."),
			() => this.t("업무 대부분을 방치하면서도 무의식중에서 통신의 유지만큼은 게을리하지 않았던 것은 전파로 이어진 사람들의 웃음과 울음을 직접 눈으로 보았기 때문에, 그 감정을 지켜주고 싶은 소망 때문이었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "내가 죽으면…"),

			() => this.t("지역의 통신은 한동안 마비되겠지."),
			() => this.t("자본주의의 논리를 1순위로 삼는 펙스에서 이런 오지로 또 인력을 파견할 리도 없다."),
			() => this.t("만일 오더라도 분명 긴 시간이 걸릴 터였다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_25"),
			() => this.s("유미", "과연 이 고독이 끝나는 날이 오기는 할까."),

			() => this.t("오로라가 울부짖었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "… 아니, 믿어보자."),
			() => this.s("유미", "이 겨울이 끝나고 오로라가 하늘 너머로 흩어질 때까지만이라도."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),
			() => this.scg(1, null),
			() => {
				this.lock();

				Promise.all([
					new Promise<void>(resolve => {
						this.picture(1001, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? 60 * 1.5 : 0);
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
								bg.startFadeOut(60 * 1.5); // 1.5초 fadeout
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

			async () => {
				this.lock();
				if (this.isReady) await this.wait(1.5);
				this.unlock();
			},

			() => {
				this.lock();

				this.bg("14_yumi_room_lights_off", async bg => {
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

			() => this.scg(1, "SCG/STD_03_25"),
			() => this.s("유미", "… 졸려."),

			() => this.t("숙소로 들어와 추위에 얼었던 몸이 녹자 그렇게나 오래 잤는데도 다시 잠이 쏟아졌다."),
			() => this.t("미녀는 잠꾸러기라더니, 같은 철없는 생각을 하며 눕자 이질적인 소리가 고막을 때렸다."),
			() => this.close(),

			() => AudioManager.playSE({
				name: "3-2 Call",
				volume: 100,
			}),
			() => this.t("치지직- 치직-"),
			() => this.t("이곳에 온 뒤로 울린 적이 손에 꼽는 낡은 무전기로부터 통신이 걸려왔다."),
			() => AudioManager.stopSE(),

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "ㅇ, 여보세요?"),
			() => this.s("유미", "네. 네!? ㄷ, 다시 말씀해주시겠어요?"),
			() => this.s("유미", "ㅈ, 죄송합니다. 정말 사실인 거죠?"),
			() => this.s("유미", "감사합니다. 네네, 물론이에요."),
			() => this.s("유미", "네. 알겠습니다. 편히 쉬세요."),

			() => this.t("덜덜 떨리는 손으로 무전기를 내려놓은 유미는 흘러내리듯이 바닥에 주저앉았다."),
			() => this.t("죽어가던 감정이 일시에 되살아나고, 인간의 언어로는 형용하기 힘든 본능적인 환희가 그녀를 감싸 안았다."),
			() => this.t("그러나 실감이 나지 않았다."),
			() => this.t("한꺼번에 몰려오는 기쁨에 오히려 감각이 마비된 것이었다."),
			() => this.t("이 지긋지긋한 일상의 반복에서 벗어날 수 있다는, 마치 전쟁의 승전보와 같은 무게를 지닌 무전 하나에 유미는 뛸 듯이 기뻐했다."),

			() => this.t("그러나 어딘가 이상했다."),
			() => this.t("정신을 차리고 보니 방을 미약하게나마 밝혀주던 사이렌의 불빛조차 사라지고, 온전한 암흑으로 물든 것이었다."),
			() => this.t("게다가 바닥은 익숙한 질감의 액체로 온통 축축했다."),
			() => this.t("코를 찌르는 비릿한 향과 쇠의 쓴맛… 피였다."),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(0.5);
				this.unlock();
			},
			() => {
				this.lock();

				AudioManager.playSE({
					name: "2-1_Horror",
					volume: 100,
				});
				this.picture(1001, "SOLID/red.png", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 0.5);
					sprite.transform.position.set(Game.width * 0.5, Game.height * 0.5);

					const cb = (sprite: Sprite): void =>
						void (sprite.transform.scale.set(Game.width / sprite.width, Game.height / sprite.height));

					if (sprite.bitmap.isReady())
						cb(sprite);
					else
						sprite.bitmap.addLoadListener(() => cb(sprite));

					pic.startFadeIn(this.isReady ? 30 : 0); // 0.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.unlock();
				});
			},

			() => this.t("그것을 감지한 순간, 어두웠던 세상이 이번에는 눈이 시큰거릴 정도로 자극적인 붉은 색으로 젖었다."),
			() => this.t("그와 동시에 그녀 자신과 똑 닮은, 그러나 이질적인 무언가가 바닥에서 솟아났다."),

			() => this.s("???", "네가 정말 행복할 수 있을 것 같아?"),

			() => this.scg(1, "SCG/STD_03_22"),
			() => this.s("유미", "ㄴ, 누구야!"),
			() => this.s("???", "… 굳이 대답할 필요가 있을까?"),
			() => this.s("???", "나는 너고, 너는 나지. 그것뿐이야."),

			() => this.t("유미는 저도 모르게 뒷걸음질 쳤다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "원하는 게 뭐야."),
			() => this.s("???", "원하는 건 없어."),
			() => this.s("???", "그냥… 네 주제를 알았으면 해서."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "그게 무슨…."),
			() => this.s("???", "그 남자가 널 정말로 인간과 동등하게 여길 거라고 생각해?"),
			() => this.s("???", "녀석은 그저 널 불쌍히 여겼을 뿐이라고."),
			() => this.s("???", "넌 그에게 그 이상도 이하도 아니야."),
			() => this.s("???", "그런 주제에 삿된 감정이나 품고 기어오르는 꼴이 보기 싫다는 거지."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_27"),
			() => this.s("유미", "그분은 달라!"),
			() => this.s("???", "뭐가 다르지?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "ㄱ, 그건…."),
			() => this.s("???", "거봐. 때가 되면 넌 버려질 거야."),
			() => this.s("???", "네가 정말 그 남자를 특별하게 여긴다면, ‘물건답게’ 처신하는 게 좋을 거야."),
			() => this.s("???", "세상이 바이오로이드를 곱게 보지 않는다는 건 네가 제일 잘 알잖아?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_24"),
			() => this.s("유미", "아니야, 아니야."),
			() => this.s("???", "아, 그게 아니라면 다정하게 대해주는 남자를 보니까 발정이라도 난 거야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_24"),
			() => this.s("유미", "아무것도 모르면서 함부로 지껄이지 마."),
			() => this.s("???", "곧 알게 되겠지."),
			() => this.s("???", "결국 저 남자도 다른 인간들과 다를 바가 없다는 걸."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_24"),
			() => this.s("유미", "그만, 그만해."),
			() => this.s("???", "뭐, 금방 알게 되겠지."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_24"),
			() => this.s("유미", "아니야."),
			() => this.s("???", "그 남자가 네게 베푼 친절이나 선행들은 전부…"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_27"),
			() => this.s("유미", "아니야, 아니라고!"),
			() => this.s("???", "단순한 연민 때문이었다는 걸."),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1002, "CUT/cut_09.png", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 0.5);
					sprite.transform.position.set(Game.width * 0.5, Game.height * 0.5);

					const cb = (sprite: Sprite): void =>
						void (sprite.transform.scale.set(Game.width / sprite.width, Game.height / sprite.height));

					if (sprite.bitmap.isReady())
						cb(sprite);
					else
						sprite.bitmap.addLoadListener(() => cb(sprite));

					pic.startFadeIn(this.isReady ? 30 : 0); // 0.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.picture(1001, null);
					this.unlock();
				});
			},

			() => this.s("유미", "아니ㅇ…! 커헉…."),
			() => this.s("???", "닥쳐, 시끄러워."),

			() => this.t("숨이 턱 막혔다."),
			() => this.t("목이 졸린 채로 들어 올려져 말이 나오지 않았다."),

			() => this.s("???", "네 손목의 흉터가 아물지 않는 한."),
			() => this.s("???", "저주는 끝나지 않아."),
			() => this.close(),

			() => this.scg(1, null),
			() => {
				this.lock();

				this.bg(null);
				this.picture(1002, async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					pic.startFadeOut(this.isReady ? 30 : 0); // 0.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.picture(1002, null);
					this.unlock();
				});
			},

			() => this.load(new NextScript()),
		]);
	}
}
