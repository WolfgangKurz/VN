import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch1Part6";

export default class GameCh1Part5 extends GameScript {
	public readonly scriptName: string = "Ch1Part5";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			() => {
				AudioManager.playBGM({
					name: "Talk_07",
					volume: 100,
				});
			},
			() => {
				this.lock();

				this.picture(-1, "CUT/cut_03.jpg", async (pic, sprite) => {
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

			() => this.t("우리는 한국에서도 흔히 보았던 파란 트럭의 짐칸에 타고 깊은 숲 속으로 이동하고 있다."),
			() => this.t("그녀의 말로는 버스도 운행하지 않을 정도로 외진 장소라고 한다."),
			() => this.t("그래서인지 도로는 여기저기 관리되지 못해 울퉁불퉁하고 거칠었다."),
			() => this.t("덕분에 트럭이 튀어 오를 때마다 우리는 동시에 비명을 질렀다."),

			() => this.scg(1, "SCG/STD_01_10"),
			() => this.s("유미", "조금 진정되셨나요?"),
			() => this.s("나", "…."),

			() => this.scg(1, "SCG/STD_01_10"),
			() => this.s("유미", "제가 할 수 있는 일이 없을까요…?"),
			() => this.s("유미", "혼란스러우신 건 알지만, 그래도…."),

			() => this.t("이렇게 풀죽어 있기만 해서는 아무것도 할 수 없다."),

			() => this.memory(),
			() => this.t("어떤 질문을 해야 할까…."),
			() => this.sel(
				{ key: "1", text: "상황을 다시 한 번 정리해줄래?" },
				{ key: "2", text: "우리가 가려는 곳은 어디야? 무슨 일을 하는 거고?" },
				"아니, 역시 괜찮아. 대충 알 것 같아.",
			),

			...this.when("1", [
				() => this.close(),
				() => this.scg(1, "SCG/STD_01_12"),
				() => this.s("유미", "관리자님은 한국에서 지령을 받아 여기로 오셨다고 하셨죠?"),
				() => this.s("유미", "저희는 지금 태즈메이니아 섬 최남단 호바트의 도시에서\n여가를 즐기다가 상부의 지령대로 세인트 클레어 국립공원으로 향하고 있어요."),
				() => this.s("유미", "아마 정황상 관리자님은… 윗분들께 속았다고 봐야겠죠."),
				() => this.s("유미", "또 궁금하신 게 있으신가요?"),
				() => this.rollback(),
			]),
			...this.when("2", [
				() => this.close(),
				() => this.scg(1, "SCG/STD_01_12"),
				() => this.s("유미", "세인트 클레어 국립공원의 기지국이에요."),
				() => this.s("유미", "원래는 저 혼자 생활하던 곳인데, 워낙 인적도 적고\n가장 가까운 마을마저도 멀리 있는 곳이라 자연이 그대로 보존되어 있어요."),
				() => this.s("유미", "관리자님은 저를 도와 통신기기를 정비하거나, 나쁜 사람들이\n환경을 훼손하지는 않는지 순찰하는 일을 하게 되실 거예요."),
				() => this.s("유미", "또 궁금하신 게 있으신가요?"),
				() => this.rollback(),
			]),

			// 3
			() => this.close(),
			() => this.scg(1, "SCG/STD_01_11"),
			() => this.s("유미", "정말 괜찮으시겠어요?"),
			() => this.sel(
				"응. 정말 괜찮아. 무슨 상황인지 정도는 알 것 같아.",
				{ key: "a", text: "조금 더 생각해볼까…." },
			),

			...this.when("a", [() => this.rollback()]), // 되돌아가기
			() => this.unmemory(),

			() => this.s("유미", "바이오로이드인 제가 위로가 될지는 모르겠지만…."),
			() => this.s("유미", "아마 관리자님도 그곳의 자연을 보시면 생각이 조금은 바뀔지도\n몰라요."),
			() => this.s("유미", "비록 도시에 비할 바는 아니지만, 볼거리도 많고, 무엇보다 편히 쉴\n수 있거든요."),

			() => this.scg(1, "SCG/STD_01_12"),
			() => this.s("유미", "그리고…."),
			() => this.s("나", "고마워, 유미."),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "…뭘요. 기분이 좀 풀리신 것 같아 다행이네요."),

			() => this.t("유미의 다정한 위로 덕분에 기분이 조금은 나아졌다."),
			() => this.t("바로 말하자면, 난 배신 당한 것이 확실해 보였다."),
			() => this.t("빠른 승진을 질투한 무리의 짓이라고 예상했다."),
			() => this.t("그들은 비단 내가 아니더라도 승승장구하는 신입사원들을 가만두지 않던 자들이었으니까."),

			() => this.t("아마 다음 승진식에 참여하지 못하게 하려는 계략이겠지."),
			() => this.t("커리어를 쌓기는커녕 이번 전출로 인해 모든 계획이 물거품이 되었다."),
			() => this.t("단기적인 출장은 유리하지만, 그 기간이 길어질수록 승진에 불리해지기 때문이다."),

			() => this.t("한 달인 줄 알았던 출장 기간은 어느새 일 년으로 늘어나 있었다."),
			() => this.t("완전히 속았다는 것이다."),
			() => this.t("비록 암울한 상황이지만, 꼭 죽으라는 법은 없다."),
			() => this.t("이곳에서 악착같이 살아남아 그들에게 한 방 먹여 보이리라."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_1"),
			() => this.s("유미", "관리자님, 저기 보세요."),
			() => this.s("유미", "저 호수 너머가 우리가 근무하게 될 곳이에요."),

			() => this.t("바다와는 다른, 그러나 바다만큼이나 넓은 호수가 눈에 들어왔다."),
			() => this.t("그러나 안개에 가려져 겨우 흔적만을 확인할 수 있을 뿐이었다."),

			() => this.scg(1, "SCG/STD_01_1"),
			() => this.s("유미", "이제 다 와 가네요."),
			() => this.s("유미", "저 앞에 보이는 마을에서 내려서 근무지로 걸어가야 해요."),

			() => this.t("이를 갈며 주먹을 쥐었다."),
			() => this.t("트럭은 곧 마을에 도착했다."),
			() => this.t("짐칸에서 내려 땅을 밟자 그제야 잊고 있던 고통이 둔부를 강타했다."),
			() => this.t("멍이 잔뜩 들었을 엉덩이를 문지르며 몇 걸음 나아가자 고즈넉한 풍경이 우릴 맞아주었다."),

			() => {
				this.lock();

				AudioManager.playBGM({
					name: "Daily",
					volume: 100,
				});

				Promise.all([
					new Promise<void>(resolve => {
						this.bg("4_Village street", async bg => {
							if (!bg) {
								this.unlock();
								return resolve();
							}
							bg.startFadeIn(0);
							resolve();
						});
					}),
					new Promise<void>(resolve => {
						this.picture(-1, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? 90 : 0);
							while (pic.isFading())
								await this.wait(0);

							this.picture(-1, null);
							resolve();
						});
					}),
				]).then(() => this.unlock());
			},

			() => this.s("유미", "어떠세요? 그래도 볼 만하죠? 정겹고."),

			() => this.t("익숙함과 이질감이 공존하는 풍경이었다."),
			() => this.t("한국의 시골과는 비슷하면서도 완벽히 다른… 그런 모습."),
			() => this.t("처음이지만 왠지 정겨운 마을의 모습을 둘러보며 우수에 잠기자 곧 정적을 깨고 시끄러운 소리가 들려왔다."),

			() => this.s("마을 주민", "우리 처자 왔어~?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "아주머니! 오랜만이죠?"),
			() => this.s("마을 주민", "아이고, 이게 누구야."),
			() => this.s("마을 주민", "우리 처자가 신랑감을 데려왔네!"),

			() => this.scg(1, "SCG/STD_01_17"),
			() => this.s("유미", "그, 그런 거 아니에요!"),
			() => this.s("마을 주민", "얼굴도 참하니, 괜찮네~"),
			() => this.s("마을 주민", "마침 우리 처자 결혼할 나이 아니야?"),

			() => this.scg(1, "SCG/STD_01_13"),
			() => this.s("유미", "글쎄 그런 사이 아니라니까…."),

			() => this.t("유미는 땀을 뻘뻘 흘리며 아주머니를 돌려보냈다."),
			() => this.t("짧은 대화 몇 마디가 오갔을 뿐인데도 유미와 마을 사람들의 사이가 얼마나 돈독한지 알 수 있을 것 같았다."),
			() => this.t("바이오로이드가 조금이라도 흔한 곳이라면 절대 볼 수 없을 광경이다."),
			() => this.t("주민들은 유미를 마치 진짜 사람처럼 대하고 있었다."),

			() => this.scg(1, "SCG/STD_01_28"),
			() => this.s("유미", "에헤헤, 죄송해요. 많이 기다리셨죠?"),
			() => this.s("유미", "바로 출발해요. 빨리 기지국에 가서 쉬고 싶네요."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(-1, "../BG/11_Forest_afternoon.jpg", async (pic) => {
						if (!pic) return resolve();

						pic.startFadeIn(this.isReady ? 120 : 0);
						while (pic.isFading())
							await this.wait(0);

						resolve();
					});
				})
					.then(() => new Promise<void>(resolve => {
						this.bg("11_Forest_afternoon", async bg => {
							if (!bg) {
								this.unlock();
								return resolve();
							}
							bg.startFadeIn(0);
							resolve();
						});
					}))
					.then(() => {
						this.picture(-1, null);
						this.unlock();
					});
			},

			() => this.t("마을에서 나와 기지국으로 가는 길은 험했다."),
			() => this.t("말 그대로 개발되지 않은 숲 속을 거니는 것은 그 자체로 스트레스였다."),
			() => this.t("반면 유미는 익숙한 듯이 나뭇가지를 헤치며 나아갔다."),
			() => this.t("바이오로이드는 지치지 않는다는 말이 헛소문은 아니었나 보다."),
			() => this.t("확실히 사람이 자주 다니는 것은 아닌지, 누군가 지나갔던 흔적조차 없었다."),
			() => this.t("땀을 뻘뻘 흘리는 저 작은 바이오로이드를 따라, 나는 열심히 앞으로 나아갔다."),

			() => this.s("???", "누구십니까? 이곳은 관계자 외 출입 금지 구역입니다."), // 램파트

			() => this.t("거의 1시간 정도 나아간 것 같았다."),
			() => this.t("우리의 앞을 거대하고 이질적인 금속 덩어리가 가로막았다."),

			() => this.s("???", "길을 잃으셨다면 시민증을, 업무로 오셨다면 신원과 직책을\n증명해주시기 바랍니다."), // 램파트

			() => this.t("그 차가운 위압감에 압도되기도 잠시, 정신을 차리고 살펴보니 녀석의 정체는 전 세계에서 가장 많이 팔린 경비 로봇인 램파트였다."),
			() => this.t("2m 쯤 되는 거구인데도 유미는 겁먹은 기색조차 없이 오히려 그의 등장을 반기는 것이 아닌가."),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_04.png", async (pic, sprite) => {
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

			() => this.s("유미", "아저씨! 저예요, 유미! 이분은 이번에 새로 일하게 된 관리자님이시고요."),
			() => this.s("램파트", "확인…. 확인…. 국립공원 소속 바이오로이드 커넥터 유미. 복귀를 환영합니다."),
			() => this.s("램파트", "관리자님, 귀하의 신원을 증명하기 위한 신분증이 필요합니다."),

			() => this.t("여권을 보여주자 램파트의 얼굴 부분에서 파란빛이 입사되며 그것을 훑었다."),
			() => this.t("별것 아닌 검사인데도 긴장감이 맴돌았다."),
			() => this.close(),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},
			() => AudioManager.playSE({
				name: "1-2_Rampart",
				volume: 100,
			}),
			() => this.t("영겁처럼 길게만 느껴지던 검사는 딩동- 하는 명쾌한 알림과 함께 막을 내렸다."),

			() => this.s("램파트", "검사 중…. 완료. 위조 확률 0%. 입주를 환영합니다, 관리자님."),
			() => this.s("램파트", "본 기를 호출하실 때에는 이 리모컨을 이용해주시길 바랍니다."),

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

			() => this.t("나도 모르게 안도의 한숨을 쉬었다."),
			() => this.t("신사적인 인사와 함께 순찰을 계속하는 램파트를 뒤로 하고 우리는 계속 발걸음을 옮겼다."),
			() => this.t("이제 정말 고지가 머지않았음을 직감했다."),
			() => this.t("슬슬 우거진 숲이 끝나 우리는 마치 산책하듯이 나란히 걸으며 잡담을 나눴다."),

			() => this.scg(1, "SCG/STD_01_3"),
			() => this.s("유미", "있죠, 관리자님."),
			() => this.t("사실 관리자님이 오시기 전까지는 기지국에 저랑 아저씨 말고는 아무도 없었어요."),
			() => this.t("그래서 할 일이 없을 때는 아저씨랑 시답잖은 농담을 하면서 보내기도 하고…."),
			() => this.s("나", "그 램파트를 아저씨라고 부르는 거야?"),
			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "아, 네. 오랫동안 같이 지내다 보니 친근하게 느껴져서요."),
			() => this.s("나", "… 외로웠구나?"),

			() => this.t("유미는 정곡을 찔린 듯이 움찔했으나 금방 표정을 펴고 반문했다."),

			() => this.scg(1, "SCG/STD_01_3"),
			() => this.s("유미", "에이, 뭘요. 바이오로이드는 외로움 같은 거 안 타거든요?"),
			() => this.t("오히려 혼자 있다 보면 마음도 편안해지고 명상도 할 수 있어서 꼭 나쁘지만은 않아요."),

			() => this.t("그후로는 별볼 일 없는 일상적인 대화만이 이어졌다."),
			() => this.t("다만 그녀도 어쩌면 나와 비슷한 부류일지도 모르겠다는 생각이 들었다."),
			() => this.t("겉으로는 웃고 있지만, 속은 이미 썩을 대로 썩어 곪아있는… 그런 부류 말이다."),

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