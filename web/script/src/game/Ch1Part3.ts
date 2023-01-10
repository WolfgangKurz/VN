import Game from "..";

import Sprite from "@/core/Sprite";
import SolidFilter from "@/core/Filters/SolidFilter";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch1Part4";

export default class GameCh1Part3 extends GameScript {
	public readonly scriptName: string = "Ch1Part3";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			() => {
				this.lock();

				AudioManager.playBGM({
					name: "LoverLover",
					volume: 100,
				});

				// BG 전환, 페이드 인
				this.bg("3_City", async bg => {
					if (!bg) return this.unlock();

					if (this.isReady) {
						bg.startFadeIn(60 * 2); // 2초 fadein
						while (bg.isFading())
							await this.wait(0);
					} else
						bg.startFadeIn(0);

					this.unlock();
				});
			},

			() => this.t("유미가 버스에서 먼저 내리더니 마치 쇼호스트처럼 도시를 향해 손을 쭉 뻗으며 외쳤다."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_9"),
			() => {
				this.lock();

				this.scgFn(1, async (pic, sprite) => { // 방방
					if (!pic || !sprite) return this.unlock();

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

					this.unlock()
				});
			},

			() => this.s("유미", "호바트 시내에 오신 걸 환영합니다~"),
			() => this.s("유미", "저도 오랜만에 오는 거라서 신 나네요!"),

			() => this.t("단 몇 분 전만 해도 곤히 잠들었던 유미는 언제 그랬냐는 듯이 팔짝팔짝 뛰며 내 옆에 섰다."),
			() => this.t("아까의 일은 아예 잊어버린 것 같았다."),
			() => this.t("뒷말이 마음에 걸리기는 했으나 일이 바빠서 그랬겠거니 여겼다."),

			() => {
				this.lock();

				this.picture(1001, "CUT/cut_02.jpg", async (pic, sprite) => {
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

			() => this.s("유미", "호바트의 명물은 역시 피쉬앤칩스죠!"),
			() => this.s("유미", "…. 표정이 왜 그러세요?"),
			() => this.s("유미", "영국의 그것과는 차원이 달라요."),
			() => this.s("유미", "한번 먹어보면 멈출 수가 없어서 체중계에 오르기 무서워진다는 것이 문제지만…."),
			() => this.s("유미", "뭐, 맛있게 먹으면 0 칼로리라는 말도 있잖아요?"),
			() => this.s("유미", "제가 맛집을 잘 아니까 어서 가봐요!"),

			() => this.t("순수하게 기뻐하는 모습을 보니 괜히 나까지 뿌듯해졌다."),
			() => this.t("조금 피곤해 보이던 어깨가 물 만난 물고기처럼 폈다."),
			() => this.t("이곳에 처음 온 사람보다 신 난 그녀의 손에 붙잡힌 나는 미처 반항조차 하지 못하고 배가 두둑이 부풀어 오를 때까지 맛집들을 돌아다녔다."),

			() => this.t("소도시의 맑고 시원한 공기는 재외 생활에 대한 기대감을 한층 높여주었다."),
			() => this.t("이번 출장은 몇 달 뒤에 있을 승진식에서도 긍정적인 영향을 미칠 것이다."),
			() => this.t("여기서도 뛰어난 성적을 거둔다면 회사에서의 내 가치는 충분히 입증되겠지."),
			() => this.t("상부의 철저한 감시에서 벗어날 수 있다는 점도 좋았다."),
			() => this.t("감시의 눈이 잘 닿지 않는 이곳이야말로 커리어를 쌓고 지친 몸에 휴식을 주기에는 최적의 환경이다."),

			() => this.t("무엇보다 나 같은 신입에게 해외 출장은 상부의 기대감을 한 몸에 받고 있다는 뜻이나 다름이 없다."),
			() => this.t("지난 몇 년의 고생에 대한 보답이 직접적으로 표현되는 셈이었다."),
			() => this.t("잔뜩 신나서 손을 잡아끄는 유미처럼 나도 어느새 활짝 웃고 있었다."),
			() => this.t("시간 가는 줄도 모르고 이곳저곳을 돌아다니던 우리는 눈에 보일 정도로 배가 빵빵하게 부풀어 오른 후에야 벤치에 앉아 휴식을 취하게 되었다."),

			() => this.close(),

			() => AudioManager.fadeOutBGM(1.5),
			() => this.scg(1, null, 0),
			() => {
				this.lock();
				this.bg(null);

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

			() => this.load(new NextScript()),
		]);
	}
}
