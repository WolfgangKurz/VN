

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch3Part5";

export default class GameCh3Part4 extends GameScript {
	public readonly scriptName: string = "Ch3Part4";

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

			() => this.scg(1, "SCG/ STD_03_11"),
			() => this.s("유미", "관리자님, 요즘 안색이 영 안 좋아요. 아프신 건 아니죠?"),

			() => this.t("태산처럼 불어난 근심이 표정에도 드러났나 보다."),
			() => this.t("며칠 전부터 고심이 있었음을 알아챈 유미가 걱정스러운 눈빛을 보내왔다."),
			() => this.t("진실을 들었을 때, 유미는 과연 어떤 표정을 지을까."),
			() => this.t("막연한 두려움에 휩싸인 나는 떠보듯이 질문을 던져보았다."),

			() => this.s("나", "만약… 내가 갑자기 떠나야 한다면 어떻게 할 거야?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "네? 에이, 그런 불길한 소리는 하지도 마세요!"),
			() => this.s("유미", "저 보고 이 지긋지긋한 숲속에 다시 혼자 남으라는 말씀이세요?"),

			() => this.t("예상과 다르지 않게, 유미는 불같이 성을 내었다."),
			() => this.t("이러면 안 되는데…"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_18"),
			() => this.s("유미", "헤헤, 표정 푸세요~ 장난이에요, 장난."),
			() => this.s("유미", "어디 무서워서 농담도 못 하겠네."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_25"),
			() => this.s("유미", "관리자님도 언젠가는 떠나셔야겠죠."),
			() => this.s("유미", "굳이 입 밖으로 내지는 않지만, 저도 잘 알고 있어요."),
			() => this.s("유미", "관리자님은 큰 사람이시니까, 이런 작은 섬에 안주해있을 수는 없다는 걸요."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_9"),
			() => this.s("유미", "뭐, 너무 걱정하실 필요 없어요~"),
			() => this.s("유미", "30년을 혼자 살았는데 별일이야 있겠어요?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_21"),
			() => this.s("유미", "대신…."),

			() => this.t("유미는 말을 끊더니 옅게 뺨을 붉히며 시선을 피했다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_21"),
			() => this.s("유미", "꼭 다시 돌아오겠다고… 약속해주신다면…."),
			() => this.s("나", "…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_17"),
			() => this.s("유미", "ㅇ, 아까 한 말은 잊어주세요!"),
			() => this.s("유미", "그냥 저도 모르게…."),

			() => this.t("유미의 당찬 모습에 왜인지 안도된 나는 조심히 운을 떴다."),

			() => this.s("나", "만약, 내가 당장 일주일 뒤에 떠나야 한다면… 어떻게 할래…?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "갑자기 또 무슨..."),
			() => this.s("나", "내가 정말로 떠나서 기약 없는 기다림을 견뎌야 한다면… 넌 어떻게 할래?"),
			() => this.close(),

			() => this.scg(1, "SCG/STD_03_26"),
			() => this.s("유미", "… 대체 무슨 일이 있었던 거예요."),
			() => this.s("유미", "자세히 말해봐요."),
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
