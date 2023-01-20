import { useEffect, useState } from "preact/hooks";

import config from "@/config";
import Loader, { LoaderProps } from "@/loader";

import SpriteImage from "@/components/SpriteImage";

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

	function RequireSprite (src: string): Promise<void> {
		return SpriteImage.load(src);
	}

	useEffect(() => {
		fetch("/game.json")
			.then(r => r.json())
			.then(async (r: GameMetadata) => {
				console.log("Game Metadata : ", r);

				const win = window.nw.Window.get();
				win.setResizable(true);
				win.resizeTo(r.width, r.height);
				win.setPosition("center");
				if (!r.resize) win.setResizable(r.resize);
				document.title = win.title = r.title;

				config.volatile_LoadingText.value = r.loading;

				await RequireSprite("UI/sprite.png");
				await RequireSprite("Option/sprite.png");
				await RequireSprite("SaveLoad/sprite.png");

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
		: <div class="loading-text">{ _loading }</div>;
};
export default App;
