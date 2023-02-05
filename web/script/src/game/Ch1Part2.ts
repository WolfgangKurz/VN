import Game from "..";

import Sprite from "@/core/Sprite";
import SolidFilter from "@/core/Filters/SolidFilter";

import AudioManager from "@/managers/AudioManager";

import GameScript from "./GameScript";

import NextScript from "./Ch1Part3";

export default class GameCh1Part2 extends GameScript {
	public readonly scriptName: string = "Ch1Part2";

	constructor (targetLine: number = 0) {
		super();
		this.init(targetLine, [
			() => {
				this.lock();

				// BG 전환, 페이드 인
				this.bg("2_Airport", async bg => {
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

			() => this.t("얼른 내리라는 듯이 재촉하며 열리는 문을 빠져나가 마침내 호바트에 발을 내딛었다."),
			() => this.t("그 첫걸음에 감격할 새도 없이 나는 고개를 두리번거렸다."),
			() => this.close(),

			async () => {
				this.lock();
				if (this.isReady) await this.wait(2);
				this.unlock();
			},

			// #12
			() => this.s("나", "분명 여기 있을 거라고 했는데…."),
			() => this.t("버스들이 드나들기는 하지만, 공허할 정도로 넓은 정류장."),
			() => this.t("안내인과는 여기서 만나기로 되어 있었다."),
			() => this.close(),

			() => {
				this.lock();

				this.picture(1, "SCG/STD_01_1", async (pic, sprite) => {
					if (!pic || !sprite) return this.unlock();

					sprite.anchor.set(0.5, 1);
					sprite.transform.position.set(Game.width * 0.5, Game.height + 20);

					const filter = new SolidFilter();
					filter.setBlendColor([30, 10, 10, 255]);
					pic.filters?.push(filter);

					// console.log(this.scriptCursor, this.targetLine, this.isReady);
					pic.startFadeIn(this.isReady ? 90 : 0); // 1.5초 fadein
					while (pic.isFading())
						await this.wait(0);

					this.unlock();
				});
			},
			() => this.s("???", "여기, 여기예요. 여기!"),
			() => this.s("???", "새로 오신 관리자님이시죠? 성함이…."),
			() => this.s("나", "당신이 유미 씨?"),
			() => this.close(),

			() => {
				this.lock();

				AudioManager.playBGM({
					name: "Summer_02",
					volume: 100,
				});
				this.picture(1001, "CUT/cut_01.jpg", async (pic, sprite) => {
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

			() => this.s("유미", "네, 맞아요. 제대로 오신 것 같네요."),
			() => this.s("유미", "잘 부탁드려요, 관리자님."),
			() => this.s("유미", "저는 이지적이고 유능한 커리어 우먼, 유미라고 해요."),
			() => this.s("유미", "이곳에서 관리자님을 안내해 드리고, 기지국의 업무를 친절히 알려\n드릴 예정이죠."),
			() => this.s("유미", "편하게 반말로 불러주세요."),

			() => this.t("자기 입으로 유능하고 이지적이라고 소개하는 그녀는 사실 인간이 아닌 바이오로이드이다."),
			() => this.t("내가 몸을 담고 있는 기업인 펙스에서 오지까지 통신망을 설치하기 위해 파견한 '커넥터 유미'라는 기종이라고 한다."),
			() => this.t("염색한 것이라기에는 자연스러운 보라색 컬리 헤어와 작고 아담한 키가 그 증거이다."),

			() => {
				this.lock();

				Promise.all([
					new Promise<void>(resolve => {
						this.picture(1001, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? 90 : 0);
							while (pic.isFading())
								await this.wait(0);

							this.picture(1001, null);
							resolve();
						});
					}),
					new Promise<void>(resolve => {
						this.picture(1, async (pic, sprite) => {
							if (pic && pic.filters) {
								while (true) {
									const filterIdx = pic.filters.findIndex(x => x instanceof SolidFilter);
									if (filterIdx < 0) break;
									pic.filters.splice(filterIdx, 1);
								}
							}
							resolve();
						});
					}),
				])
					.then(() => this.unlock());
			},

			() => this.s("유미", "그런데…. 저희 어디서 본 적 있었나요?"),
			() => this.sel(
				"아니, 전혀.",
				"갑자기 왜?",
			),

			() => this.t("유미는 우물쭈물 거리다 곧 입을 열었다."),

			() => this.scg(1, "SCG/STD_01_9"),
			() => this.s("유미", "뭐랄까…. 푸흡…. 되게 흔하게 생기셔서요."),
			() => this.s("나", "…."),

			() => this.scg(1, "SCG/STD_01_16"),
			() => this.s("유미", "…죄송해요. 분위기 좀 띄워보려고 농담 좀 한 건데."),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "호주에 오신 건 처음이시죠?"),
			() => this.s("유미", "그렇게 딱딱한 표정 짓지 마시구. 네?"),
			() => this.s("유미", "어서 가요. 버스는 미리 예약해 놨어요."),

			() => this.t("다짜고짜 손을 잡아끄는 유미에게 이끌려 공항을 나가 바로 옆에 있는 버스 정류장으로 향했다."),
			() => this.t("도시로 향하는 셔틀버스는 눈이 부시는 백색이었다."),
			() => this.t("유미는 능숙하게 승무원에게 자신과 내 몫의 승차권을 건네고 승객들의 행렬에 참여했다."),

			() => this.scg(1, "SCG/STD_01_12"),
			() => this.s("유미", "이제 막 도착하셔서 정신없으시죠? 도시로 가는 동안에는 잠시\n주무셔도 돼요."),

			() => this.t("딱히 잠이 오지는 않았다."),
			() => this.t("오히려 외국의 도시에서 일하게 되었다는 사실에 흥분되어 있던 잠도 날아갈 기세였다."),
			() => this.t("이곳은 호주 최남단의 섬인 태즈메이니아에서도 가장 남쪽에 위치한 호바트."),
			() => this.t("난 이곳의 항구 도시에서 이 작은 바이오로이드와 통신에 관련된 업무를 맡게 될 예정이다."),
			() => this.t("한국의 혼잡한 소음에서 벗어나 호주의 해변에서 휴식하고 자연을 즐기고…."),
			() => this.t("어릴 적부터 죽도록 일한 내게 처음으로 주는 선물이라고 생각하니 내심 기쁠 수밖에 없었다."),

			() => this.scg(1, "SCG/STD_01_11"),
			() => this.s("유미", "관리자님? 이제 저희 차례예요. 어서 타세요."),

			() => this.t("미심쩍은 눈빛을 보내는 유미."),
			() => this.t("머나먼 국외로 출장 온 주제에 뭐가 그렇게 좋은지…."),
			() => this.t("그녀가 마치 그렇게 되묻는 것 같았다."),
			() => this.t("어쩐지 불안한 예감이 고개를 들었지만, 나는 그것을 억지로 구석에 밀어 넣은 채 긍정적인 생각만 하기로 했다."),

			() => this.scg(1, "SCG/STD_01_2"),
			() => this.s("유미", "여기가 우리 자리네요."),
			() => this.s("유미", "오, 마침 해변이 고스란히 보이는 자리에요."),
			() => this.s("유미", "반대쪽은 절벽밖에 안 보이거든요."),

			() => this.t("유미는 이미 몇 번이나 이 버스를 타봤는지, 자리만 보고도 어떤 경관이 보일지 아는 듯했다."),
			() => this.t("내게 창가 쪽을 양보한 유미의 손에는 반쪽만 남은 승차권이 여전히 들려있었다."),
			() => this.t("그런데 문득 그녀의 승차권에 적힌 가격에 의문이 들었다."),
			() => this.t("왜 가격이 같은 거지…?"),

			() => this.s("나", "그런데 너는 왜 어른 요금을 내는 거야?"),

			() => this.scg(1, "SCG/STD_01_17"),
			() => this.s("유미", "네? 그게 무슨 말씀이신지…."),
			() => this.s("나", "아니, 나야 성인 요금을 내는 게 당연하지만 너는 미성년자잖아."),
			() => this.s("나", "그런데 같은 요금을 내는 게 이상해서."),

			() => this.scg(1, "SCG/STD_01_26"),
			() => this.s("유미", "아…. 그러셨구나…?"),
			() => this.s("나", "혹시 계산 잘못한 거 아니야?"),
			() => this.s("나", "지금 바꾸기에는 너무 늦었으니 어쩔 수 없…."),
			() => this.close(),

			() => {
				this.lock();

				new Promise<void>(async resolve => {
					this.shake(20, 90);

					while (this.isShaking)
						await this.wait(0);

					resolve();
				}).then(() => this.unlock());
			},

			() => this.scg(1, "SCG/STD_01_7"),
			() => this.s("유미", "이래 봬도 저 22살이거든요!?"),
			() => this.s("유미", "작다고 어린애 취급하지 말아 주세요!"),
			() => this.s("나", "앗…."),

			() => this.t("역린을 건드려버렸나?"),
			() => this.t("씩씩대는 그녀를 달래느라 진땀을 빼야 했지만, 다 주의력 없는 내 잘못이지…."),
			() => this.t("그만큼 젊어 보였다는 뜻이라고 해명하자 그제야 화가 누그러진 듯했다."),

			() => this.scg(1, "SCG/STD_01_14"),
			() => this.s("유미", "아까 저도 놀렸으니까 봐 드리는 거예요."),
			() => this.s("유미", "아무리 그래도 마음 여린 숙녀한테 그런 말씀을 하시다니…."),

			() => this.t("앞으로 같이 일하게 될 동료에게 밉보여서 좋을 일은 없겠지."),
			() => this.t("그녀가 완전히 진정할 때 쯤이 되어서야 버스는 출발했다."),
			() => this.t("창가로 비치는 바다경관은 한국의 것과 비슷하지만 다른 묘한 분위기를 풍겼다."),
			() => this.t("그녀는 오는 길에 지쳐있었기에 버스의 진동을 자장가 삼아 잠들어 있었고, 덕분에 나는 온전히 자연의 운치에만 집중할 수 있었다."),
			() => this.t("이국적인 분위기에 취해 앞으로 무엇을 하며 보낼지 생각하다 보니 곧 목적지에 다다라 있었다."),

			() => this.close(),

			() => {
				this.lock();
				AudioManager.fadeOutBGM(1.5);

				Promise.all([
					new Promise<void>(resolve => {
						this.scgFn(1, async (pic) => {
							if (!pic) return resolve();

							pic.startFadeOut(this.isReady ? 90 : 0);
							while (pic.isFading())
								await this.wait(0);

							this.picture(1, null);
							resolve();
						});
					}),
					new Promise<void>(resolve => {
						this.bg(async (bg, sprite) => {
							if (!bg || !sprite) return resolve();

							bg.startFadeOut(this.isReady ? 90 : 0); // 1.5초 fadein
							while (bg.isFading())
								await this.wait(0);

							this.bg(null);
							resolve();
						});
					}),
				]).then(() => this.unlock());
			},

			() => this.load(new NextScript()),
		]);
	}
}
