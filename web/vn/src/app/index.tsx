import { useEffect, useState } from "preact/hooks";

import config from "@/config";
import Loader, { LoaderProps } from "@/loader";

import "./style.scss";

interface GameMetadata {
	width: number;
	height: number;
	title: string;
	resize: boolean;
	loading: string;
}

const App: FunctionalComponent = () => {
	const [target, setTarget] = useState<LoaderProps["component"] | undefined>(undefined);

	useEffect(() => {
		fetch("/game.json")
			.then(r => r.json())
			.then((r: GameMetadata) => {
				console.log("Game Metadata : ", r);

				const win = window.nw.Window.get();
				win.setResizable(true);
				win.resizeTo(r.width, r.height);
				if (!r.resize) win.setResizable(r.resize);
				document.title = win.title = r.title;

				config.volatile_LoadingText.value = r.loading;
				config.volatile_Scene.value = "Scene_Title";
				// config.volatile_Scene.value = "Scene_Game";
			});

		const unsub = config.volatile_Scene.subscribe(() => {
			if (config.volatile_Scene.value)
				setTarget(import(`@/scenes/${config.volatile_Scene.value}/index.tsx`));
			else
				setTarget(undefined);
		});
		return () => {
			unsub();
		};
	}, []);

	const _loading = config.volatile_LoadingText.value || "Game in loading...";
	return target
		? <Loader
			component={ target }
			loading={ _loading }
		/>
		: <>{ _loading }</>;
};
export default App;
