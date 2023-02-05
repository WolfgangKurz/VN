import NodeFS, { fstat, read } from "node:fs";
import NodePATH from "node:path";

import { __dirname } from "./Const";

const fs: typeof NodeFS = window.nw.require("fs");
const path: typeof NodePATH = window.nw.require("path");


class GlobalStorage {
	private static _inst = new GlobalStorage();

	public static get Instance () {
		return this._inst;
	}

	public seen: {
		char: string[];
		pic: string[];
		bgm: string[];
		ending: boolean;
	} = {
			char: [],
			pic: [],
			bgm: [],
			ending: false,
		};

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
			this.seen = {
				char: [],
				pic: [],
				bgm: [],
				ending: false,
			};
			return;
		}

		const data = JSON.parse(fs.readFileSync(target, "utf-8",) || "{}");
		this.seen = {
			char: Array.isArray(data.seen.char)
				? data.seen.char.filter(r => typeof r === "string")
				: [],
			pic: Array.isArray(data.seen.pic)
				? data.seen.pic.filter(r => typeof r === "string")
				: [],
			bgm: Array.isArray(data.seen.bgm)
				? data.seen.bgm.filter(r => typeof r === "string")
				: [],
			ending: data.seen.ending || false,
		};
	}
}
export default GlobalStorage;
