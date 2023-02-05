import NodePATH from "node:path";

import config from "@/config";

import GlobalStorage from "./GlobalStorage";
import { Lists as CollectionLists } from "./Collection";
import { ScriptArgument } from "./Script";

const path: typeof NodePATH = window.nw.require("path");

export default {
	run (command: string, args: ScriptArgument[]) {
		switch (command) {
			case "title":
				config.volatile_Scene.value = "Scene_Title";
				break;

			case "unlock-all":
				Promise.all([
					fetch("/IMG/CUT/list.json").then(r => r.json()),
					fetch("/IMG/SCG/list.json").then(r => r.json()),
				]).then(([pic, scg]) => {
					GlobalStorage.Instance.seen.pic = [...new Set<string>(pic)].map(r => path.basename(r, path.extname(r)));
					GlobalStorage.Instance.seen.char = [...new Set<string>(scg)].map(r => path.basename(r, path.extname(r)));
					GlobalStorage.Instance.seen.bgm = [...new Set<string>(CollectionLists.bgm)];
					GlobalStorage.Instance.seen.ending = true;

					GlobalStorage.Instance.Save();
				});
				break;

			default:
				console.warn(`[ScriptCommand] Unknown command "${command}"`);
				break;
		}
	}
};
