import { batch } from "@preact/signals";

import config from "@/config";

export function StartupScript () {
	batch(() => {
		// config.session_Data.peek().data.vars["1-4_sel"] = "2";

		// config.volatile_Script.value = "3-3";
		// config.volatile_ScriptCursor.value = 60;
	});
}
