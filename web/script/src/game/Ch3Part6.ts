import Game from "..";

import Sprite from "@/core/Sprite";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";
import Session from "@/core/Session";

import NextScript from "./Ch4Part1";

export default class GameCh3Part6 extends GameScript {
	public readonly scriptName: string = "Ch3Part6";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Drinking",
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

			() => this.s("나", "뭐 하다가 이제 왔어!?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "헤헤, 죄송해요. 갑자기 어두워지는 바람에 길을 잃어서..."),
			() => this.s("나", "그걸 말이라고…"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "정말인데… 에취!"),

			() => this.t("자기 나름대로 가렸다고 생각했겠지만, 유미의 눈가에는 지워지지 않은 눈물 자국이 그대로 남아 있었다."),
			() => this.t("눈이 벌겋게 붓고 목소리도 잠긴 것이 틀림없이 혼자 그 추위 속에서 마음을 달래다 왔으리라."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_19"),
			() => this.s("유미", "으으, 춥다. 저 씻고 올…"),
			() => this.s("나", "잠깐."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "네?"),
			() => this.s("나", "무릎이…"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "아, 나무뿌리에 걸려서 넘어진 거니까 너무 걱정 안 하셔도…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_21"),
			() => this.t("앗."),

			() => this.t("나도 모르게 유미를 품에 안았다."),
			() => this.t("쏙 들어올 정도로 가녀리고 작은 체구였다."),
			() => this.t("얼마 뒤면 느낄 수 없을 온기가 전해지자 철부지처럼 눈물이 났다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "관리자님도 참… 왜 울고 그래요."),
			() => this.s("유미", "이 아저씨가 왜 이래. 다시는 못 볼 것도 아닌데."),
			() => this.s("유미", "이그, 착하지. 뚝! 저 여기 있어요. 네, 저 여기 있어요."),

			() => this.t("상한 음식을 게워내듯 감정을 토하자 겨우 복잡한 심경을 추스를 수 있었다."),
			() => this.t("최대한 웃으려고 했는데… 그게 말처럼 쉬운 일은 아니었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_12"),
			() => this.s("유미", "좀 진정되셨어요?"),
			() => this.s("나", "응. 덕분에."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "울지 말아요."),
			() => this.s("유미", "저도 웃는데 관리자님이 우시면 어떡해요."),
			() => this.s("나", "미안해."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "미안하다고 하지 말고."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_12"),
			() => this.s("유미", "저는 정말 괜찮으니까, 괘념치 마세요."),
			() => this.s("유미", "전과는 달리 기약이 생겼으니까 잘 기다릴 수 있어요."),
			() => this.s("유미", "그러니까 관리자님도 기분 푸시고 좋은 생각만 하세요. 아셨죠?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_18"),
			() => this.s("유미", "어린 애도 아니고 자꾸 이러시면 곤란해요."),

			() => this.t("유미가 소매로 눈물을 닦아주며 짓궂게 웃었다."),
			() => this.t("그 억지스러운 미소에 괜히 서글퍼져서 들어갔던 눈물이 다시 나올 뻔했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "전파를 관리하는 제가 정작 전파와 관련된 혜택을 전혀 누리지 못하는 게 아이러니하네요."),
			() => this.s("유미", "하다못해 전화라도 쓸 수 있다면 좋을 텐데…."),

			() => this.t("유미는 말 그대로 사회와 고립되어 살아왔다."),
			() => this.t("라디오도, TV도, 전화조차도 쓸 수 없다."),
			() => this.t("단거리용 무전기만을 간신히 사용할 수 있을 뿐이다."),
			() => this.t("즉 그녀와 떨어지는 것은 다시 만날 때까지 완전한 소식의 단절을 뜻하는 것이다."),
			() => this.t("심지어 언제 다시 볼 수 있을지도 모른다."),
			() => this.t("다소 어두워진 분위기를 전환하려는 듯이 고민하던 유미가 묘책을 떠올렸는지 아- 하고 짧은 감탄사를 내뱉었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "저희 오늘 밤에 파티라도 열까요?"),
			() => this.s("나", "웬 파티?"),

			() => this.t("무슨 대단한 걸 떠올렸나 했더니 겨우 파티라니…."),
			() => this.t("게다가 너무 뜬금없지 않은가."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_9"),
			() => this.s("유미", "이럴 때일수록 즐겁게 놀아야죠!"),
			() => this.s("유미", "아직 오지도 않은 일을 걱정하면서 우울하게 지내기에는 시간이 아깝잖아요?"),

			() => this.t("그럴듯하게 들렸다. 애초에 틀린 말도 아니었지만."),
			() => this.t("무엇보다 말의 시비를 따지기 전에, 몰라보게 바뀐 유미의 성격이 그대로 드러나 내심 기뻤다."),
			() => this.t("아니, 바뀌었다기보다는 원래의 모습을 되찾았다고 생각했다."),
			() => this.t("이렇게 철없이 웃고 덧없는 즐거움에도 기뻐하는 것이 이 아이가 본래 가진 얼굴이라고 믿었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "마침 얼마 전에 사 온 음식이 많이 남아 있으니까 오늘 전부 먹어버려요!"),
			() => this.s("유미", "그래, 술도 잔뜩 마시고요."),
			() => this.close(),

			...this.when(() => Session.get("Ch1Part6Sel") === "2", [
				() => this.t("술이라..."),
				() => this.t("지난 한 달 동안 술에 대한 나의 인식은 완전히 바뀌었다."),
				() => this.t("음주를 건강은 물론이고 이성을 흐리는 질 나쁜 죄악이나 다름이 없다고 여기던 나는 이제 유미와 비슷한 수준의 애주가가 되어 있었다."),
				() => this.t("어쩌면 술이 좋아진 것이 아니라 단지 유미와 술을 마시면 느껴지는 온정이 좋았던 것일지도 몰랐다."),
				() => this.close(),
			]),
			...this.when(() => Session.get("Ch1Part6Sel") === "1", [
				() => this.t("원래 술을 즐겨마시던 내게는 거부할 수 없는 제안이다."),
				() => this.t("유미와 함께 지내면서부터 술에 대한 호감은 더욱 늘었고, 이내 나는 유미와 비슷한 수준의 애주가가 되어 있었다."),
				() => this.t("술이 아니라, ‘유미와 함께 마시는’ 술이 좋은 것일지도 모르겠다."),
				() => this.close(),
			]),

			() => this.t("어쨌든, 이런 상황에서 굳이 거절할 이유는 없었다."),
			() => this.t("동의를 받아낸 유미는 보이지 않게 웃으며 분주하게 연회 준비를 시작했다."),
			() => this.t("나는 야식을, 유미는 맥주를 준비했다."),
			() => this.t("매서운 침묵이 흘렀지만, 부정적인 의미의 것은 아니었다."),
			() => this.t("여느 때처럼, 아무일도 없었던 것처럼 평범하게 마주 앉은 우리는 조금 어색하게 맥주를 땄다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_12"),
			() => this.s("유미", "건배, 할까요?"),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_20.jpg", async (pic, sprite) => {
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

			() => this.t("한 손으로 턱을 괸 유미가 캔을 내밀었다."),
			() => this.t("굳이 대답하지 않고 손을 내밀어 가볍게 캔을 부딪혔다."),
			() => this.t("둔탁한 마찰음과 함께 술은 방울이 되어 이리저리 튕겼다."),
			() => this.t("아득한 알코올 냄새가 방안을 채워가기 시작했다."),
			() => this.t("마시지도 않았는데 취해버릴 듯한 냄새. 분위기 탓이었다."),
			() => this.t("겨우 일주일, 이제는 느낄 수 없을 단칸방의 정취."),
			() => this.t("타는 듯한 갈증에 참지 못하고 한 모금 들이키자 따가운 탄산이 식도를 태우며 내려갔다."),

			() => this.t("갈증은 멎지 않았다."),
			() => this.t("아무리 마셔도 취하지 않았다."),
			() => this.t("유미의 동공에 비춰 떠오른 나의 모습은 불안정했다."),
			() => this.t("처음 이곳에 왔을 때 보았던 유미의 모습과 비슷했다."),
			() => this.t("부모님이 테러에 휩쓸려 한순간에 돌아가시고 홀로 남았던 때의 모습과 같았다."),

			() => this.t("우리는 셀 수도 없이 많은 술을 목 뒤로 넘겼다."),
			() => this.t("그러나 도저히 취할 기미는 보이지 않았다."),
			() => this.t("몇 번의 건배가 오가고, 또 몇 번의 대화가 오가고…."),
			() => this.t("그러는 동안 우리는 그동안 나누지 못했던 깊은 대화를 꺼내게 되었다."),
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

			() => this.scg(1, "SCG/STD_03_13"),
			() => this.s("유미", "관리자님, 재밌는 거 보여드릴까요?"),

			() => this.t("한참 분위기가 농익어가는 자정이었다."),
			() => this.t("유미가 장난기 서린, 그러나 한구석이 흉한 미소를 지었다."),
			() => this.t("순간 그녀의 얼굴에 다시 끝없는 불안과 어둠이 차올랐다."),
			() => this.t("등골을 타고 불길함이 엄습해왔다."),
			() => this.t("대답을 망설이고 있는 사이에, 유미가 갑자기 팔을 뻗어 상 위에 올렸다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "조금 흉할지도 몰라요. 그래도… 제대로 봐주세요."),

			() => this.t("미처 말릴 틈도 없이, 유미는 소매를 걷었다."),
			() => this.t("미지의 것에 대한 두려움에 떠는 손으로 소매를 걷자 드러난 것은...."),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_10.jpg", async (pic, sprite) => {
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

			() => this.s("나", "…."),
			() => this.s("유미", "…."),

			() => this.t("이것을 봤다면 유미가 그토록 긴소매 옷만을 고집했던 이유를, 그것으로도 모자라 손목 보호대나 팔토시까지 잊지 않고 착용해왔던 이유를 바보가 아니라면 누구나 알 수 있을 것이다."),
			() => this.t("유미의 손목에는 7개 남짓의 칼로 베인 흉터가 그대로 남아 있었다."),
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

			() => this.scg(1, "SCG/ STD_03_15"),
			() => this.s("유미", "어디부터 말씀드려야 할까요."),

			() => this.t("생각을 정리할 동안 말없이 시선을 피해 주었다."),
			() => this.t("끔찍하리만치 길게 느껴졌던 5분이 지나고 유미는 이윽고 입을 열었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "저, 사실 죽으려고 했어요."),

			() => this.t("이 미소에 담긴 의미는 대체 무엇일까."),
			() => this.t("무엇이 그녀를 죽음의 수렁으로 몰아넣은 것일까."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_12"),
			() => this.s("유미", "슬픈 표정 짓지 마세요."),
			() => this.s("유미", "그냥… 그래, 그냥 너무 외로웠어요."),
			() => this.s("유미", "아무도 오지 않는 이곳에서 아무것도 하지 못하고 시간을 허비한다…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "솔직히 조금 지겨웠어요."),
			() => this.s("유미", "손목의 상처는 자해 때문에 생긴 거예요."),
			() => this.s("유미", "이런 짓이라도 안 하면 도저히 무료해서 견딜 수가 없더라고요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "그렇게 해도 정신이 버티지를 못해서 작년 즈음에 확 죽어버릴 생각이었어요."),
			() => this.s("유미", "크래들산 정상에 올라서 뛰어내리려고 했죠."),
			() => this.s("유미", "새들처럼 훨훨 날지는 못하겠지만, 그래도 자유로워질 수 있을 것 같았어요."),

			() => this.t("우울하다거나 슬프다거나 하는 감정조차 느껴지지 않는 무덤덤한 목소리가 심장을 후벼팠다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_4"),
			() => this.s("유미", "그렇게 계획까지 세우고 산으로 출발하려던 찰나에 본사에서 관리자님이 오신다는 소식이 들려온 거예요."),
			() => this.s("유미", "처음에는 도저히 믿기지 않아서 몇 번이나 되물었어요."),
			() => this.s("유미", "헤헤, 덕분에 담당자님께 말귀도 못 알아듣는다며 꾸지람을 들었지만요."),
			() => this.s("유미", "그래도 기뻤어요."),
			() => this.s("유미", "그런 꾸중 정도는 귀에 들어오지도 않을 만큼요."),
			() => this.s("유미", "아니, 기쁘다는 감정은 아득히 초월한 그런 느낌이었죠."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "말은 이렇게 해도, 며칠은 의심스러웠어요."),
			() => this.s("유미", "관리자님도 그저 양의 탈을 쓴 늑대에 불과한 사람이 아닐까 싶었거든요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_12"),
			() => this.s("유미", "하지만 제 마음의 때와 함께 아저씨의 때를 벗겨낸 그날, 깨끗해진 기지국과 아저씨를 보면서 깨달았어요."),
			() => this.s("유미", "관리자님은 저를 양산형 바이오로이드 커넥터 유미가 아니라, 감정이 있는 인격체로 대해주시고 있다는 걸요."),
			() => this.s("유미", "관리자님과 만난 이후로는 모든 순간이 즐거웠어요."),
			() => this.s("유미", "누군가와 술을 마시고, 장난치고, 함께 걷는 모든 것이 제게는 처음이었으니까."),
			() => this.s("유미", "그렇게나 힘들었는데, 관리자님과 만나고 나서부터는 그런 나쁜 생각 든 적, 한 번도 없어요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_4"),
			() => this.s("유미", "너무 행복했어요."),

			() => this.t("유미가 바랐던 것은 그리 대단하지 않았다."),
			() => this.t("단지 감정을 나누고, 같은 시공간을 공유해주는 사람의 온정이 그리웠을 뿐인데…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_6"),
			() => this.s("유미", "너무… 기뻤어요…"),

			() => this.t("이윽고 울음이 터져버린 눈에서 서글픈 눈물이 뚝뚝 떨어졌다."),
			() => this.t("치유받지 못할 지난 세월이 서러워서,"),
			() => this.t("선물처럼 다가온 지금이 기뻐서,"),
			() => this.t("심장이 아리도록 울었다."),
			() => this.t("30년의 한을 쓸어내리듯, 방안이 떠나가라 울부짖었다."),
			() => this.t("품에 안으면 부서질까 휘청이던 유미는 조금씩 생기를 되찾아갔다."),
			() => this.t("감정이 빈 깡통 같던 얼굴에 윤기가 돌았다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_6"),
			() => this.s("유미", "죄송해요… 죄송해요… 이런 모습 보여서…."),
			() => this.s("나", "더 울어도 돼."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_5"),
			() => this.s("유미", "흑… 흐아아아!"),

			() => this.t("그 비통한 외침에 코끝이 시려왔다."),
			() => this.t("지금 필요한 것은 잠시 쉬어도 된다는 말 한마디뿐이었다."),
			() => this.t("떨어지는 소나기 아래에서 오랜 시간 버텨왔던 가녀린 소녀가 홀로 지고 있던 짐을 조금이나마 덜어줄 수 있기를 바라며, 나는 작은 우산을 건네주었다."),
			() => this.t("내게 안겨 한참이나 서럽게 눈물을 쏟아낸 유미는 겸연쩍게 웃으며 품에서 빠져나왔다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_4"),
			() => this.s("유미", "헤헤, 관리자님 보고 울면 안 된다고 해놓고 철부지처럼 짜버렸네요…."),

			() => this.t("응어리진 마음이 풀어졌기 때문일까."),
			() => this.t("한층 부드러운 눈빛이 된 유미가 제안을 걸어왔다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_13"),
			() => this.s("유미", "관리자님, 저희 궁금했던 거 서로 물어봐요."),
			() => this.s("유미", "사실 그냥 제가 궁금한 걸 묻고싶을 뿐이지만."),
			() => this.s("나", "뭔데?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_21"),
			() => this.s("유미", "화 안 내실 거라고, 약속하신다면."),
			() => this.s("나", "… 약속할게."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "관리자님은… 왜 혼자가 되셨나요?"),

			() => this.t("술을 입으로 가져가던 손이 멈췄다."),
			() => this.t("유미는 내게 모든 과거를 숨김없이 말해주었다."),
			() => this.t("나만 숨기는 것은 이치에 맞지 않는다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_2"),
			() => this.s("유미", "헤헤, 죄송해요. 너무 민감한 사안인데."),
			() => this.s("나", "아니야, 말해줄게. 그래, 이젠 10년도 더 된 일이네."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "…."),
			() => this.close(),

			() => this.scg(1, null),
			() => {
				this.lock();
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(60 * 0.5); // 0.5초 fadeout
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
				if (this.isReady) await this.wait(2);
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

			() => this.t("때는 22세기를 맞기 직전, 새로운 세기의 시작을 기대하며 모두가 환희하던 해의 크리스마스였다."),
			() => this.t("그날, 나는 부모님을 졸라 도심에서 식사를 하게 되었다."),
			() => this.t("그러나 그것이 끔찍한 학살극의 서막이 되리라고는 누구도 예상하지 못했다."),
			() => this.t("1차 연합전쟁을 기점으로 전 세계로 퍼진 터키의 테러리스트들은 한국에도 발을 들였고, 인파가 많은 크리스마스를 노려 범행을 저지른 것이었다."),

			() => this.t("빨간 장식품과 오색빛 다이오드의 환한 색으로 물들었던 눈 덮인 도시는 눈이 멀어버릴 듯한 섬광을 내뿜는 폭발과 함께 피로 젖어갔다."),
			() => this.t("그들의 총구는 우리 가족에게도 향했고, 나는 부모님의 시체 아래에서 떨며 소동이 끝나기를 기다리는 것밖에 할 수 없었다."),

			() => this.t("그 근처에 세워진 내가 다니던 학교 역시 공격 받았다."),
			() => this.t("가족도, 배움의 터도 잃어버린 나는 없다시피 한 부모님의 재산 몇 푼으로 연명하며 공부에만 몰두했다."),
			() => this.t("친구도 없었다. 끼니는 오로지 인스턴트 식품과 물뿐이었다."),
			() => this.t("공부를 하면서도 굶어죽지 않기 위해서는 일을 해야했다."),
			() => this.t("개처럼 굴렀다. 편의점 아르바이트, 건설 현장에서 막노동…."),
			() => this.t("그러면서도 시간이 날 때마다 활자를 눈에 익혔다."),
			() => this.t("그렇게 죽도록 공부하고 일해서 나는 세계적인 대기업인 펙스에 취직했다."),

			() => this.t("그런데 막상 목표를 이뤄도 행복하지 않았다."),
			() => this.t("하루하루 즐거움도 없이 목숨만 연명하는 꼴이었다."),
			() => this.t("머저리처럼 시키는 대로, 아무 생각도 없이 주어진 일만 따르는 기계."),
			() => this.t("몰려오는 업무에 열중하느라 어떤 생각도 들지 않았다."),
			() => this.t("죽고 싶다는 생각도, 살고 싶다는 생각도 없이 살았다."),
			() => this.t("그러다가 유미를 만나게 되었다."),
			() => this.close(),

			() => {
				this.lock();
				this.bg(async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeOut(60 * 0.5); // 0.5초 fadeout
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
				if (this.isReady) await this.wait(2);
				this.unlock();
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

			() => this.s("나", "그래, 그렇게 널 만나게 된 거야."),

			() => this.scg(1, "SCG/STD_03_16"),
			() => this.s("유미", "…."),
			() => this.s("나", "표정이 왜 그래? 네 과거도 만만치 않으면서."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_10"),
			() => this.s("유미", "관리자님이 왜 그렇게까지 절 아껴주셨는지 조금은 알 것 같네요."),
			() => this.s("유미", "기분 나쁘게 들릴지도 모르겠지만, 우린 정말 닮았어요."),
			() => this.s("유미", "암울하기 그지없는 일만이 이어지는 비극을 연기하는 배우나 다름없는 삶을 살았고, 또 혼자였잖아요."),
			() => this.s("나", "응. 동질감이 느껴졌어. 네 표정에서 거울에 비친 내 모습이 보였거든."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "그건 저도 마찬가지거든요?"),
			() => this.s("나", "… 그럼 이제 내가 질문해도 될까?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_13"),
			() => this.s("유미", "그럼요."),
			() => this.s("나", "넌 왜 이 일을 그만두지 않았어?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "흐응… 무슨 의미일까요?"),
			() => this.s("유미", "그야 당연히 인간님들의 명령이니까…."),
			() => this.s("나", "그런 거 말고."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "그건… 나중에 말씀드려도 될까요?"),
			() => this.s("유미", "대신 다른 질문 하나 더 하셔도 돼요."),

			() => this.t("예전부터 궁금했던 것이 하나 있었다."),
			() => this.t("타이밍이 좀처럼 나지 않아 지금까지는 묻지 못했지만…."),

			() => this.s("나", "넌 왜 술을 좋아해?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "헤헤, 그거 물어보실 줄 알았어요."),

			() => this.t("가볍게 상기된 유미가 갑자기 옆 자리로 와서 앉았다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_13"),
			() => this.s("유미", "술을 마시면... 전부 잊을 수 있어서 그런 것 같아요."),
			() => this.s("유미", "아픔도, 외로움도, 슬픔도, 덧없이 흘러간 30년의 세월도, 전부."),
			() => this.s("유미", "쓴 음식을 먹다가 덜 쓴 음식을 먹으면 달게 느껴지는 것처럼, 술의 쓴맛이 삶의 쓴맛을 덮어주니까."),

			() => this.t("유미는 문득 놀라더니 자리에서 일어났다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "헤헤, 또 분위기에 취해서 이상한 말을 해버렸네요."),
			() => this.s("유미", "이해해주세요. 혼자 술주정하던 것이 버릇이 돼서…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_20"),
			() => this.s("유미", "뭐, 말은 거창하게 했지만 그냥 알코올 중독인 거죠~"),
			() => this.s("유미", "취향에 무슨 이유가 있겠어요."),

			() => this.t("사무치는 고독을 잊기 위해서라…."),
			() => this.t("비록 그 방식은 다를지언정 유미도 나와 다를 바는 없었다."),
			() => this.t("나는 단지 살아남기 위해 공부에 열중했을 뿐이고, 유미는 술을 마신 것이었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_13"),
			() => this.s("유미", "슬픈 기억은 맥주 거품에 담아 날려 보내고, 좋은 기억은 황금빛 액체에 담가 마셔라."),
			() => this.s("유미", "이 잔으로서 아픈 기억은 잊고 행복했던 기억만 가지고 가기를."),

			() => this.t("유미가 붉게 물든 낯으로 맥주를 잔에 따라 건넸다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "헤헤, 어때요? 저 방금 좀 멋있었죠?"),

			() => this.t("잔에 담긴 보리빛 맥주에 얼굴이 비춰 보였다."),
			() => this.t("나의 얼굴 역시 일 년 전과는 달라져 있었다."),
			() => this.t("생명을 잃고 방황하는 자처럼 생기라고는 찾아볼 수 없었던 얼굴에 감정이 싹 터 있었다."),

			() => this.t("인간 실격."),
			() => this.t("사람이 아니라 기계나 다름없는 삶을 살던 내게 드디어 인간으로서 가져야 할 감정과 꿈이 생겨나고 있었다."),
			() => this.t("이제야 삶의 의미를 찾았는데, 내가 가진 모든 것을 바쳐도 아깝지 않을 사람과 만났는데 이토록 허무하게 헤어져야 한다니."),
			() => this.t("다시 우울에 찌든 나를 끌어 올려준 이는 역시 유미였다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_13"),
			() => this.s("유미", "또 울려고 하시네."),
			() => this.s("유미", "아까 제가 한 말 못 들으셨어요?"),
			() => this.s("나", "…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_11"),
			() => this.s("유미", "어떻게 해야 이 철부지 아저씨가 기운을 차릴까…."),

			() => this.t("울먹이는 나를 다독이며 고심하던 유미는 끝내 답을 찾아냈다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "아, 관리자님. 호바트의 명물이 뭔지 아세요?"),
			() => this.s("유미", "얼마 전에 말씀드렸는데."),
			() => this.s("나", "명물?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_18"),
			() => this.s("유미", "오로라잖아요, 오로라!"),
			() => this.s("유미", "제가 진짜 오로라가 뭔지 제대로 보여드릴게요."),
			() => this.s("유미", "일주일 안에는 분명히 보일 거에요."),
			() => this.s("유미", "5월은 오로라가 가장 잘 보이는 기간이거든요!"),

			() => this.t("어렴풋이 기억났다."),
			() => this.t("남반구에서, 그것도 중위도에서 보이는 유이한 오로라."),
			() => this.t("그것은 호주의 이름의 유래가 될 정도로 이 나라와는 뗄래야 뗄 수 없는 관계라나."),
			() => this.t("유미는 자신만만한 미소를 지으며 주먹을 쥐었다."),

			() => this.s("나", "오로라는 어떤 느낌이야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "30년 동안이나 봤지만, 여전히 아름답게 보여요."),
			() => this.s("유미", "오로라의 명소라고는 하지만 생각만큼 자주 보이는 건 아니거든요."),
			() => this.s("유미", "그래서 질릴 걱정은 없어요."),
			() => this.s("나", "그럼 일주일 안에 못 볼 수도 있는 거 아니야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "관리자님도 참, 말이 씨가 된다고요."),
			() => this.s("유미", "재수 없는 말씀은 그쯤 해두세요."),

			() => this.t("말마따나 과도한 비관은 독이다."),
			() => this.t("여전히 고쳐지지 않는 나쁜 습관이다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_28"),
			() => this.s("유미", "앞으로 얼마 남지 않은 시간이지만, 잘 부탁드려요."),

			() => this.t("유미가 환하게 웃으며 손을 내밀었다."),
			() => this.t("많은 모습이 겹쳐보였다."),
			() => this.t("과거의 나, 과거의 유미, 현재의 나, 그리고 우리의 미래."),
			() => this.t("잠자리의 눈으로 본 세상처럼 겹쳐진 세상을 향해, 나는 손을 내밀었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_9"),
			() => this.s("유미", "저만 믿으세요, 관리자님!"),
			() => this.s("유미", "꼭 오로라를 보여드리고 말 테니까요!"),

			() => this.t("… 네 맘대로 되는 일이 아니잖아."),
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
