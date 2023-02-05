import Game from "..";

import Sprite from "@/core/Sprite";
import Bezier from "@/core/Bezier";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch1Part5";

export default class GameCh1Part4 extends GameScript {
	public readonly scriptName: string = "Ch1Part4";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			() => {
				this.lock();

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

			() => {
				this.lock();

				new Promise<void>(resolve => {
					this.picture(1, "SCG/STD_01_2", async (pic, sprite) => {
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
							const p = elapsed / 60; // 1초
							if (p > 1) break;

							sprite.transform.position.x = (xEnd - xStart) * easing.getY(p) + xStart;
							await this.wait(0);
						}

						sprite.transform.position.x = xEnd;
						resolve();
					});
				}).then(() => this.unlock());
			},

			() => this.s("유미", "후아, 잘 먹었다~."),
			() => this.s("유미", "관리자님, 어떠셨어요?"),
			() => this.s("유미", "영국 음식 따위랑은 비교도 안 되죠?"),
			() => this.s("유미", "호주의 피쉬앤칩스나… 맞아, 가리비 수프도 맛있었죠."),

			() => this.t("완전히 기진맥진한 나와는 달리 유미는 아직도 쌩쌩해 보였다."),
			() => this.t("그렇게나 많이 먹고도 아직 부족하다니, 바이오로이드의 위는 도대체 얼마나 큰 걸까…."),

			() => this.s("나", "넌 지치지도 않는구나…."),
			() => this.close(),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "헤헤, 그야 당연하죠!"),
			() => this.s("유미", "이런 도시를 돌아다니는 것도 오늘로 마지막인데 즐길 수 있을 만큼 즐겨야 하지 않겠어요?"),

			() => this.t("마치 시골에서 갓 상경한 사람처럼 쏘다니는 태도 하며, 유미의 입에서 쏟아지는 이해할 수 없는 말들에 자꾸 신경이 쓰였다."),
			() => this.t("겨우 억눌렀던 불안감이 스멀스멀 올라와 등허리를 매만졌다."),

			() => {
				AudioManager.playBGM({
					name: "Mystic",
					volume: 100,
				});
			},
			() => this.scg(1, "SCG/STD_01_15"),
			() => this.s("유미", "하…. 아쉽다. 또 언제 올 수 있을지도 모르는데."),
			() => this.s("나", "아니, 아까부터 이상한 말을 하는데 여기서 일하는 거 아니야?"),

			() => this.scg(1, "SCG/STD_01_11"),
			() => this.s("유미", "네? 무슨 소리를 하시는 거예요, 갑자기."),
			() => this.s("나", "어…?"),
			() => this.close(),

			() => this.s("유미", "왜 그러세요?"),
			() => this.s("유미", "세인트 클레어 국립공원에서 여기까지 얼마나 먼데."),
			() => this.s("유미", "설마 휴일마다 놀러 오려고 생각하신 건 아니죠?"),

			() => this.sel(
				"국립공원? 그건 또 무슨 소리야?",
				"너야말로 무슨 소리야. 우린 도시에서 일하는 거잖아.",
			),
			() => this.close(),

			() => this.s("유미", "…. 네? 아이고, 두야."),
			() => this.s("유미", "관리자님, 설마 상부에서 내려온 지령이 무슨 내용인지도 모르고 오신 거예요?"),

			() => this.s("나", "그야 당연히 잘 알지."),
			() => this.s("나", "난 호바트의 항구 도시에서 행정 업무를 맡는 걸로 되어 있었어."),
			() => this.s("나", "그러는 넌 원래 뭘 하고 있었는데?"),

			() => this.scg(1, "SCG/STD_01_1"),
			() => this.s("유미", "대체 무슨 말씀이신지 모르겠네요."),
			() => this.s("유미", "저는 이 도시에서 한~참 떨어진 산속, 세인트 클레어 호수의\n국립공원에 설치된 기지국에서 그 근처 작은 마을의 통신망을 유지하고 있어요."),

			() => this.t("혼란스럽다."),
			() => this.t("유미의 말은 전혀 귀에 들어오지 않았다."),

			() => this.scg(1, "SCG/STD_01_11"),

			() => this.s("유미", "관리자님은 일손이 부족한 저를 돕기 위해 오신 거예요."),
			() => this.s("유미", "이제 와서 발뺌하시려는 건 아니시죠?"),

			() => this.t("나는 벙어리라도 된 것처럼 말하는 법을 잊고 말았다."),
			() => this.t("유미는 주머니에서 예쁘게 접힌 서류를 꺼내더니 내게 들이밀었다."),

			() => this.scg(1, "SCG/STD_01_16"),
			() => this.s("유미", "여기, 펙스 본사에서 내려온 문서예요. 직접 읽어보세요."),
			() => this.s("나", "…줘봐."),

			() => this.t("귀하에게 호주 태즈메이니아 섬의 세인트 클레어 국립공원으로 전출을 지시하는 바이다…."),
			() => this.t("바이오로이드 커넥터 유미가 귀하의 업무를 돕게 되며…."),

			() => this.t("시리도록 딱딱한 문자들의 배열이 뇌리를 훑고 지나갔다."),
			() => this.t("망연자실하여 고개를 떨군 내게 그 내용이 들어올 리는 없었다."),
			() => this.t("유미는 그런 내가 썩 안쓰럽게 보였는지 다정하게 손을 잡으며 측은하게 올려다보았다."),

			() => this.scg(1, "SCG/STD_01_26"),
			() => this.s("유미", "관리자님? … 일단 가요."),
			() => this.s("유미", "자세한 이야기는 이동하면서 말씀드릴게요."),
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
