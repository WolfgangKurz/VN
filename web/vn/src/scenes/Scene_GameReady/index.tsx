import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";

import config from "@/config";

// Proxy scene
const Scene_GameReady: FunctionalComponent = () => {
	useEffect(() => {
		config.volatile_Scene.value = "Scene_Game";
	}, []);

	return <></>;
};
export default Scene_GameReady;
