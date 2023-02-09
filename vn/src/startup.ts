import { batch } from "@preact/signals";

import config from "@/config";

import GlobalStorage from "./libs/GlobalStorage";

export function StartupScript () {
	let collectionUpdated = false;

	if (!GlobalStorage.Instance.seen.bgm.includes("Title1")) {
		GlobalStorage.Instance.seen.bgm.push("Title1");
		collectionUpdated = true;
	}
	if (!GlobalStorage.Instance.seen.pic.includes("Title_01")) {
		GlobalStorage.Instance.seen.pic.push("Title_01");
		collectionUpdated = true;
	}

	if (collectionUpdated)
		GlobalStorage.Instance.Save();


	batch(() => {
		// config.session_Data.peek().data.vars["1-4_sel"] = "2";

		config.volatile_Script.value = "7-1";
		config.volatile_ScriptCursor.value = 264;
	});
}
