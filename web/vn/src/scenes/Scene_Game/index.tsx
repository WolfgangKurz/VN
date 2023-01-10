import { useEffect, useLayoutEffect, useState } from "preact/hooks";

import config from "@/config";

import { TRANSPARENT } from "@/libs/Const";
import { BuildClass } from "@/libs/ClassName";
import Wait from "@/libs/Wait";
import ManagedAudio from "@/libs/ManagedAudio";
import Script from "@/libs/Script";

import Scene_Base from "../Scene_Base";

import Window_Option from "@/windows/Window_Option";

import style from "./style.module.scss";

const Scene_Game: FunctionalComponent = () => {
	const [script, setScript] = useState<Script | null>(null);
	const [scriptRun, setScriptRun] = useState(0);
	const next = () => setScriptRun((scriptRun + 1) % 2);

	//////////////////////////////

	const [bgs, setBGS] = useState<ManagedAudio | undefined>(undefined);
	const [bgm, setBGM] = useState<ManagedAudio | undefined>(undefined);

	const [faded, setFaded] = useState(false);
	const [fadeDuration, setFadeDuration] = useState(0);

	const [bgImage, setBGImage] = useState("");
	const [bgExt, setBGExt] = useState("");

	useEffect((): void => {
		if (!script) return;

		const s = script.next();
		if (!s) return;

		console.log(s);

		switch (s.type) {
			case "fade":
				setFadeDuration(s.fadeDuration);
				setFaded(!s.isIn);

				Wait(s.fadeDuration * 1000).then(next);
				return;

			case "bg":
				setBGImage(`/BG/${s.name}`);
				setBGExt(".jpg");
				return next();

			case "bgm":
				if (!bgm) {
					console.warn("<BGM> BGM ManagedAudio instance gone");
					return next();
				}

				{
					const src = `/BGM/${s.name}.mp3`;
					if (bgm.src() !== src) {
						if (s.name === "-") {// unload
							if (s.fadeDuration > 0) {
								bgm.fadeOut(s.fadeDuration * 1000);
								Wait(s.fadeDuration * 1000).then(() => {
									bgm.stop();
									next();
								});
								return;
							} else {
								bgm.stop();
								return next();
							}
						} else {
							bgm.load(src);

							bgm.play();
							if (s.fadeDuration > 0) {
								bgm.fadeIn(s.fadeDuration * 1000);
								Wait(s.fadeDuration * 1000).then(() => next());
								return;
							} else
								return next();
						}
					}

					if (s.name !== "-") bgm.play();
					return next();
				}
			case "bgs":
				if (!bgs) {
					console.warn("<BGS> BGS ManagedAudio instance gone");
					return next();
				}

				{
					const src = `/SE/${s.name}.mp3`;
					if (bgs.src() !== src) {
						if (s.name === "-") {// unload
							if (s.fadeDuration > 0) {
								bgs.fadeOut(s.fadeDuration * 1000);
								Wait(s.fadeDuration * 1000).then(() => {
									bgs.stop();
									next();
								});
								return;
							} else {
								bgs.stop();
								return next();
							}
						} else {
							bgs.load(src);

							bgs.play();
							if (s.fadeDuration > 0) {
								bgs.fadeIn(s.fadeDuration * 1000);
								Wait(s.fadeDuration * 1000).then(() => next());
								return;
							} else
								return next();
						}
					}

					if (s.name !== "-") bgs.play();
					return next();
				}
		}
	}, [script, scriptRun]);

	useLayoutEffect(() => {
		const script = new Script();
		const unsub = config.volatile_Script.subscribe(v => {
			script.unload();

			if (v) {
				fetch(`/SCRIPT/${v}.vn`)
					.then(r => r.text())
					.then(r => {
						script.load(r);
						setScript(script);
					});
			}
		});

		const bgs = new ManagedAudio(false);
		bgs.loop(true);
		setBGS(bgs);

		const bgm = new ManagedAudio(true);
		setBGM(bgm);

		config.volatile_Script.value = "1-1";

		return () => {
			bgs.destroy();
			bgm.destroy();
			unsub();
		};
	}, []);

	return <Scene_Base>
		<img
			class={ style.BG }
			src={ bgImage ? `${bgImage}${bgExt}` : TRANSPARENT }
			onError={ e => {
				e.preventDefault();

				if (bgExt === ".jpg")
					setBGExt(".png");
				else
					console.warn(`<BG> Failed to load image ${bgImage}`);
			} }
		/>
		<div
			class={ BuildClass(style.Fader, faded && style.Faded) }
			style={ { "--fade-duration": `${fadeDuration}s` } }
		/>

		<Window_Option />
	</Scene_Base>;
};
export default Scene_Game;
