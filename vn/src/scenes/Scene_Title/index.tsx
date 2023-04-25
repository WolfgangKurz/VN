import { useCallback, useEffect, useState } from "preact/hooks";
import { batch, useSignal } from "@preact/signals";

import config from "@/config";
import withToClassComponent from "@/loader/hoc";
import { static_PlayUISE } from "@/static";

import { Wait } from "@/libs/Blockable";
import ManagedAudio from "@/libs/ManagedAudio";
import GlobalStorage from "@/libs/GlobalStorage";

import SpriteButton from "@/components/SpriteButton";

import Scene_Base from "../Scene_Base";
import Window_SaveLoad from "@/windows/Window_SaveLoad";
import Window_Collection from "@/windows/Window_Collection";
import Window_Option from "@/windows/Window_Option";

import style from "./style.module.scss";

interface TitleStarFX {
	x: number;
	y: number;
	s: number;
	t: number;
}

const Scene_Title: FunctionalComponent = () => {
	const phase = useSignal<string[]>([]);
	const [subwindow, setSubwindow] = useState<preact.VNode | undefined>(undefined);
	const [bgm, setBGM] = useState<ManagedAudio | undefined>(undefined);

	const [titleStars] = useState<TitleStarFX[]>(() => {
		const r2 = () => Math.random() * 2;
		return [
			{ x: 116, y: 79, s: 0.67, t: r2() },
			{ x: 22, y: 160, s: 0.63, t: r2() },
			{ x: 185, y: 143, s: 1.12, t: r2() },
			{ x: 126, y: 236, s: 1.05, t: r2() },
			{ x: 382, y: 66, s: 1.21, t: r2() },
			{ x: 396, y: 190, s: 0.77, t: r2() },
			{ x: 312, y: 287, s: 0.7, t: r2() },
			{ x: 577, y: 377, s: 0.54, t: r2() },
			{ x: 723, y: 217, s: 1.33, t: r2() },
			{ x: 881, y: 43, s: 0.75, t: r2() },
			{ x: 1173, y: 58, s: 1.12, t: r2() },
		];
	});

	const addPhase = useCallback((p: string): void => {
		const list = [...phase.value];
		list.push(p);
		phase.value = list;
	}, [phase]);

	useEffect(() => {
		if (!bgm) return;

		const unsub = config.volatile_TitleBGMPause.subscribe(pause => {
			if (pause) {
				if (bgm.playing) {
					bgm.fadeOut(500);
					Wait(500, () => bgm.pause());
				}
			} else {
				if (!bgm.playing)
					bgm.play().then(() => bgm.fadeIn(500));
			}
		});

		return () => unsub();
	}, [bgm]);

	useEffect(() => {
		addPhase("title"); // Title fade-in

		Wait(2000, () => {
			addPhase("logo"); // Logo fade-in
		});

		let bgm: ManagedAudio | undefined = undefined;
		if (!bgm) {
			bgm = new ManagedAudio(true);
			bgm.load(`/BGM/Title${GlobalStorage.Instance.seen.ending ? 2 : 1}.mp3`);
			bgm.play();
			setBGM(bgm);
		}

		return () => {
			bgm?.destroy();
		};
	}, []);

	return <Scene_Base id={ style.Scene_Title } data-phase={ phase.value.join(",") }>
		<div class={ style.BG }>
			<img src="/BG/BG_Title.png" />
			<img src={ `/BG/BG_Title${GlobalStorage.Instance.seen.ending ? 2 : 1}.png` } />
		</div>

		<img
			class={ style.Logo }
			src="/IMG/logo1.png"
		/>

		{ /* Star FX */ titleStars.map(l => <>
			<img
				class={ style.StarFX }
				src="/IMG/FX/star.png"
				style={ {
					left: `${l.x}px`,
					top: `${l.y}px`,
					animationDelay: `${l.t}s`,
					transform: `translate(-50%, -50%) scale(${l.s * 1.7})`,
				} }
			/>
			<img
				class={ style.StarFX }
				src="/IMG/FX/star.png"
				style={ {
					left: `${l.x}px`,
					top: `${l.y}px`,
					animationDelay: `${l.t}s`,
					transform: `translate(-50%, -50%) scale(${l.s * 2.2})`,
					filter: "opacity(0.4)",
				} }
			/>
		</>) }

		<div class={ style.ButtonLayer }>
			{ ["start", "load", "collection", "option"].map(k =>
				<SpriteButton
					class={ style.Button }
					src="Title/sprite.png"
					idle={ `btn_${k}.png` }
					hover={ new Array(4).fill(0).map((_, i) => `btn_${k}_hover${i + 1}.png`) }

					disabled={ phase.value.includes("exit") }

					onPointerEnter={ e => {
						static_PlayUISE("hover");
					} }

					onClick={ e => {
						e.preventDefault();
						if (phase.value.includes("exit")) return; // fading out

						static_PlayUISE("click");

						switch (k) {
							case "start":
								addPhase("exit");
								if (bgm) bgm.fadeOut(3000); // 3s fade out

								Wait(4000, () => { // 3s fade, 1s waiting
									batch(() => {
										config.volatile_Scene.value = "Scene_GameReady";
										config.volatile_Script.value = "0";
										config.volatile_ScriptCursor.value = 0;

										config.session_Data.peek().clear();
										config.volatile_Chapter.value = "";
										config.volatile_Title.value = "";
									});
								});
								break;
							case "load":
								setSubwindow(<Window_SaveLoad
									isSave={ false }
									canSave={ false }

									onClose={ () => setSubwindow(undefined) }
								/>);
								break;
							case "collection":
								setSubwindow(<Window_Collection
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

		<div class={ style.Version }>
			{ import.meta.env.VERSION }
		</div>

		<div class={ style.BlackScreen } />

		{ subwindow }
	</Scene_Base>;
};
export default withToClassComponent(Scene_Title);
