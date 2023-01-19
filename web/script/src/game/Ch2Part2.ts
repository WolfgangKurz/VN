import Game from "..";

import Sprite from "@/core/Sprite";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch2Part3";

export default class GameCh2Part2 extends GameScript {
	public readonly scriptName: string = "Ch2Part2";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Talk_05",
				volume: 100,
			}),
			() => {
				this.lock();

				this.bg("5_radar(moss day time)", async bg => {
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

			() => this.t("유미와 마찬가지로 활동하기 편한 옷으로 갈아입은 나는 건네받은 아이스박스를 들고 기지국을 나섰다."),
			() => this.t("아무리 바이오로이드라지만 무거운 짐을 혼자 드는 것이 조금 안쓰러웠다."),

			() => this.sel(
				{ key: "1", text: "역시 조금 들어줄까…?" },
				{ key: "2", text: "괜히 나섰다가는 오히려 방해만 될 것 같은데…." },
			),
			() => this.close(),

			...this.when("1", [
				() => this.scg(1, "SCG/STD_04V2_17"),
				() => this.s("유미", "네? 저는 괜찮아요!"),
				() => this.s("유미", "이거 진짜 무거워서 관리자님은 못 드실 텐데...."),

				() => this.t("그 말에 오히려 자존심이 상했다."),
				() => this.t("아무리 그래도 남자인데…."),

				() => this.s("나", "오르막길 전까지만 들어줄게."),

				() => this.scg(1, "SCG/STD_04V2_16"),
				() => this.s("유미", "음… 알겠어요. 후회하지나 마세요~"),

				() => this.scg(1, "SCG/STD_04_16"),

				() => AudioManager.playSE({
					name: "4-3_Boom!",
					volume: 100,
				}),

				() => this.t("유미가 가방을 땅에 내려놓자 불길한 소리가 났다."),
				() => this.s("나", "쾅…?"),

				() => this.t("그렇다고 여기에서 물러나면 밤에 이불을 걷어찰 지도 모른다."),
				() => this.s("나", "흐읍..."),
				() => this.t("뭐야, 이거 왜 안 움직여."),

				() => this.scg(1, "SCG/STD_04_16"),
				() => this.s("유미", "…."),

				() => this.t("… 젠장, 괜한 허세를 부렸다."),

				() => this.s("나", "이거! 더럽게! 무거워!"),

				() => this.scg(1, "SCG/STD_04_15"),
				() => this.s("유미", "… 이리 주세요. 그냥 제가 들게요."),

				() => this.t("유미는 낑낑대며 아등바등하는 나를 한심한 눈빛으로 바라보더니 이내 가방을 빼앗아 다시 매었다."),
				() => this.t("그것도 아주 가볍게."),

				() => this.scg(1, "SCG/STD_04V2_10"),
				() => this.s("유미", "이래 봬도 어지간한 운동선수보다 강하거든요?"),
				() => this.s("유미", "관리자님이 약하신 게 아니니까 너무 상심하지 마세요."),

				() => this.t("내 일말의 자존심이 완벽히 뭉개지는 순간이었다."),
				() => this.t("… 가만히 있을걸."),
			]),
			...this.when("2", [
				() => this.t("역시 가만히 있자."),
				() => this.t("척 봐도 엄청나게 무거운 공구들이 잔뜩 들어있었다."),
				() => this.t("하물며 강화 시술을 받지도 않은 내가 들 수 있을 리는 만무하다."),

				() => this.s("나", "무겁지 않아?"),

				() => this.scg(1, "SCG/STD_04V2_2"),
				() => this.s("유미", "관리자님도 참, 절 뭐로 보시는 거예요?"),
				() => this.s("유미", "예전에는 돌도 씹어먹고 다녔다고요."),
				() => this.s("나", "…."),

				() => this.scg(1, "SCG/STD_04V2_12"),
				() => this.s("유미", "그래도, 걱정해주셔서 감사해요."),

				() => this.t("과장이 섞이기는 했지만, 확실히 힘든 기색조차 보이지 않았다."),
				() => this.t("자기가 괜찮다는데 어찌할 수는 없겠지...."),
			]),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(1.5);
				this.unlock();
			},
			() => AudioManager.playBGM({
				name: "Forest_of_Elves",
				volume: 100,
			}),

			() => this.t("유미는 힘들지도 않은지 척척 걸어 나갔다."),
			() => this.t("사람이 비교적 자주 다녔기 때문인지 어제보다 덜 거친 숲을 지나자 곧 호수가 모습을 드러냈다."),

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

			() => this.s("나", "우와…"),

			() => this.scg(1, "SCG/STD_04V2_2"),
			() => this.s("유미", "실제로 보는 건 처음이시죠?"),
			() => this.s("유미", "이게 바로 세인트 클레어 호수예요."),

			() => this.t("사진으로 보았던 것과는 완전히 달랐다."),
			() => this.t("마을로 가는 길에 탔던 트럭에서 곁눈질로 보았던 것과도 비교할 수 없었다."),
			() => this.t("호수를 뒤덮은 안개와 그것을 일주하는 새들의 무리가 조화롭게 뒤섞인 이곳은 마치 마법에 걸려 시간이 멈춘 듯 아름다웠다."),

			() => this.scg(1, "SCG/STD_04V2_2"),
			() => this.s("유미", "도시에서는 절대 볼 수 없는 풍경이죠?"),
			() => this.s("유미", "비록 안 좋은 계기로 오게 되셨지만, 자신에게 주는 휴식이라 생각하고 즐기셨으면 좋겠어요."),
			() => this.s("유미", "이런 기회가 흔한 것도 아니잖아요?"),

			() => this.t("말하는 법도 잊고 제자리에 서서 감탄했다."),
			() => this.t("손을 뻗으면 닿을 듯한 자연의 신비가 온 세상에 펼쳐져 있었다."),
			() => this.t("이대로 돗자리를 펴고 앉아 식사를 즐기고 싶었지만, 정상에서의 유희를 위해 덮어두기로 했다."),
			() => this.t("잠시 그 흥취에 취하여 안개 속으로 사라져가는 호수를 감상하던 우리는 곧 그것을 빙 돌아 크래들산의 등산로로 향했다."),

			() => this.t("산은 의외로 가파르지 않고 잘 관리되어 있었다."),
			() => this.t("수풀이 우거지거나 땅이 질퍽하지도 않았지만, 역시 사람이 오간 흔적은 없었다."),
			() => this.t("유미가 자기가 관리한 것이라고 자랑하듯이 말했으나 귀에 들어오지는 않았다."),
			() => this.t("왜냐하면…."),

			() => this.s("나", "저기… 유미야…."),

			() => this.scg(1, "SCG/STD_04V2_11"),
			() => this.s("유미", "네?"),
			() => this.s("나", "잠깐만 쉬다 가자…."),

			() => this.t("회사 일에 찌든 현대인의 폐해다."),

			() => this.scg(1, "SCG/STD_04V2_10"),
			() => this.s("유미", "…."),
			() => this.s("나", "죽을 것 같아…."),

			() => this.scg(1, "SCG/STD_04V2_10"),
			() => this.s("유미", "저희 이제 20분밖에 안 걸은 거 아시죠?"),
			() => this.s("나", "…."),

			() => this.scg(1, "SCG/STD_04V2_15"),
			() => this.s("유미", "밀어드릴 테니까 빨리 가요."),
			() => this.s("나", "아니, 그렇게까지는…."),

			() => this.scg(1, "SCG/STD_04V2_7"),
			() => this.s("유미", "그럼 징징대지 마셨어야죠!"),

			() => this.t("시어머니처럼 꾸짖는 폭거에 아무 말도 할 수가 없었다."),
			() => this.t("나는 등산을 따라온 아이처럼 질질 끌려 산등성이를 계속 올랐다."),
			() => this.t("유미는 칭얼대는 내게 핀잔을 주면서도 주머니에 숨겨뒀던 간식을 건네며 달래주었다."),
			() => this.t("정말 애가 된 기분이었다."),

			() => this.scg(1, "SCG/STD_04V2_19"),
			() => this.s("유미", "이제 정말 얼마 안 남았어요. 힘내요!"),

			() => this.t("너 그 말 한 시간 전에도 했거든?"),
			() => this.t("차갑게 식은 숨을 몰아쉬며 고개를 들어도 꼭대기는 보일 기미가 없다."),
			() => this.t("뒤를 슬쩍 돌아보니 유미도 슬슬 지쳐가는 것 같았다."),
			() => this.t("오히려 저 무거운 짐을 짊어지고도 여기까지 올라온 것이 용한 지경이었다."),
			() => this.t("바이오로이드라도 사람보다 강할 뿐이지 무한동력은 아니니까."),
			() => this.t("유미는 비 오듯 땀을 흘리면서도 힘들다는 탄식 한번 없이 도리어 사기를 북돋아 주었다."),
			() => this.t("여기는 안개조차 자취를 감춘 해발 1500미터의 고도."),
			() => this.t("슬슬 숨을 쉬는 것조차 고통스러웠다."),
			() => this.t("대체 누가 이런 곳에 통신 장비를 만들 생각을 한 건지 원망스러웠다."),
			() => this.t("그 실무자가 이곳을 한 번이라도 올랐다면 그런 말은 꺼내지도 못했을 것이다."),
			() => this.t("이게 다 탁상행정의 부조리 탓이다."),

			() => this.scg(1, "SCG/STD_04V2_19"),
			() => this.s("유미", "물 너무 많이 드시면 안 돼요…."),

			() => this.t("부족한 산소를 대신하기라도 하는 것인지 몸은 계속해서 수분을 갈구했다."),
			() => this.t("이런 상황에서 자꾸 물을 들이켰다가는 물 중독에 걸리기에 십상이지만, 애석한 몸뚱이는 말을 들으려는 마음이 전혀 없다는 듯이 비명을 질렀다."),
			() => this.t("물통을 대신하여 유미가 건넨 작은 산소병을 들이마시자 그나마 호흡이 균질해졌다."),
			() => this.t("그마저도 없었다면 고산병이나 물 중독으로 고생깨나 했을 것이다."),

			() => this.s("나", "너 엄청 더워 보이는데… 소매라도 걷지 그래…?"),

			() => this.scg(1, "SCG/STD_04V2_26"),
			() => this.s("유미", "사양할게요."),
			() => this.s("나", "ㅇ, 어어… 미안."),

			() => this.t("순간적으로 눈빛이 매서워졌다."),
			() => this.t("나도 모르는 새에 실례라도 했나…?"),

			() => this.scg(1, "SCG/STD_04V2_2"),
			() => this.s("유미", "헤헤, 방금 일은 사과드릴게요."),
			() => this.s("유미", "너무 힘들어서 신경이 날카로워졌었나 봐요."),

			() => this.t("유미가 언제 그랬냐는 듯이 활력을 되찾았을 때였다."),

			() => AudioManager.fadeOutBGM(1.5),
			async () => {
				this.lock();
				if (this.isReady) await this.wait(1.5);
				this.unlock();
			},
			() => AudioManager.playBGM({
				name: "Summer_01",
				volume: 100,
			}),

			() => this.s("나", "저거… 설마 정상이야?"),

			() => this.scg(1, "SCG/STD_04V2_28"),
			() => this.s("유미", "네…! 끝이 보이네요! 다 왔어요!"),

			() => this.t("당장이라도 주저앉고 싶은 충동이 매섭게 치닫던 찰나, 말끔히 갠 하늘에 드디어 봉우리가 모습을 드러냈다."),
			() => this.t("지친 것도 잊은 채 땀으로 무겁게 젖은 다리를 움직여 정상으로 향했다."),
			() => this.t("구름마저 잡힐 것 같은 꼭대기에 마침내 발을 디딘 나는 쓰러지듯 드러누웠다."),
			() => this.t("하늘은 맑고, 햇살은 흐드러지게 밝았다."),
			() => this.t("유미도 지고 있던 가방을 내려놓으며 내 옆에 누웠다."),
			() => this.t("중독성 있게 달콤한 향이 섞인 땀내가 물씬 풍겼다."),
			() => this.t("바이오로이드는 체취도 좋은 모양이었다."),

			() => this.scg(1, "SCG/STD_04_19"),
			() => this.s("유미", "헤엑… 헤엑… 고생, 하셨어요…."),

			() => this.t("우리는 그렇게 한참이나 땅을 등진 채로 마치 거인들의 식탁처럼 보이는 산의 정상에 누워 깨끗하고 찬 공기를 향유했다."),
			() => this.t("별것 아닌 발걸음이라고 생각할 수도 있겠지만, 무언가 해냈다는 성취감에 끓는 듯한 희열이 느껴졌다."),

			() => this.scg(1, "SCG/STD_04_28"),
			() => this.s("유미", "우리, 슬슬 점심 먹을까요?"),
			() => this.s("나", "그럴까? 벌써 해가 중천이네."),

			() => this.t("… 아니, 잠깐. 그게 왜 여기서 나와?"),

			() => this.scg(1, "SCG/STD_04_11"),
			() => this.s("유미", "라면 싫어하세요?"),
			() => this.s("나", "아니, 라면은 어떻게 구했고 가스버너는 왜 챙겨온 거야?"),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "라면은 반년 전쯤에 마을에 구호품 사러 갈 때 샀죠."),
			() => this.s("유미", "버너는 이럴 때 아니면 언제 또 써 보겠어요?"),

			() => this.t("할 말을 잃었다. 그러니까 가방이 무겁지…."),
			() => this.t("게다가 저건 한국의 라면이 아닌가."),

			() => this.scg(1, "SCG/STD_04_18"),
			() => this.s("유미", "방금 한국 라면이 왜 여깄는지 물어보려고 하셨죠?"),
			() => this.s("나", "귀신같네."),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "한국 라면은 호주에서도 인기가 좋거든요~"),
			() => this.s("유미", "그 특유의 매운맛이 살아있다고나 할까…."),

			() => this.t("라면의 포장지를 보자 고향에 온 것 같은 정겨움을 느꼈다."),

			() => this.scg(1, "SCG/STD_04_10"),
			() => this.s("유미", "그래도 자주는 못 먹어요."),
			() => this.s("유미", "회사 방침상 일 년이 지나기 전까지는 공원 바깥으로 못 나가서 아껴 먹어야 하거든요."),
			() => this.s("유미", "그 이후로는 생활용품 구매를 사유로 잠깐 외출할 수 있지만요."),
			() => this.s("유미", "그래도 기본적인 생필품 정도는 드론을 통해 주기적으로 배송해줘서 다행이죠."),

			() => this.t("회사의 방침이라..."),
			() => this.t("공원 내부의 길만 유독 정돈된 까닭은 그래서였나."),
			() => this.t("마을에서 기지국으로 향하는 길은 거의 사용하지 않으니 수풀이 우거진 것이었고."),
			() => this.t("유미는 정말 무인도에 갇힌 것과 다름없는 생활을 하고 있었다."),

			() => this.scg(1, "SCG/STD_04_3"),
			() => this.s("유미", "그런 표정으로 보지 마세요~"),
			() => this.s("유미", "전에도 말씀드렸지만 바이오로이드는 외로움 같은 거 못 느끼니까."),
			() => this.s("유미", "심심하기는 해도 여기저기 돌아다니면 지루할 새도 없고요."),
			() => this.s("나", "이 공원에서 나갈 방법은 아예 없는 거야?"),

			() => this.scg(1, "SCG/STD_04_11"),
			() => this.s("유미", "글쎄요? 어제 관리자님을 모시러 갔던 것처럼 인간님과 관련된 경우라면 또 모를까…."),

			() => this.t("바이오로이드는 노화조차 느리다."),
			() => this.t("그렇기에 시간의 흐름 역시 더디게 느낀다고 한다."),
			() => this.t("태산을 움직이고도 남을 듯한 30년의 세월 동안 그녀는 어떤 생각으로 살아왔을까."),
			() => this.t("오랜만에 잠긴 나름대로 진지한 사색은 얼마 지나지 않아 코를 후비는 강렬한 냄새에 지워지고 말았다."),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "아, 라면 다 끓었다."),
			() => this.s("유미", "뚜껑에 돌을 올려놨으니까 설익지는 않았을 거예요."),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_06.png", async (pic, sprite) => {
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

			() => this.t("바로 이 냄새지."),
			() => this.t("어제 항구 도시에서 먹었던 해산물의 비린 맛이 아직도 지워지지 않고 있었기에 한국의 매콤함이 그리웠던 참이었다."),

			() => AudioManager.playSE({
				name: "2-5_Ramen",
				volume: 100,
			}),

			() => this.s("나", "크으…."),

			() => this.t("사나이를 울리는 얼큰한 맛이다."),
			() => this.t("외지에 나간 사람들이 흔히 향수병에 걸리는 이유를 알 것 같았다."),

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

			() => this.scg(1, "SCG/STD_04_17"),
			() => this.s("유미", "흐읍… 관리자님은 안 매우세요?"),
			() => this.s("나", "괜찮은데?"),

			() => this.scg(1, "SCG/STD_04_5"),
			() => this.s("유미", "쓰으읍… 죽을 것… 같아…."),

			() => this.t("물통을 슬쩍 건네자 순식간에 한 통을 다 비워버렸다."),
			() => this.t("이게 그렇게까지 맵나...?"),
			() => this.t("유미는 눈물 콧물 다 흘리면서도 젓가락질을 멈추지는 않았다."),
			() => this.t("의외로 능숙하게 면을 빨아들이는 모습에 조금 놀랐다."),
			() => this.t("그 모습만 보면 영락없는 한국 사람이었다."),

			() => this.scg(1, "SCG/STD_04_19"),
			() => this.s("유미", "하아… 잘 먹었다."),
			() => this.s("유미", "혀가 아직도 얼얼하기는 하지만."),

			() => this.t("상황이 이렇게 되니 정작 본분을 잊은 기분이 들었다."),
			() => this.t("지금 우리의 모습은 정비가 아니라 캠핑하러 온 관광객에 가까웠다."),
			() => this.t("문득 뒤를 돌아보니 산 끄트머리에 우직하게 서 있는 이질적인 물체가 시야에 들어왔다."),
			() => this.t("저것이 아마 유미가 말했던 통신기겠지."),
			() => this.t("덩치에 비해 다소 얇은 기둥에 거대한 철 상자가 달린 형태의 그것에 덕지덕지 엉킨 전선이 지상으로 향하고 있었다."),
			() => this.t("전체적인 높이는 유미의 키와 비슷한 정도였다."),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "이제 밥도 먹었겠다, 일을 시작해볼까요?"),
			() => this.s("유미", "어려운 부분은 제가 할 테니까 관리자님은 시키는 것만 따라 해주세요."),

			() => this.t("가방 정리를 마친 유미는 시원하게 기지개를 피며 통신기 앞으로 가서 공구들을 주르르 늘어놓았다."),
			() => this.t("생각보다 할 일이 많은지, 그것이 아니면 단지 구조가 복잡해서인지 생전 처음 보는 도구들이 연이어 모습을 드러냈다."),

			() => this.scg(1, "SCG/STD_04_1"),
			() => this.s("유미", "관리자님, 버니어 캘리퍼스 좀 주실래요?"),
			() => this.s("나", "이거?"),

			() => this.scg(1, "SCG/STD_04_16"),
			() => this.s("유미", "그 옆에 있는 거요."),

			() => this.t("유미는 멍한 표정으로 뚝딱뚝딱 잠금쇠를 해제하더니 곧 온갖 측량기와 공구를 사용해 내부를 점검하였다."),
			() => this.t("문득 느껴지는 위화감에 소름이 돋을 정도였다."),
			() => this.t("기묘했다."),
			() => this.t("방금까지의 다정하고 생기 있던 눈빛이 예리하게 벼려져 전선들의 틈을 훑었다."),
			() => this.t("단지 집중했기 때문인지, 정말 다른 사람이 된 것인지 헷갈릴 정도였다."),

			() => this.scg(1, "SCG/STD_04_15"),
			() => this.s("유미", "음, 큰 이상은 없네요."),

			() => this.scg(1, "SCG/STD_04_1"),
			() => this.t("아무래도 높이 있다 보니 동물들의 영향으로부터는 안전하거든요."),
			() => this.t("이렇게까지 높이 있는 이유가 괜한 게 아니라구요."),
			() => this.t("한 번 오기는 힘들어도 자주 올 필요는 없어지니까요."),

			() => this.t("그런 깊은 뜻이 있었다니."),
			() => this.t("단순히 오기 힘들다는 표면적인 사유에 사로잡혀 탁상행정으로 치부한 내가 어리석게 느껴졌다."),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "슬슬 내려갈까요?"),
			() => this.s("유미", "아니면 조금 더 쉬다 내려가실래요?"),

			() => this.t("이곳은 그다지 넓지 않은 평지다."),
			() => this.t("게다가 안개에 가려져 지면의 경치도 보이지 않으니 여기에 더 볼일은 없을 것 같다. 내려가자."),
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