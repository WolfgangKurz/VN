import { useCallback, useEffect, useState } from "preact/hooks";
import { useSignal } from "@preact/signals";

import config from "@/config";
import withToClassComponent from "@/loader/hoc";

import Wait from "@/libs/Wait";
import ManagedAudio from "@/libs/ManagedAudio";

import SpriteButton from "@/components/SpriteButton";

import Scene_Base from "../Scene_Base";
import Window_Option from "@/windows/Window_Option";
import Window_SaveLoad from "@/windows/Window_SaveLoad";

import style from "./style.module.scss";

const Scene_Title: FunctionalComponent = () => {
	const phase = useSignal<string[]>([]);
	const [subwindow, setSubwindow] = useState<preact.VNode | undefined>(undefined);
	const [bgm, setBGM] = useState<ManagedAudio | undefined>(undefined);

	const addPhase = useCallback((p: string): void => {
		const list = [...phase.value];
		list.push(p);
		phase.value = list;
	}, [phase]);

	useEffect(() => {
		Wait(1000, () => {
			addPhase("title"); // Title fade-in

			Wait(1000, () => {
				addPhase("logo"); // Logo fade-in
			});
		});

		const bgm = new ManagedAudio(true);
		bgm.load("/BGM/title_first.mp3", true);
		setBGM(bgm);

		return () => {
			bgm.destroy();
		};
	}, []);

	return <Scene_Base id={ style.Scene_Title } data-phase={ phase.value.join(",") }>
		<img
			class={ style.BG }
			src="/BG/BG_Title.png"
		/>
		<img
			class={ style.Logo }
			src="/IMG/logo1.png"
		/>

		<div class={ style.ButtonLayer }>
			{ ["start", "load", "collection", "option"].map(k =>
				<SpriteButton
					class={ style.Button }
					src="Title/sprite.png"
					idle={ `btn_${k}.png` }
					hover={ new Array(4).fill(0).map((_, i) => `btn_${k}_hover${i + 1}.png`) }

					disabled={ phase.value.includes("exit") }
					onClick={ e => {
						e.preventDefault();
						if (phase.value.includes("exit")) return; // fading out

						switch (k) {
							case "start":
								addPhase("exit");
								if (bgm) bgm.fadeOut(3000); // 3s fade out

								Wait(4000, () => { // 3s fade, 1s waiting
									config.volatile_Scene.value = "Scene_Game";
								});
								break;
							case "load":
								setSubwindow(<Window_SaveLoad
									isSave={ false }
									canSave={ false }

									onClose={ () => setSubwindow(undefined) }
								/>);
								break;
							case "option":
								setSubwindow(<Window_Option
									onClose={ () => setSubwindow(undefined) }
								/>);
								break;
						}
					} }
				/>
			) }
		</div>
		<div class={ style.BlackScreen } />

		{ subwindow }
	</Scene_Base>;
};
export default withToClassComponent(Scene_Title);
