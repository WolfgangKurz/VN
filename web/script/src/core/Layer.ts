// import * as PIXI from "pixi.js";

import Game from "..";
import Stage from "./Stage";

export default class Layer extends Stage {
	constructor () {
		super();
		this.width = Game.width;
		this.height = Game.height;
	}

	public update () {
		this.children.forEach(_child => {
			const child = _child as (typeof _child & {
				update?: () => void;
			});
			if (typeof child.update === "function")
				child.update();
		});
	}
}
