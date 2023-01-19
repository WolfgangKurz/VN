import { batch } from "@preact/signals";

import config from "@/config";

export function StartupScript () {
	batch(() => {
		config.session_Data.peek().set("1-4_sel", "2");

		// config.volatile_Script.value = "3-3";
		// config.volatile_ScriptCursor.value = 60;
		config.volatile_Script.value = "1-3-0";
		config.volatile_ScriptCursor.value = 0;
	});
}
