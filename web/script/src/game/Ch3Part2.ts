import Game from "..";

import Sprite from "@/core/Sprite";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch3Part3";

export default class GameCh3Part2 extends GameScript {
	public readonly scriptName: string = "Ch3Part2";

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

			() => this.scg(1, "SCG/STD_03_22"),
			() => this.s("유미", "헉!"),
			() => this.s("나", "어휴, 깜짝이야. 일어났네?"),
			() => this.s("나", "안색이 왜 그래. 악몽이라도 꿨어?"),
			() => this.close(),

			() => AudioManager.playBGM({
				name: "Daily",
				volume: 100,
			}),

			() => this.scg(1, "SCG/STD_03_29"),
			() => this.s("유미", "ㅇ, 아무것도 아니에요~"),
			() => this.s("유미", "말마따나 이상한 꿈을 꿔서요."),

			() => this.t("왜 저렇게 당황하지?"),
			() => this.t("자기 머리카락 색만큼이나 새파랗게 질린 유미는 일어나자마자 허둥지둥 목덜미를 더듬더니 이어서 나를 등지고 손목을 확인했다."),
			() => this.t("왜인지 안도의 한숨을 내쉰 유미는 평소대로의 밝은 모습으로 돌아왔다."),
			() => this.t("그러나 그 표정 한구석에 섞인 불안감은 사라지지 않았다."),

			() => this.s("나", "… 유미?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "ㄴ, 네!"),
			() => this.s("나", "오늘은 나가지 말고 쉴까?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_29"),
			() => this.s("유미", "아니에요~ 아직 잠이 덜 깨서 정신이 없었네요."),

			() => this.t("어색하게 웃으며 손사래를 치는 유미."),
			() => this.t("아무리 숨기려 해도 숨겨지지 않는 우울감을 눈치챈 나는 유미의 손을 꼭 잡으며 다시 한번 물었다."),

			() => this.s("나", "정말 괜찮은 거지...?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_8"),
			() => this.s("유미", "…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_3"),
			() => this.s("유미", "정말 괜찮아요."),
			() => this.s("나", "… 알겠어. 어서 챙기자. 벌써 해가 중천이야."),

			() => this.t("오늘은 세인트 클레어 호수로 피크닉을 가기로 한 날이었다."),
			() => this.t("유미와 처음 만난 지도 어느덧 한 달, 우리는 일이 없는 날이면 마을로 나들이를 가거나 오늘처럼 호수의 절경을 병풍 삼아 소풍을 즐기기도 했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "저는 준비 다 됐어요~"),

			() => this.t("금세 치장을 마친 유미가 주변에서 빙글빙글 돌았다."),
			() => this.t("땅에서 올라오는 열기가 그대로 느껴질 만큼 꽤 더운 날씨인데도 여지없이 긴소매 옷이었다."),
			() => this.t("우리가 처음 만난 날로부터 어느덧 1년이 지났음에도 유미는 언제나 긴소매 옷만 고집했다."),

			() => this.t("비가 오는 날에도, 땀이 줄줄 흐르는 더운 날에도, 후덥지근한 산을 오를 때에도, 보일러가 있어 춥지 않은 실내에서도, 기지국을 청소하는 날에도 그랬다."),
			() => this.t("생각해 보면 우리가 만난 지 얼마 안 됐던 때, 램파트를 청소했던 날에 홀랑 젖어 고무장갑 안까지 물이 가득 찼어도 소매를 보이는 일은 없었다."),

			() => this.t("이유를 물어보려고 해도 정색하며 변명하거나 말을 끊어대는 통에 쉽지 않았다."),
			() => this.t("그런 일이 반복되자 언젠가부터는 긴소매를 입는 것이 그저 자연스러운 일과로 느껴져 의문을 품지도 않게 되었지…."),

			() => this.t("그렇다고 짧은 소매 옷이 없는 것도 아니었다."),
			() => this.t("영 부자연스러운 상황에 그녀에 대한 의심이 점점 커지던 참이었다."),
			() => this.t("오늘이야말로 진지하게 물어봐야지."),
			() => this.t("그렇게 다짐하던 때였다."),

			() => this.s("나", "저기, 유ㅁ..."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_12"),
			() => this.s("유미", "관리자님! 먹을 거 다 챙기셨어요?"),
			() => this.s("나", "아, 냉장고에 넣어뒀던가?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_16"),
			() => this.s("유미", "도시락에 든 것만 전자레인지에 돌려주세요~"),

			() => this.t("… 그냥 나중에 묻자."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "이제 슬슬 나가볼까요?"),

			() => this.t("지난 일주일은 통신 설비의 확장으로 인해 바빠 피크닉은커녕 짧은 휴식조차도 귀했으므로, 유미는 오랜만의 여유에 신난 기색이 다분했다."),
			() => this.t("게다가 우기에 접어든 탓에 잦은 소나기가 내려 맑은 하늘을 보는 것 또한 드문 일이었다."),
			() => this.t("그 때문이었을까."),
			() => this.t("간단한 먹거리와 음료를 챙기자마자 채비를 마친 유미가 다소 급하게 손을 잡아끌었다."),
			() => this.t("곰곰이 생각해 보면 아까의 일을 묻으려는 의도였을지도 몰랐지만, 당장은 그녀와의 시간에만 집중하기로 했다."),
			() => this.close(),

			() => this.scg(1, null),
			() => {
				this.lock();

				this.picture(-1, "../BG/7_Forest_sunset.jpg", async (pic, sprite) => {
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

					this.bg("7_Forest_sunset", async bg => {
						if (!bg) return this.unlock();

						bg.startFadeIn(0);
						this.picture(-1, null);

						this.unlock();
					});
				});
			},

			() => this.t("우리는 도란도란 이야기를 나누며 숲속을 걸었다."),
			() => this.t("날은 푸르고 하늘은 맑았다."),
			() => this.t("빽빽한 유칼립투스 나뭇잎 사이로 빼꼼 고개를 비추는 햇살이 부드러운 흙바닥에 기하학적인 무늬를 새겼다."),
			() => this.t("그 빛의 인도를 받아 걸음을 옮기니 곧 호숫가까지 다다를 수 있었다."),
			() => this.close(),

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
