import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";
import Session from "@/core/Session";

import NextScript from "./Ch2Part4";

export default class GameCh2Part3 extends GameScript {
	public readonly scriptName: string = "Ch2Part3";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Talk_06",
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

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_03_9", async (pic, sprite) => { // 아래에서 위로
						if (!pic || !sprite) return resolve();

						sprite.anchor.set(1, 0);
						sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

						// 아래에서 위로, anchor를 변환
						const xStart = 0; // 출발
						const xEnd = 1; // 도착

						const begin = Game.frameCount;
						const easing = Bezier.SmoothOut; // Ease-In-Out 커브
						while (true) {
							const elapsed = Game.frameCount - begin;
							const p = elapsed / 30; // 0.5초
							if (p > 1) break;

							sprite.anchor.set(1, (xEnd - xStart) * easing.getY(p) + xStart);
							await this.wait(0);
						}

						sprite.anchor.set(1, 1);
						resolve();
					});
				}).then(() => this.unlock());
			},
			() => {
				this.lock();

				new Promise<void>(async resolve => {
					this.shake(20, 90);

					while (this.isShaking)
						await this.wait(0);

					resolve();
				}).then(() => this.unlock());
			},

			() => this.s("유미", "꺄아~ 개운하다~!"),

			() => this.t("샤워를 마치고 내복으로 갈아입은 유미가 침대 위로 뛰어들었다."),
			() => this.t("통신기의 수리를 마치고 기지국으로 돌아오자 거의 해가 저물어가는 시간이 되었다."),
			() => this.t("온종일 걸어 다닌 탓에 우리 모두 지쳤으므로 각자 소파와 침대에 엎어져 해롱거렸다."),

			() => this.scg(1, "SCG/STD_03_18"),
			() => this.s("유미", "관리자님, 맥주 한잔하실래요?"),
			() => this.s("나", "어제도 마셨잖아. 그렇게 막 마셔도 돼?"),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "사실, 드론에게 생필품 말고도 원하는 음식 하나를 선택해서 받을 수 있거든요."),
			() => this.s("유미", "저는 그 보급품으로 맥주를 받기 때문에 술 떨어질 걱정은 없답니다?"),
			() => this.s("유미", "그러니까… 걱정 말고 마시자고요~!"),

			...this.when(() => Session.get("Ch1Part6Sel") === "2", [
				() => this.sel(
					{ key: "1", text: "아무래도 오늘은 유미에게 맞춰줘야 할 것 같다…." },
					{ key: "2", text: "역시 술은 몸에 안 맞아." },
				),
				() => this.close(),

				...this.when("1", [
					() => this.s("나", "역시 몸이 고단할 때는 술을 마셔야지."),

					() => this.scg(1, "SCG/STD_03_9"),
					() => this.s("유미", "잘 생각하셨어요!"),

					() => this.scg(1, "SCG/STD_03_16"),
					() => this.s("유미", "어디 보자, 오늘의 안주는…"),

					() => this.scg(1, "SCG/STD_03_10"),
					() => this.s("유미", "이런, 조금 아껴 먹어야겠네요."),
					() => this.s("나", "어제 너무 많이 먹었나…?"),

					() => this.scg(1, "SCG/STD_03_28"),
					() => this.s("유미", "헤헤, 너무 신경 쓰지 마세요."),
					() => this.s("유미", "제가 좀 덜 먹으면 되죠, 뭐."),
					() => this.s("유미", "저는 원래 안주 없이 마시는 걸 더 좋아하거든요."),

					() => this.t("오늘은 너무 무리하지 않고 마시기로 했다."),
					() => this.t("내일부터 계속될 업무를 위해서라도 과음은 금기다."),
					() => this.close(),

					() => this.scg(1, "SCG/STD_03_2"),
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
					() => this.s("유미", "건배~!"),

					() => this.t("술 냄새가 진동할 때까지 들이킨 어제와는 달리 약속한 대로 은은하게 취할 정도로만 마셨다."),
					() => this.t("오랜만에 입에 댄 술은 설탕물을 마시는 것처럼 달게 느껴졌다."),
					() => this.t("정신이 또렷한 덕분에 일상적인 대화가 오갔다."),

					() => this.t("유미는 지금까지 겪었던 특이한 사건을 털어놓았다."),
					() => this.t("숲에서 태즈메이니아데블이라는 작은 토종 동물에게 쫓겼던 일, 조난당한 관광객을 구했던 일, 술기운에 모빌처럼 펼쳐진 은하수를 벗 삼아 잠들었다가 모기에게 잔뜩 물려 고생했던 일…."),
					() => this.t("게워내듯 털어놓는 이야기 중에는 깜짝 놀랄 만큼 위험한 일도, 가슴이 뭉클해지는 따뜻한 일도 있었다."),

					() => this.t("물 흐르듯 흘러가는 시간 동안 온통 하얀 벽지로 둘린 무채색의 방이 점차 그녀의 온기로 물들어 갔다."),
					() => this.t("약간 상기된 뺨과 미약하게 녹아내린 눈동자가 조금 다른 시선으로 보였다."),
					() => this.t("캔이 5개 정도 바닥에 나뒹굴 때쯤, 이야기는 막을 내렸다."),

					() => this.t("대단원은 끝났지만 두근거리는 가슴은 진정될 기미가 없었다."),
					() => this.t("술기운 때문이라 치부하고 잠을 청했지만, 도저히 눈이 감기지 않았다."),
					() => this.t("유미가 풀어낸 모험 이야기들, 그 노란 눈동자에 맺힌 비애가 머릿속에서 맴돌았다."),
					() => this.t("마치 장대한 영웅 서사 한 편을 본 것 같은 뭉클함이었다."),
					() => this.t("거북하기만 하던 술과 조금은 가까워진 것 같았다."),
				]),
				...this.when("2", [
					() => this.s("나", "역시 술은 좀 그래."),

					() => this.scg(1, "SCG/STD_03_11"),
					() => this.s("유미", "네? 오늘도 빼시게요?"),
					() => this.s("유미", "하… 네네, 알겠어요."),
					() => this.s("유미", "또 외롭게 혼자 마실게요."),

					() => this.t("유미는 기대도 안 했다는 듯이 탁자에 술병을 늘어놓고 연거푸 들이부었다."),

					() => this.scg(1, "SCG/STD_03_14"),
					() => this.s("유미", "… 맛없어. 진짜 안 마실 거예요?"),
					() => this.s("나", "…."),

					() => this.scg(1, "SCG/STD_03_15"),
					() => this.s("유미", "됐네요, 됐어. 이제 권유 안 할게요."),
					() => this.close(),

					() => this.t("아무래도 단단히 상심한 듯했다."),
					() => this.t("지금이라도 마신다고 해야 할까…."),

					() => this.scg(1, "SCG/STD_03_7"),
					() => this.s("유미", "에라이, 나쁜 남자!"),
					() => this.s("유미", "한 번 정도는 어울려 줄 수 있는 거 아니냐고오!"),

					() => this.t("한 시간도 안 되어 만취해버린 유미는 고레고레 소리를 지르며 내 등짝을 때리기 시작했다."),
					() => this.t("어떨 때는 흐느끼다가 또 어떨 때는 배시시 웃기를 반복하다가 이내 면전에 캔을 들이미는 것이 아닌가."),

					() => this.scg(1, "SCG/STD_03_20"),
					() => this.s("유미", "한입만 마셔요, 한입마안, 응?"),
					() => this.s("유미", "오빠아~ 같이 마셔요오~ 네에?"),

					() => this.t("실시간으로 흑역사를 생성 중인 유미."),
					() => this.t("저렇게까지 하는데 거절할 수도 없는 노릇이다."),

					() => this.s("나", "그럼 한 캔만…."),
					() => this.close(),

					() => this.scg(1, "SCG/STD_03_9"),
					() => this.s("유미", "꺄~ 너무 잘 마신다~!"),

					() => this.t("유미가 물개박수까지 치며 기뻐했다."),
					() => this.t("이럴 줄 알았으면 어제도 마실 걸 그랬나…."),
					() => this.t("맛은 썼지만, 기분은 좋았다."),
					() => this.t("술이라면 거의 입에 대본 적이 없는 터라 익숙하지 않은 몽롱함이었다."),
					() => this.t("그 뒤로도 계속해서 부추기는 바람에 몇 캔 정도 더 마셨지만, 어쩐지 거부감은 들지 않았다."),

					() => this.t("흥겨운 분위기 덕분일까."),
					() => this.t("자꾸 엉겨 붙는 유미를 떼어내는 일조차 묘한 즐거움이었다."),
					() => this.t("연거푸 술주정을 하다 어제처럼 끝내 바닥에 드러누운 채로 기절한 그녀를 침대에 눕혀주고 나서야 알코올의 파도에서 벗어날 수 있었다."),

					() => this.t("고요해진 방안, 소파는 사실상 내 지정석이 되었다."),
					() => this.t("쿠션을 베고 누웠지만, 도저히 잠이 오질 않았다."),
					() => this.t("술기운 때문인지 가슴이 두근거렸다."),
					() => this.t("나쁘게만 보았던 술의 다른 일면을 본 것 같은 밤이었다."),
				]),
				() => this.close(),
			]),
			...this.when(() => Session.get("Ch1Part6Sel") !== "2", [
				() => this.s("나", "당연히 마셔야지!"),

				() => this.scg(1, "SCG/STD_03_2"),
				() => this.s("유미", "헤헤, 역시 그럴 줄 알았어요."),
				() => this.s("유미", "오늘은 조금만 마실까요?"),
				() => this.s("유미", "라면으로 해장하기 전까지는 속이 메스꺼워서 죽는 줄 알았다구요."),

				() => this.t("동감했다. 아마 아침에 꾸었던 악몽도, 일어났을 때 느꼈던 구토감도 분명 그 때문이었겠지."),
				() => this.t("오늘은 취하기보다는 분위기를 낼 정도로만 마시자."),

				() => this.scg(1, "SCG/STD_03_13"),
				() => this.s("유미", "오늘 등산, 힘들기는 했지만 즐거웠죠?"),
				() => this.s("유미", "혼자 오를 때는 죽을 맛이었는데 얘기하면서 오르니까 덜 힘들더라고요."),

				() => this.t("유미의 미소에는 어딘지 음울한 기운이 서려 있다."),
				() => this.t("지금도 마찬가지다."),
				() => this.t("헤실헤실 웃고 있지만, 전혀 웃는 것처럼 보이지 않는다."),
				() => this.t("다른 이들이 보기에는 보통 사람과 같아 보일지도 모른다."),
				() => this.t("그 사실을 알아낼 수 있었던 것은 단지 동질감, 이상하리만치 그립고 익숙한 동질감이 느껴져서였다."),

				() => this.t("유미는 은은하게 웃으며 지금껏 겪었던 흥미로운 사건에 대해 풀어놓았다."),
				() => this.t("램파트가 고양이를 구조해서 자신이 맡아 키우게 된 일이라던가, 예전에 구조했던 어린아이가 대학생이 되어 감사 인사를 전하러 온 일이라던가…."),

				() => this.t("아무리 오지라지만, 30년의 세월을 지나온 만큼 재밌는 일이 많았다."),
				() => this.t("나는 유미와 울고 웃으며 그녀의 일생을 맛보았다."),
				() => this.t("마치 오랜만에 다시 만난 친구처럼 그리운 기분이 들었다."),

				() => this.t("술은 기묘하다."),
				() => this.t("역사를 뒤흔든 위인들을 파국에 이르게 만드는가 하면, 또 어떨 때는 굳게 닫힌 마음을 이어주는 매개체가 되기도 한다."),
				() => this.t("슬픈 기억은 맥주 거품에 담아 날려 보내고, 좋은 기억은 황금빛 액체에 담가 마셨다."),
				() => this.t("이윽고 거품이 걷힌 투명한 표면에 비치는 얼굴."),
				() => this.t("나는 나를 마셨다."),
				() => this.t("유미도 유미를 마셨다."),
				() => this.t("이 잔으로서 행복했던 기억만 가지고 가기를 빌면서, 우리는 마지막 잔을 부딪쳤다."),
			]),
			() => this.close(),


			() => this.scg(1, null),
			() => {
				this.lock();

				AudioManager.fadeOutBGM(1.5);
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(60 * 1.5); // 1.5초 fadeout
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeOut(0);

					this.bg(null);
					this.unlock();
				});
			},

			() => AudioManager.playBGM({
				name: "Marriage_01",
				volume: 100,
			}),

			() => this.t("유미의 코골이를 벗 삼아 잠을 청하려던 나는 도저히 잠이 오지 않아 점퍼 하나만 걸치고 잠시 바깥으로 나왔다."),
			() => this.t("지금은 4월. 한창 벚꽃이 필 봄이어야 하겠지만, 호주의 4월은 겨울을 향해가는 늦가을이다."),
			() => this.t("차가운 바람이 옷 속으로 파고드는 탓에 되려 정신이 맑아졌다."),
			() => this.t("한밤중인데도 가까운 숲이 들여다보일 정도로 밝았다."),
			() => this.t("그 원인을 찾기 위해 나는 고개를 들어 하늘을 향했다."),

			() => AudioManager.playBGM({
				name: "Marriage_02",
				volume: 100,
			}),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_07-1.png", async (pic, sprite) => {
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

			() => this.t("그곳에는 은하수가 있었다."),
			() => this.t("검기만 한 하늘을 양분하는 거대한 빛줄기를 타고 흐르는 무수한 별들의 집합."),
			() => this.t("도시가 아니기에, 빛이 없기에 볼 수 있는 아이러니한 빛의 마술이다."),
			() => this.t("문득 하늘의 별을 올려다본 것이 언제였는지 생각했다."),
			() => this.t("일이 끝나면 고개를 숙인 채로 꿈도 희망도 잃어버린 시체처럼 집으로 향하고, 아침에 일어나 또 같은 일을 하는 의미 없는 일상의 연속에서 별을 볼 여유 따위는 없었다."),

			() => this.t("백치가 된 듯 감탄했다."),
			() => this.t("이 감상을 말로 표현할 수 없는 자신이 한스러울 지경이었다."),
			() => this.t("어쩌면 돈과 성공만을 바라보며 달려간 나머지 중요한 것을 놓치고 있었을지도 모르겠다는 생각이 들었다."),

			() => this.t("아침에 꾸었던 꿈에서 나온 사내의 말처럼 나는 괴물의 아가리를 향해 달려가고 있었을지도 몰랐다."),
			() => this.t("이곳에 오지 않았더라면 결국 길의 끝에 기다리고 있을 괴물에게 잡아 먹혔겠지."),
			() => this.t("처음 유미에게 진실을 전해 들었을 때의 증오나 분노 따위는 완전히 자취를 감춘 지 오래였다."),
			() => this.t("지금은 오히려 진짜 중요한 것이 무엇인지 고민하게 해준 기회를 얻은 것 같아 기뻤다."),

			() => this.t("유미는 내게 타인과 교감하는 즐거움에 대해 알려주었다."),
			() => this.t("30년이라는 뼈에 사무치게 긴 시간을 홀로 견딘 그녀에게 내 나름의 감사를 표하고 싶었다."),
			() => this.t("그녀가 가장 기뻐할 만한 선물은...."),

			() => this.t("슬슬 거세지는 한기에 방으로 들어가려 몸을 돌리자 마을 주민과 정겹게 이야기를 나누던 유미의 모습이 떠올랐다."),
			() => this.t("그래, 답은 생각보다 멀지 않은 곳에 있었다."),
			() => this.t("나만이 줄 수 있는 그런 선물이 있었다."),
			() => this.t("그것을 깨달은 나는 흘러나올 듯한 웃음을 참으며 밤을 흘려 보냈다."),

			() => {
				this.lock();

				AudioManager.fadeOutBGM(1.5);
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

			async () => {
				this.lock();
				if (this.isReady) await this.wait(1.5);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "HeartbeatOME",
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

			() => this.t("설레는 마음에 아침 일찍부터 눈이 뜨였다."),
			() => this.t("어제와는 달리 몸도 가볍고 숙취도 없었다."),
			() => this.t("상쾌하게 몸을 일으킨 나는 다짜고짜 유미를 깨웠다."),
			() => this.t("기뻐하는 모습이 벌써 눈에 선했다."),

			() => this.s("나", "유미, 어서 일어나!"),

			() => this.scg(1, "SCG/STD_03_19"),

			() => this.s("유미", "으으, 아침부터 무슨 일이에요…."),
			() => this.s("나", "마을에 가자!"),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "… 네?"),
			() => this.s("나", "마을에 가보자!"),

			() => this.scg(1, "SCG/STD_03_15"),
			() => this.s("유미", "아… 네…."),

			() => this.t("떨떠름한 표정을 보고 실망하려던 찰나, 유미가 깜짝 놀라 되물었다."),

			() => this.scg(1, "SCG/STD_03_11"),
			() => this.s("유미", "… 방금 뭐라고요?"),
			() => this.s("나", "마을에 가보자니까?"),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "아니 그건 회사 방침상…."),
			() => this.s("나", "마을을 내게 안내해준다는 명목이라면 같이 갈 수 있는 거 아니야?"),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "어라? 그런 이유라면 충분히…."),

			() => this.t("어제 산 정상에서 유미는 분명 ‘인간과 관련된 경우’라면 마을에 갈 수 있다고 했다."),
			() => this.t("설령 그것이 관리자의 요청이라면 더할 나위도 없으리라."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
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
			() => this.s("유미", "관리자님은 천재세요!"),
			() => this.s("유미", "앞으로 평생 여기 처박혀서 썩게 될 거라 생각했는데…."),
			() => this.s("유미", "업무에 지장이 없는 한 관리자님의 명령만 있다면 충분히 이곳에서 나갈 수 있을 거예요!"),

			() => this.t("그래, 바로 이런 반응을 원했다."),
			() => this.t("유미는 마치 무인도에 갇혀 있다가 구조대를 만난 조난자처럼 방방 뛰며 기뻐했다."),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "이럴 때 입으려고 아껴둔 옷이 어디 있더라~ 아, 찾았다."),

			() => this.scg(1, "SCG/STD_03_9"),
			() => this.s("유미", "빨리 씻고 옷 갈아입고 올게요!"),
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

			() => this.t("옷장을 뒤적거리며 여러 벌을 순식간에 골라낸 유미가 마찬가지의 속도로 세안을 마치고 튀어나왔다."),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_02V2_9", async (pic, sprite) => {
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
			() => this.s("유미", "헤헤, 어때요? 완전히 딴 사람 같죠?"),

			() => this.t("지금껏 본 적 없는 고운 자태에 일순 머리가 새하얘졌다."),
			() => this.t("제대로 꾸며 놓고 보니 다듬어지지 않은 원석이었다는 생각이 들었다."),

			() => this.scg(1, "SCG/STD_02V2_18"),
			() => this.s("유미", "헤헤, 그렇게 예뻐요? 아주 헤벌레해지셨네."),
			() => this.s("나", "뭐래… 그것보다 그 옷으로 괜찮겠어? 숲을 지나야 할 텐데."),

			() => this.scg(1, "SCG/STD_02V2_2"),
			() => this.s("유미", "괜찮아요, 괜찮아!"),
			() => this.s("유미", "어제 말씀드렸듯이 조금 돌아가기는 해도, 덜 거친 길이 있으니까요."),
			() => this.close(),

			() => this.scg(1, null),
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

			async () => {
				this.lock();
				if (this.isReady) await this.wait(1.5);
				this.unlock();
			},

			() => {
				this.lock();

				this.bg("12_Lake", async bg => {
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

			() => this.t("옷을 갈아입자마자 잔뜩 흥분한 유미의 손에 이끌려 나갔다."),
			() => this.t("누군가에겐 일상이나 다름없는 일에 저렇게나 기뻐한다니, 안쓰러웠다."),

			() => this.scg(1, "SCG/STD_02V1_2"),
			() => this.s("유미", "관리자님, 그런데 제가 마을에 가고 싶어 하는 건 어떻게 아셨어요?"),

			() => this.t("그렇게 티를 내는데 모르는 게 바보라고 알려주고 싶었으나 적당히 둘러댔다."),

			() => this.scg(1, "SCG/STD_02V1_2"),
			() => this.s("유미", "마을 사람들은 정말 좋은 분들이에요."),
			() => this.s("유미", "바이오로이드라고 무시하지 않고 오히려 예뻐해 주시거든요."),
			() => this.s("유미", "태즈메이니아에 바이오로이드 자체가 별로 없는 탓이기도 하지만, 당장 항구 도시로만 나가도 바이오로이드는 물건 이상도 이하도 아니라고 생각하는 사람들이 대부분이거든요."),
			() => this.s("유미", "그런데 그분들은 달라요."),
			() => this.s("나", "가족 같은 분들이네."),

			() => this.scg(1, "SCG/STD_02V1_12"),
			() => this.s("유미", "… 네. 정말 가족 같은 분들이죠."),
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
