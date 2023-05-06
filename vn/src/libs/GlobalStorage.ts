import NodeFS from "node:fs";
import NodePATH from "node:path";

import { __dirname } from "./Const";

const fs: typeof NodeFS = window.nw.require("fs");
const path: typeof NodePATH = window.nw.require("path");

interface SEEN_TYPE {
	char: string[];
	pic: string[];
	bgm: string[];
	ending: boolean;
}

class GlobalStorage {
	private static _inst = new GlobalStorage();

	public static get Instance () {
		return this._inst;
	}

	private get EMPTY_SEEN (): SEEN_TYPE {
		return {
			char: [],
			pic: [],
			bgm: [],
			ending: false,
		};
	}

	public seen: SEEN_TYPE = this.EMPTY_SEEN;

	public Save (): void {
		fs.writeFileSync(
			path.join(__dirname, "global.data"),
			JSON.stringify({
				seen: this.seen,
			}),
			"utf-8",
		);
	}
	public Read (): void {
		const target = path.join(__dirname, "global.data");
		if (!fs.existsSync(target)) {
			this.seen = this.EMPTY_SEEN;
			return;
		}

		const data = JSON.parse(fs.readFileSync(target, "utf-8") || "{}");
		if (!data || !("seen" in data))
			this.seen = this.EMPTY_SEEN;
		else {
			this.seen = {
				char: "char" in data.seen && Array.isArray(data.seen.char)
					? data.seen.char.filter(r => typeof r === "string")
					: [],
				pic: "pic" in data.seen && Array.isArray(data.seen.pic)
					? data.seen.pic.filter(r => typeof r === "string")
					: [],
				bgm: "bgm" in data.seen && Array.isArray(data.seen.bgm)
					? data.seen.bgm.filter(r => typeof r === "string")
					: [],
				ending: ("ending" in data.seen && data.seen.ending) || false,
			};
		}
	}
}
export default GlobalStorage;
