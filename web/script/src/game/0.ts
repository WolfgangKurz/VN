import GameScript from "./GameScript";
import Session from "@/core/Session";

import NextScript from "./Ch1Part1";

export default class Game0 extends GameScript {
	public readonly scriptName: string = "0";

	constructor () {
		super();
		this.init(0, [
			async () => {
				// 초기화 단계
				Session.deserialize("{}");

				this.load(new NextScript()); // 1-1
			},
		]);
	}
}
