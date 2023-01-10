import Game from "..";

import Sprite from "@/core/Sprite";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch3Part4";

export default class GameCh3Part3 extends GameScript {
	public readonly scriptName: string = "Ch3Part3";

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

			() => this.t("피크닉 장소는 그보다 조금 더 고지대에 있는 평원이었다."),
			() => this.t("호수 전체가 그대로 내려다보이는 들판인데, 나무가 많이 없는 탁 트인 고원이라 햇볕이 따사로이 비춰 소풍 장소로는 딱 맞았다."),
			() => this.t("호수를 조금 돌아 도착한 그곳은 여전히 푸른 잔디가 생명력을 드러내고 있었다."),
			() => this.t("시야를 넓히면 마을까지 볼 수 있는 전망 좋은 언덕이었다."),
			() => this.t("절벽 근처에 돗자리를 편 우리는 손가방에 고이 모셔온 도시락부터 먹기로 했다."),

			() => {
				AudioManager.playBGM({
					name: "WithYou_01",
					volume: 100,
				});
				AudioManager.fadeInBGM(1.5);
			},

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "오늘의 도시락은…"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_9"),
			() => this.s("유미", "미트파이와 머랭 쿠키입니다~"),
			() => this.s("나", "와~"),
			() => this.s("나", "… 근데 다 주민분들이 싸주신 거 아니야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_17"),
			() => this.s("유미", "뭐, 저는 도시락 같은 거 못 싸니까요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_21"),
			() => this.s("유미", "그래도 관리자님이 원하시면 배워볼 수도…."),
			() => this.s("나", "유미가 해주는 음식은 인스턴트밖에 못 먹어봐서 궁금하긴 하네."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_7"),
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
			() => this.s("유미", "요리 못해서 죄송하네요!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_14"),
			() => this.s("유미", "냠… 그 와중에 맛있네…."),

			() => this.t("미트파이를 한 움큼 잘라 입안에 밀어 넣은 유미의 볼이 빵빵하게 부풀어 올랐다."),
			() => this.t("그 작은 입에 저렇게 큰 음식이 한 번에 들어가는 신묘한 광경을 직관할 때마다 놀라고는 한다."),
			() => this.t("씩씩대면서도 우물우물 씹어 꿀꺽 넘기는 모습이 있지도 않은 딸을 보는 것 같아 미소가 났다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_11"),
			() => this.s("유미", "… 왜 그런 표정으로 보세요?"),
			() => this.s("나", "아, 잘 먹는 게 보기 좋아서."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_14"),
			() => this.s("유미", "이제 반밖에 안 남았거든요?"),
			() => this.s("유미", "빨리 안 드시면 제가 다 먹을 거예요."),
			() => this.s("나", "야, 너 언제…!"),

			() => this.t("먹는 걸 보기만 하다 정신을 차리니 어느덧 미트파이 절반이 유미의 뱃속으로 사라진 상태였다."),
			() => this.t("남은 조각을 겨우 사수한 덕분에 굶긴 배는 채울 수 있었다."),
			() => this.t("조금 식었으나 특유의 진한 풍미와 고기의 쫀득한 질감은 여전히 살아 있었다."),
			() => this.t("디저트로 작은 비닐봉지에 싸 온 머랭 쿠키마저 순식간에 해치운 우리는 배가 부른 데다 온화하게 내리쬐는 햇볕에 노곤해져 쓰러지듯 돗자리 위에 드러누웠다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_25"),
			() => this.s("유미", "하암… 좋네요, 정말."),
			() => this.s("나", "나중에 죽으면 여기에 묻히고 싶어."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_25"),
			() => this.s("유미", "또 재수 없는 소리 하신다."),
			() => this.s("유미", "어휴, 관리자님은 기껏 소풍 나와서 품은 목표가 그런 거예요?"),
			() => this.s("유미", "저는 언젠가 진짜 대도시에 가서 어떤 일이든 척척 해내는 멋진 여자로 살고 싶어요."),
			() => this.s("유미", "호주의 자연이 싫은 건 아니지만… 저는 본능적으로 도시에서의 삶을 꿈꾸게 되어 있는걸요."),
			() => this.s("유미", "주입된 꿈이라고 해도 상관없어요."),
			() => this.s("유미", "꿈은 누구나 꿀 수 있는 거잖아요?"),

			() => this.t("어쩌면 정말 별것 아닌 말이지만, 나는 내심 놀랐다."),
			() => this.t("당장 내일이 막막해 보이던 그녀가 꿈이라니."),
			() => this.t("과거의 그림자에 얽매여 방황하던 예전과는 달리, 마침내 미래를 바라보게 되었다는 긍정적인 징조라고 봐도 무방했다."),
			() => this.t("정작 자신은 그리 의식하지 않고 있었으나 분명히 알 수 있었다."),

			() => this.t("함께 램파트를 청소했던 날 이후로 유미의 미소 어딘가에서 느껴지던 애처로움은 자취를 감추었다."),
			() => this.t("다음 날, 그다음 날이 되어서도 해맑게 웃어주었다."),
			() => this.t("그 순수한 영혼에 영향을 받은 덕분이었을까."),
			() => this.t("별것 아닌 일상이어도, 그녀와 함께하면 절로 웃음이 났다."),
			() => this.t("지금은 오히려 내가 유미에게 배우는 것이 더 많아진 것 같았다."),

			() => this.s("나", "너무 과한 꿈 아니야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_19"),
			() => this.s("유미", "으으, 최악. 그럴 때는 할 수 있다고 응원해주셔야죠."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_25"),
			() => this.s("유미", "마음을 다해서 간절히 바라면 온 우주가 나서서 도와준다고 하잖아요."),
			() => this.s("유미", "웃기게 보일지는 몰라도 어두운 상황에서 이런 실낱 같은 희망의 존재는 하루라도 더 살아갈 힘을 줘요."),
			() => this.close(),

			() => this.scg(1, "SCG/ STD_01_2"),
			() => this.s("유미", "무엇보다… 그렇게 바라고 바라며 버텼더니 결국 관리자님과 만났잖아요?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_12"),
			() => this.s("유미", "그래서 믿어보려고요."),
			() => this.s("유미", "뭐… 이렇게 열심히 일하다가 상부의 눈에 띄어서 운 좋게 승진이라도 하면 관리자님 따라서 정말 도시에 갈 수 있을지도 모르는 일이고요."),

			() => this.t("마치 다른 사람이 된 것 같았다."),
			() => this.t("근심이 가득 서렸던 유미의 눈동자는 이제 미래를 향한 희망으로 가득 차 있었다."),
			() => this.t("그녀가 눈에 띄게 밝아졌다는 그 사실만으로도 괜스레 웃음이 났다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_12"),
			() => this.s("유미", "관리자님, 솔직히 아직도 믿기지가 않아요."),

			() => this.t("평탄한 목소리가 늦가을의 바람을 타고 흘렀다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_25"),
			() => this.s("유미", "이렇게나 막연하게 웃을 수 있는 날이 올 거라고는 생각도 못 했어요."),
			() => this.s("유미", "그날 오로라를 보고 마음을 고치길 잘한 것 같네요."),
			() => this.s("나", "웬 오로라?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_17"),
			() => this.s("유미", "앗…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_29"),
			() => this.s("유미", "에헤헤, 그냥 혼잣말이에요."),
			() => this.s("유미", "그러고 보니 관리자님이 오신 뒤로는 오로라가 뜬 적이 없네요?"),
			() => this.s("유미", "거의 1년은 지났는데."),
			() => this.s("나", "음… 그렇지."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_25"),
			() => this.s("유미", "곧 오로라 시즌이니까 볼 기회가 올 거예요."),
			() => this.s("유미", "생각만큼 자주 보이는 건 아니지만."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => {
				AudioManager.playBGM({
					name: "HeartbeatOME",
					volume: 100,
				});
				AudioManager.fadeInBGM(1.5);
			},

			() => this.t("그 뒤로 한 시간 남짓 되는 시간 동안 흐드러진 햇살에 살을 태운 우리는 잠시 창고로 향하기로 했다."),
			() => this.t("이제 통신 설비 확충 작업은 마무리만 남겨둔 상태였다."),
			() => this.t("돌아오는 길에 겸사겸사 깔끔한 마무리를 위한 연장까지 챙겨오려는 계획이었다."),
			() => this.t("원래 있던 창고였다면 꽤 먼 길을 돌아가야 했겠지만, 그럴 필요는 없었다."),

			() => this.t("최근 연이어 내린 소나기에 지반이 붕괴하여 산사태가 일어난 바람에 새로 만들었기 때문이다."),
			() => this.t("비록 일부가 파손된 수준이었으나 워낙 오래된 창고여서 추가 붕괴의 위험도 존재하고 위치상으로도 영 실용적이지 못했으므로 수리하기보다는 이 근처에 아예 새로 짓게 된 것이었다."),
			() => this.t("마을과도 가깝고, 기지국과 호수를 이어주는 요충지라서 장비를 들고 나르기에도 좋았다."),
			() => this.close(),

			() => {
				this.lock();

				this.picture(-1, "../BG/15_garage_on.jpg", async (pic, sprite) => {
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

					this.bg("15_garage_on", async bg => {
						if (!bg) return this.unlock();

						bg.startFadeIn(0);
						this.picture(-1, null);

						this.unlock();
					});
				});
			},

			() => this.scg(1, "SCG/STD_04_16"),
			() => this.s("유미", "관리자님~ 깔깔이 좀 주세요~"),
			() => this.s("나", "이거 맞지?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_3"),
			() => this.s("유미", "나도 참, 또 깔깔이라고 그러네."),
			() => this.s("유미", "관리자님, 정확히 뭐라고 부른다고 했죠?"),
			() => this.s("나", "ㄹ, 라쳇 핸들 렌치?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "헤헤, 장족의 발전이네요."),
			() => this.s("유미", "용도는 어떻게 되죠?"),
			() => this.s("나", "스패너나 렌치랑 똑같지만, 운동 방향을 한쪽으로 제한할 수 있는 특징이 있어."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_9"),
			() => this.s("유미", "올~ 역시 의외로 똑똑하시다니까요."),
			() => this.s("유미", "대기업 입사한 게 우연은 아니었나 봐~"),
			() => this.s("나", "의외라니…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_12"),
			() => this.s("유미", "맨날 실수해서 저한테 혼나던 시절이 엊그제 같은데."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "그때 기억나세요?"),
			() => this.s("유미", "관리자님이 전선을 테이핑하라는 말을 컷팅으로 잘못 이해한 바람에 기지국 전기가 싹 나가버렸잖아요."),
			() => this.s("유미", "제가 그거 복구하느라 얼마나 고생했는지…."),
			() => this.s("나", "미안…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_12"),
			() => this.s("유미", "아뇨, 오히려 고맙게 생각해요."),
			() => this.s("유미", "보통 사람들은 ‘바이오로이드니까’ 일을 전담하는 걸 당연하게 여기잖아요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "반면 관리자님은 서툴게나마 도와주려고 하시고…"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_16"),
			() => this.s("유미", "아, 바이스 플라이어랑 니퍼 좀 주실래요?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "고마워요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_21"),
			() => this.s("유미", "아무튼, 관리자님은 확실히 좋은 분이세요."),
			() => this.s("유미", "적어도 제가 봤던 사람 중에서는 손에 꼽을 만큼."),

			() => this.t("공구함에서 도구를 챙기는 동안에도 유미는 온통 칭찬 일색이었다."),
			() => this.t("그저 해야 할 일을 했을 뿐임을 알면서도 묘하게 상기되었다."),
			() => this.t("물론 당연히 내게 주어진 업무였기 때문도 있었지만, 유독 학구열이 불탔던 것은 사람들의 반응 덕분이었다."),

			() => this.t("한 달이 지난 지금, 주민들과 우리는 가족이나 다름없는 관계가 되었다."),
			() => this.t("덕분에 기지국의 평판은 날로 올랐다."),
			() => this.t("업무 시간은 줄었으나 능률이 올라 통신의 질도 향상되었다."),
			() => this.t("장비를 개조하고, 수리하고, 신설한 끝에 오지의 주민들까지도 빠른 전파의 혜택을 누릴 수 있었다."),

			() => this.t("그럴 때마다 주민들은 거리낌 없이 우리에게 감사를 표했다."),
			() => this.t("이곳에 있는 공구 일부는 주민들의 지원으로 구매한 것이었다."),
			() => this.t("무너진 창고를 세우는 것 역시 그들의 도움이 아니었다면 꿈도 꾸지 못했으리라."),
			() => this.t("턱없이 부족한 노동력을 채워준 덕분에 겨우 일주일이라는 짧은 시간으로도 이곳을 재건할 수 있었다."),

			() => this.t("그들의 노고에 보답하기 위해 나는 더 열심히 공부했다."),
			() => this.t("유미의 기술을 어깨너머로 배우고, 어려운 장비와 부품의 이름을 외우고…"),
			() => this.t("지금에 이르러서는 조수 노릇 정도는 할 수 있게 되었다."),
			() => this.t("나름대로 보람이 있는 일이었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04_2"),
			() => this.s("유미", "음, 이걸로 다 챙긴 것 같네요."),
			() => this.s("유미", "슬슬 가볼까요?"),

			() => this.t("주섬주섬 주워 담던 도구로 어느새 가방이 꽉 채워졌다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_2"),
			() => this.t("나는 작은 공구들이 담긴 빨간 상자를 손에 들고, 유미가 다른 부품이나 설계도가 담긴 큰 배낭을 메었다."),

			() => this.s("나", "근데 이건 왜 갖다둔 거야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_16"),
			() => this.s("유미", "아, 그거요? EMP에요."),
			() => this.s("나", "그런 걸 왜 여기에 둬!"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_18"),
			() => this.s("유미", "음, 일종의 비밀병기 같은 느낌?"),
			() => this.s("유미", "외계인이 쳐들어오기라도 하면 저희도 무기 하나는 있어야죠~"),
			() => this.s("나", "재수 없는 소리 하지 말라던 게 누군데…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_9"),
			() => this.s("유미", "아무렴 어때요~ 얼른 가서 쉽시다!"),

			() => this.t("이번 개조가 끝나면 주민들은 전보다 2배 이상 빠른 통신을 누릴 수 있다."),
			() => this.t("소식을 듣고 기뻐할 모습을 상상하니 절로 웃음꽃이 폈다."),
			() => this.t("그것은 유미도 마찬가지였는지 가방에 각종 금속이 가득해 꽤 무거울 텐데도 힘든 기색 하나 보이지 않았다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_2"),
			() => this.s("유미", "분명 다들 좋아할 거예요."),
			() => this.s("유미", "그동안은 대역 폭이 작은 데다가 범위도 좁아서 가끔 렉이 발생했는데 이젠 그럴 걱정도 없겠죠."),
			() => this.s("유미", "10년도 더 된 기술로 지금까지 생활해 주신 주민분들께 죄송할 따름이에요."),
			() => this.s("나", "그동안은 겨를이 없었잖아."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_04V2_3"),
			() => this.s("유미", "그래도… 헤헤, 그렇네요."),
			() => this.s("유미", "지금부터라도 바꿔나가면 되는 거겠죠."),
			() => this.s("유미", "… 표정이 왜 그러세요?"),

			() => this.t("자못 코끝이 찡한 순간이었다."),
			() => this.t("그녀의 성격이 환해짐에 따라 주변의 광경도 함께 바뀌어 갔다."),
			() => this.t("인프라가 확장되고, 길이 깨끗해지고, 통신은 원활해졌다."),
			() => this.t("유미가 선물하는 하루하루는 놀라움의 연속이었다."),

			() => this.t("그녀와 대화하고 노니는 것만으로도 세상은 눈부시게 달라졌다."),
			() => this.t("어딘지 항상 먹구름이 껴 있던 내 마음도 그녀로서 구원받았다."),
			() => this.t("내가 그녀를 구원했듯이, 그녀 역시 나를 구해준 것이었다."),

			() => this.t("함께하는 시간이 늘어날수록 이곳이 좋아졌다."),
			() => this.t("이곳에서 이렇게 평화롭게 보내는 시간이 영원히 계속됐으면 싶었고, 이 고요가 깨지지 않기를 원했다."),
			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),

			() => this.t("그러나 언제나 그렇듯 운명의 굴레는 원하는 바와는 반대로 굴러가는 법이다."),
			() => this.t("단 일 년 만에 실적이 눈에 띄게 올랐다는 소식은 이내 본사의 귀에도 들어간 모양이었다."),
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
