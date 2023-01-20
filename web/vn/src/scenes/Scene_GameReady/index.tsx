import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import { batch } from "@preact/signals";

import config from "@/config";

// Game load Proxy scene
const Scene_GameReady: FunctionalComponent = () => {
	useEffect(() => {
		batch(() => {
			config.volatile_Chapter.value = "";
			config.volatile_Title.value = "";

			config.volatile_Scene.value = "Scene_Game";
			config.volatile_Mute.value = true;
		});
	}, []);

	return <></>;
};
export default Scene_GameReady;
