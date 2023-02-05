import Game from "..";

import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch3Part6";

export default class GameCh3Part5 extends GameScript {
	public readonly scriptName: string = "Ch3Part5";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			() => AudioManager.playBGM({
				name: "Mystic",
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

			() => this.t("얼마 전에 일을 마치고 돌아온 뒤, 유미가 몸을 씻으러 잠시 자리를 비운 시간이었다."),

			() => this.s("나", "여보세요."),
			() => this.close(),

			() => this.scg(1, "SCG/SLET_D"),
			() => this.s("본부장", "그동안 잘 지냈나?"),

			() => this.s("나", "설마… 본부장님?"),

			() => this.s("본부장", "그래, 바로 알아듣는구만."),
			() => this.s("본부장", "급히 전할 말이 있어서 말이야."),

			() => this.s("나", "대체 무슨 일이기에 본부장님께서 직접…."),

			() => this.s("본부장", "뭐, 단도직입적으로 말하지."),
			() => this.s("본부장", "이만 돌아오게."),

			() => this.s("나", "… 네?"),

			() => this.s("본부장", "자네가 지난 일 년 동안 올린 실적은 잘 보았어."),
			() => this.s("본부장", "역시 내 안목이 틀리지 않았던 모양이지."),
			() => this.s("본부장", "자네의 멍청한 상사 놈이 멋대로 자넬 호주로 보내버린 바람에 얼마나 당황했는지…."),
			() => this.s("본부장", "최근에 삼안 놈들과의 경쟁에 다시 불이 붙었어."),
			() => this.s("본부장", "인력 하나하나가 귀중한 상황이라는 말이야."),
			() => this.s("본부장", "듣자 하니 저번 채용에서 꽤 우수한 성적으로 입사했던 걸로 아는데, 당장 일주일 뒤에 돌아와 개발 부서에 합류하도록 하게."),

			() => this.s("나", "지금 마무리 중인 작업을 끝내려면 못해도 한 달은…."),

			() => this.s("본부장", "쓰읍. 그건 걱정 말고 돌아오게."),
			() => this.s("본부장", "어차피 그 유미라는 바이오로이드가 처리하면 될 일이 아닌가."),
			() => this.s("본부장", "게다가 그쪽은 애초에 자네 같은 고급 인력까지 할애할 지역이 아니야."),

			() => this.t("천불이 났다."),
			() => this.t("비록 그의 지시는 아니었지만, 나는 속아서 이곳에 왔다."),
			() => this.t("결과적으로는 나와 유미 모두에게 긍정적인 영향을 미치기는 했으나 이제 와서 멋대로 돌아오라니."),
			() => this.t("게다가 혼자 남게 될 유미를 생각하면…"),

			() => this.s("나", "싫습니다."),

			() => this.s("본부장", "뭐야?"),

			() => this.s("나", "… 적어도 진행 중인 작업은 끝마치게 해주십시오."),

			() => this.s("본부장", "쯧. 미쳤구만, 미쳤어."),
			() => this.s("본부장", "젊은이의 패기라는 건가."),
			() => this.s("본부장", "잘 알아두게."),
			() => this.s("본부장", "그런 건 패기가 아니라 오만이라고 하는 게야."),

			() => this.s("나", "구역의 정상적인 유지를 위해서는 커넥터 유미의 재활이 필수적입니다."),
			() => this.s("나", "현재 본 기종은 정신적으로 크게 쇠약해…."),

			() => this.s("본부장", "헛소리는 그쯤 하지."),

			() => this.t("남자의 기세에 눌리고 말았다."),

			() => this.s("본부장", "설마 도구 따위에게 연민이라도 느끼는 겐가?"),
			() => this.s("본부장", "겉보기에는 예쁘고 좋지만, 바이오로이드는 그저 인간의 탈을 쓴 개나 고양이와 다를 바가 없어."),
			() => this.s("본부장", "그런 것에 사랑까지 느끼는 머저리들이 가끔 있지."),
			() => this.s("본부장", "차마 사랑을 나눌 사람이 없어서 그런 물건이나 동물 따위에 사랑을 쏟는 게야."),
			() => this.s("본부장", "인간 말에 복종하는 도구에게 쓸데없이 감정을 쓰지 마."),
			() => this.s("본부장", "우리 회사에 다닐 정도 되는 사람이면 잘 알 거라고 생각했건만…."),
			() => this.s("본부장", "뭐, 그래. 자네는 아직 젊으니 그런 안목이 부족할 수도 있지."),
			() => this.s("본부장", "하지만 잘 알아둬야 해."),
			() => this.s("본부장", "바이오로이드에겐 ‘영혼’이 없다네."),

			() => this.t("이가 빠득 갈렸다."),
			() => this.t("당신이 유미에 대해서 얼마나 안다고 그런 말을 씨불이는 거지?"),
			() => this.t("나는 답지 않게 발끈하여 반문하고 말았다."),

			() => this.s("나", "유미는 단순한 물건이 아닙니다!"),

			() => this.s("본부장", "정말 미친 겐가."),
			() => this.s("본부장", "아니면 내 입에서 꼭 안 좋은 말이 튀어나오게 만들어야 직성이 풀리는 겐가?"),
			() => this.s("본부장", "자네 같은 사람은 불리한 조건이 걸려야 말을 듣더군."),
			() => this.s("본부장", "그 유미라는 ‘인형’, 내 말 한마디면 쥐도 새도 모르게 새것으로 교체해버릴 수도 있어."),

			() => this.s("나", "…!"),

			() => this.s("본부장", "뭐가 더 손해일지 생각해봐."),
			() => this.s("본부장", "어쨌든 자네는 돌아오게 될 걸세."),
			() => this.s("본부장", "아등바등 버티다가 울며 겨자 먹기로 송환될지, 아니면 포기하고 순순히 돌아올지에 대한 선택지만 남은 게야."),
			() => this.s("본부장", "말만 잘 들으면 그 인형에게도 피해는 주지 않겠다고 약속하지."),
			() => this.s("본부장", "나는 아주 공평하고 아량이 넓은 사람이라 오로지 실적만으로 평가하거든."),
			() => this.s("본부장", "이런 사적인 일은 묻고 넘어가 줄 수 있어."),

			() => this.t("통신기를 든 손이 파들파들 떨렸다."),
			() => this.t("힘이 너무 들어간 나머지 입술이 터지고 눈의 실핏줄이 드러났다."),
			() => this.t("내 이기심으로 유미가 폐기된다면… 아니, 그건 절대 안 돼."),
			() => this.t("그런 비극은 목숨을 걸고서라도 막아야만 했다."),

			() => this.s("본부장", "자, 다시 말하지."),
			() => this.s("본부장", "일주일 뒤에 한국으로 복귀하게."),
			() => this.s("본부장", "대답은 듣지 않겠네. 나중에 보지."),

			() => this.s("나", "… 네."),

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.scgFn(1, async (pic, sprite) => {
						if (!pic || !sprite) return resolve();

						// 아래로 슬라이딩
						const xStart = 1; // 시작 위치
						const xEnd = 0; // 도착 위치

						const begin = Game.frameCount;
						const easing = Bezier.EaseIn; // Ease-In 커브
						while (true) {
							const elapsed = Game.frameCount - begin;
							const p = elapsed / 60; // 1초
							if (p > 1) break;

							sprite.anchor.y = (xEnd - xStart) * easing.getY(p) + xStart;
							await this.wait(0);
						}

						this.scg(1, null, 0);
						resolve();
					});
				}).then(() => this.unlock());
			},

			() => this.t("불쾌감이 고스란히 묻어 나오는 가식적인 인사와 함께 방안에 적막이 내려앉았다."),
			() => this.t("나는 그 중년의 기세에 완벽하게 압도되어 어떤 반박도 하지 못했다."),
			() => this.t("그가 했던 말들은 대중의 일반적인 시각과 다르지 않았다."),
			() => this.t("바이오로이드에게 특별한 감정을 느끼는 이들은 흔히 ‘병신’이라고 칭해진다."),
			() => this.t("과거의 나 역시 그다지 다르지 않은 입장이었다."),
			() => this.t("인간에게 봉사하기 위해 만들어진 도구들에 연민이나 사랑을 느끼는 것은 노예와 사랑에 빠진 주인의 이야기만큼이나 허무맹랑한 것이 아니던가."),

			() => this.t("그러나 유미와 함께 지내는 동안 바이오로이드는 인간과 차이가 없는 주체적인 자아를 가진 생명이라는 것을 알게 되었다."),
			() => this.t("유미는 슬프면 울고, 기쁘면 웃었다."),
			() => this.t("비록 그것이 만들어진 감정이라고 하더라도 본질은 인간의 것과 다르지 않았다."),

			() => this.t("혼란스러웠다."),
			() => this.t("엄연히 인격을 가진 그녀들을 천시하는 게 정녕 옳은 일인가?"),
			() => this.t("소유물이라는 이름 아래 노예처럼 다루고, 심지어 뒷세계의 유희로 찢고 자르고 불태워 죽이는 비인륜적인 모든 행위가 묵인되어도 되는 건가?"),

			() => this.t("누군가 그랬다."),
			() => this.t("‘우리는 신을 만들었으나 그 힘을 두려워해 여성의 몸에 가두고 노예의 정신으로 길들였다.’ 라고."),
			() => this.t("그녀들이 갈 길을 잃고 방황하는 분노의 정착지가 된 것은 그녀들의 신적인 능력에 대한 막연한 두려움 때문일지도 모른다."),
			() => this.t("이 미쳐버린 세상에서 의미를 찾는 것만큼 부질없는 일도 없겠지만, 적어도 지금은 답을 알고 싶었다."),

			() => this.t("사건의 지평선 너머로 사라진 진실을 좇는 우스꽝스러운 소동 끝에 찾아온 것은 오직 적막을 깨고 뒤통수를 후리는 절망뿐이었다."),
			() => this.t("깨어있는 척 고민해도 결국 내가 바꾼 것은 아무것도 없었다."),

			() => this.t("어쩌면 나야말로 선민의식에 찌든 기만자가 아닐까."),
			() => this.t("그녀를 위한다는 핑계로 나의 나약함을 합리화하고 있는 것은 아닐까."),

			() => this.t("권력 앞에 저항 한 번 못하고 ‘네.’라는 힘없는 답변이나 뱉는 것이 나의 한계다."),
			() => this.t("추잡한 성욕과 물욕과 권력욕에 찌든 기업가들과 다를 바가 없다."),
			() => this.t("때문에 나는 끝을 모르는 깊은 고뇌로 번민하게 되었다."),
			() => this.t("내가 유미에게 느끼는 것은 나의 과거와 겹쳐 보여 갖게 된 연민에 불과한 것인지."),
			() => this.t("나 역시 무의식적으로 유미를 나보다 낮은 존재로 대하고 있던 것은 아닌지."),

			() => this.t("어찌 됐든 나는 돌아가야 했다."),
			() => this.t("거절하면 유미의 목숨이 위험해진다는 사실까지 전부 말할 수는 없는 노릇이었으므로, 거짓말을 했다."),
			() => this.t("그녀에게 처음으로 거짓말을 했다."),
			() => this.t("돌아가지 않으면 일이 끊길 거라고, 굶어 죽게 될 거라고 말이다."),
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

			() => this.t("모든 사실을 전해 들은 유미의 반응은 예상과 조금 다른 모습이었다."),
			() => this.t("아연실색한 것 같기도, 당혹스러운 것 같기도 했지만, 하나 확실한 것은 떨고 있다는 것이었다."),
			() => this.t("그녀는 고작 돈 때문에 자신이 버려진다는 사실을 애써 부정하고 있었다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "농담도 잘하셔."),
			() => this.s("유미", "통보도 없이 가기는 어딜 가신다고."),
			() => this.s("나", "미안해."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "거짓말."),
			() => this.s("나", "…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_24"),
			() => this.s("유미", "… 죄송해요. 잠깐만 나갔다 올게요."),
			() => this.s("유미", "생각이... 정리가 안 되네요."),
			() => this.s("유미", "진정하고… 마음 좀 가라앉히고… 금방 돌아올게요."),
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

			() => this.t("유미는 억지로 입꼬리를 끌어올리며 생긋 웃더니 코트 하나만 걸치고 도망치듯 방을 나갔다."),
			() => this.t("바보 같게도, 나는 달려 나가는 그녀를 잡지 못했다."),
			() => this.t("그저 황망히 서서 유미가 상황을 받아들일 때까지 기다려주는 것 외에는 할 수 없었다."),
			() => this.t("지금은 슬슬 겨울이 되어가는 남반구의 5월이었다."),
			() => this.t("한국에 있었다면 한창 여물어가는 봄을 즐기고 있었겠지만, 이곳은 다르다."),
			() => this.t("거센 바람 소리가 외벽을 타고 숙소 안까지 들렸다."),
			() => this.t("대체 무슨 생각이었는지는 모르겠으나 유미를 찾아 데려오려는 마음조차 들지 않았다."),
			() => this.t("묵직하게 다가오는 이별의 회한에 짓눌려 한 발자국도 움직일 수가 없었다."),
			() => this.t("그렇게 아무것도 하지 못하고 10분, 20분, 1시간, 2시간이 흘러서야 유미는 추위에 떨며 돌아왔다."),


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
