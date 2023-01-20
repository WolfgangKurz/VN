import config from "@/config";

import { ScriptArgument } from "./Script";

export default {
	run (command: string, args: ScriptArgument[]) {
		switch (command) {
			case "title":
				config.volatile_Scene.value = "Scene_Title";
				break;

			case "unlock-all":
				// TODO
				break;

			default:
				console.warn(`[ScriptCommand] Unknown command "${command}"`);
				break;
		}
	}
};
