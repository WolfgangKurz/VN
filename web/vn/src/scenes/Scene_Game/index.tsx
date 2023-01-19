import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { batch } from "@preact/signals";

import SimpleBar from "simplebar-react";
import SimpleBarCore from "simplebar-core";
import "simplebar-react/dist/simplebar.min.css";

import config from "@/config";

import { Matrix4x5Identity } from "@/types/Matrix";

import { TRANSPARENT } from "@/libs/Const";
import { BuildClass } from "@/libs/ClassName";
import Wait, { WaitData } from "@/libs/Wait";
import ManagedAudio from "@/libs/ManagedAudio";
import Script, { ScriptArgument, ScriptSelection } from "@/libs/Script";

import Scene_Base from "../Scene_Base";
import Window_Menu from "@/windows/Window_Menu";
import Window_Option from "@/windows/Window_Option";
import Window_SaveLoad from "@/windows/Window_SaveLoad";

import Image from "@/components/Image";
import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Textbox, { TextboxPhase } from "./Textbox";

import style from "./style.module.scss";

type ColorFilterData = Tuple<number, 20>;

interface CharData {
	key: string;
	pos: "<<" | "<" | "left" | "center" | "right" | ">" | ">>";
	src: string;
	fx: string;
	duration: number;
	state: number; // 0:init, 1:loading, 2:loaded, 3:unloading

	colorFilter?: ColorFilterData;
	backColorFilter?: ColorFilterData;
}
interface PictureData {
	key: string;
	layer: "front" | "back";
	pos: "left-top" | "top" | "right-top" | "left" | "center" | "right" | "left-bottom" | "bottom" | "right-bottom";
	src: string;
	fadeDuration: number;
	state: number; // 0:loading, 1:loaded, 2:unloading

	colorFilter?: ColorFilterData;
	backColorFilter?: ColorFilterData;
}
interface HistoryTextData {
	teller?: string;
	text: string;
}
interface HistorySelectionData {
	selections: string[];
	selected: number;
}
type HistoryData = HistoryTextData | HistorySelectionData;

const Scene_Game: FunctionalComponent = () => {
	const [script, setScript] = useState<Script | null>(null);
	const [scriptCursor, setScriptCursor] = useState(0);
	const [scriptRun, setScriptRun] = useState(0);
	const scriptLoading = !script || script.cursor < scriptCursor;

	const next = () => setScriptRun(scriptRun + 1);
	const [assetLoaded, setAssetLoaded] = useState(false);

	const [subwindow, setSubwindow] = useState<preact.VNode | null>(null);

	//////////////////////////////

	const [hideUI, setHideUI] = useState(false);

	const [title, setTitle] = useState("");
	const [titleShow, setTitleShow] = useState(false);

	const [history, setHistory] = useState<HistoryData[]>([]);
	const [historyDisplay, setHistoryDisplay] = useState(false);
	const historyScrollboxRef = useRef<HTMLDivElement>();

	const [bgs, setBGS] = useState<ManagedAudio | undefined>(undefined);
	const [bgm, setBGM] = useState<ManagedAudio | undefined>(undefined);
	const [_, setSEs] = useState<ManagedAudio[]>([]);

	const [faded, setFaded] = useState(false);
	const [fadeDuration, setFadeDuration] = useState(0);

	const [bgImage, setBGImage] = useState("");

	const [fx, setFX] = useState<string | null>(null);
	const [fxDuration, setFXDuration] = useState(0);
	const [fxArgs, setFXArgs] = useState<ScriptArgument[]>([]);
	const [fxEnd, setFXEnd] = useState(false);
	const [fxWaiting, setFXWaiting] = useState(false);
	const ScreenEl = useRef<HTMLDivElement>(null);

	const [displayText, setDisplayText] = useState("");
	const [displayTeller, setDisplayTeller] = useState("");
	const [textState, setTextState] = useState<TextboxPhase>(TextboxPhase.None); // 0:none, 1:fade-in, 2:text-show, 3:text-shown, 4:fade-out

	const [selection, setSelection] = useState<ScriptSelection[]>([]);

	const [chars, setChars] = useState<CharData[]>([]);
	const [pics, setPics] = useState<PictureData[]>([]);

	//////////////////////////////

	const [blocks, setBlocks] = useState<WaitData[]>([]);
	function addBlock (wait: WaitData) {
		setBlocks(b => [...b, wait]);
	}

	//////////////////////////////

	const unblock = (force?: boolean) => {
		if (!script) return;
		if (!force && script.current()?.type === "sel") return;

		let flushed = false;
		setBlocks(blocks => {
			blocks.forEach(b => {
				if (!b.isDone())
					flushed = true;

				b.flush();
			});
			if (!flushed) next();

			return [];
		});
	};

	const tryNext = useCallback(() => {
		if (hideUI) {
			setHideUI(false);
			return;
		}

		if (textState !== TextboxPhase.None) {
			if (textState === TextboxPhase.Done) // text fully shown
				unblock();
			else
				setTextState(s => s + 1);
		} else
			unblock();
	}, [script, textState, hideUI]);

	//////////////////////////////

	useEffect(() => { // script load skipper
		if (!script || !scriptLoading) return;

		if (blocks.length > 0) return unblock();
	}, [scriptCursor, blocks, displayText]);

	useEffect(() => {
		if (!scriptLoading)
			config.volatile_Mute.value = false;
	}, [scriptLoading]);

	useEffect(() => { // fx worker
		let running = true;
		const begin = Date.now();
		let latest = -1;
		const fn = () => {
			if (!running) return;

			const el = ScreenEl.current;
			if (!el) return requestAnimationFrame(fn);

			const p = (Date.now() - begin) / (fxDuration * 1000);
			const cur = Math.floor(p);

			switch (fx) {
				case "shake":
					{
						const loop = fxArgs[1] as number;
						if (loop >= 0 && p >= loop) {
							running = false;
							el.style.transform = "";
							setFXEnd(true);
							return;
						}
					}

					if (latest !== cur) {
						latest = cur;

						let x = 0, y = 0;
						const th = {
							weak: 3,
							normal: 6,
							strong: 10,
						}[fxArgs[0]] || 0; // strength

						x = (Math.random() - 0.5) * th;
						y = (Math.random() - 0.5) * th;

						el.style.transitionDuration = `${fxDuration}s`;
						el.style.transform = `translate(${x}px, ${y}px)`;
					}
					break;

				case "shake_fadeout":
					if (p >= 1) {
						running = false;
						el.style.transform = "";
						setFXEnd(true);
						return;
					}

					el.style.transitionDuration = `${fxDuration}s`;
					el.style.transform = "";
					break;

				case "charfx":
					{
						if (scriptLoading) {
							running = false;
							unblock();
							return setFXEnd(true);
						}

						const target = el.querySelectorAll<HTMLImageElement>(`.${style.Char}.${PosStyles[fxArgs[0].toString()]}`);
						const charfx = fxArgs[1];
						const fxClass = style[`charfx-${charfx}`];

						if (p >= 1) {
							running = false;
							setFXEnd(true);

							target.forEach(t => {
								if (t.classList.contains(fxClass)) {
									t.classList.remove(fxClass);
									t.style.removeProperty("--charfx-duration");
								}
							});
							return;
						}

						target.forEach(t => {
							if (!t.classList.contains(fxClass)) {
								t.classList.add(fxClass);
								t.style.setProperty("--charfx-duration", `${fxDuration}s`);
							}
						});
					}
					break;
			}

			requestAnimationFrame(fn);
		};
		requestAnimationFrame(fn);

		return () => {
			running = false;
		};
	}, [fx, fxDuration, fxArgs]);

	useEffect((): void => { // script processor
		if (!script) return;

		const s = script.next();
		if (!s) return;

		const scriptLoading = script.cursor < scriptCursor;
		console.log(script.cursor, s);

		switch (s.type) {
			case "fade":
				setFadeDuration(s.fadeDuration);
				setFaded(!s.isIn);

				addBlock(Wait(s.fadeDuration * 1000, () => {
					setFadeDuration(0);
					unblock();
				}));
				break;

			case "bg":
				if (s.name === "-")
					setBGImage("");
				else
					setBGImage(`/BG/${s.name}.png`);
				unblock();
				break;

			case "bgm":
				if (!bgm) {
					console.warn("<BGM> BGM ManagedAudio instance gone");
					return unblock();
				}

				{
					const src = `/BGM/${s.name}.mp3`;
					if (bgm.src() !== src) {
						if (s.name === "-") {// unload
							if (s.fadeDuration > 0) {
								if (scriptLoading) {
									bgm.fadeOut(0);
									return unblock();
								}
								bgm.fadeOut(s.fadeDuration * 1000);

								if (!s.wait) unblock();
								addBlock(Wait(s.fadeDuration * 1000, () => {
									bgm.stop();
									if (s.wait) unblock();
								}));
								return;
							} else {
								bgm.stop();
								return unblock();
							}
						} else {
							bgm.load(src);

							bgm.play();
							if (s.fadeDuration > 0) {
								if (scriptLoading) {
									bgm.fadeIn(0);
									return unblock();
								}
								bgm.fadeIn(s.fadeDuration * 1000);

								if (!s.wait)
									unblock();
								else
									addBlock(Wait(s.fadeDuration * 1000, () => unblock()));
								return;
							} else
								return unblock();
						}
					}

					if (s.name !== "-") bgm.play();
					return unblock();
				}
			case "bgs":
				if (!bgs) {
					console.warn("<BGS> BGS ManagedAudio instance gone");
					return unblock();
				}

				{
					const src = `/SE/${s.name}.mp3`;
					if (bgs.src() !== src) {
						if (s.name === "-") {// unload
							if (s.fadeDuration > 0) {
								if (scriptLoading) {
									bgs.fadeOut(0);
									return unblock();
								}
								bgs.fadeOut(s.fadeDuration * 1000);

								if (!s.wait) unblock();

								addBlock(Wait(s.fadeDuration * 1000, () => {
									bgs.stop();
									if (s.wait) unblock();
								}));
								return;
							} else {
								bgs.stop();
								return unblock();
							}
						} else {
							bgs.load(src);

							bgs.play();
							if (s.fadeDuration > 0) {
								if (scriptLoading) {
									bgs.fadeIn(0);
									return unblock();
								}
								bgs.fadeIn(s.fadeDuration * 1000);

								if (!s.wait)
									unblock();
								else
									addBlock(Wait(s.fadeDuration * 1000, () => unblock()));
								return;
							} else
								return unblock();
						}
					}

					if (s.name !== "-") bgs.play();
					return unblock();
				}
			case "se":
				{
					if (s.name === "-") {
						setSEs(l => {
							l.forEach(se => se.destroy());
							return [];
						});
					} else {
						const se = new ManagedAudio(false);
						se.load(`/SE/${s.name}.mp3`, true);

						setSEs(l => {
							const arr: ManagedAudio[] = [];
							l.forEach(r => {
								if (r.playing) arr.push(r);
								else r.destroy();
							});
							arr.push(se);
							return arr;
						});
					}
					unblock();
				}
				break;

			case "fx":
				if (s.fx === "-") {
					setFXEnd(true);
					setFX(null);
				} else {
					setFXEnd(false);

					const args: ScriptArgument[] = [];
					switch (s.fx) {
						case "shake":
							if (!["weak", "normal", "strong"].includes(s.args[0].toString())) {
								console.warn("shake 1st parameter should be 'weak' or 'normal' or 'strong'");
								break;
							}
							if (typeof s.args[1] !== "number" && typeof s.args[1] !== "undefined") {
								console.warn("shake 2nd paramter should be Number or Undefined");
								break;
							}
							if (typeof s.args[2] !== "number" && typeof s.args[2] !== "undefined") {
								console.warn("shake 3rd paramter should be Number or Undefined");
								break;
							}

							args.push(
								s.args[0], // strength
								typeof s.args[2] === "number"
									? s.args[2] < 0 //count
										? -1
										: s.args[2]
									: 1,
							);

							setFX(s.fx);
							setFXDuration(s.args[1] ?? 2);
							setFXArgs(args);
							break;

						case "shake2":
							{
								if (scriptLoading) break; // block command

								if (!["weak", "normal", "strong"].includes(s.args[0].toString())) {
									console.warn("shake2 1st parameter should be 'weak' or 'normal' or 'strong'");
									break;
								}
								if (typeof s.args[1] !== "number" && typeof s.args[1] !== "undefined") {
									console.warn("shake2 2nd paramter should be Number or Undefined");
									break;
								}
								if (typeof s.args[2] !== "number" && typeof s.args[2] !== "undefined") {
									console.warn("shake2 3rd paramter should be Number or Undefined");
									break;
								}

								const dur = s.args[1] ?? 2;
								const count = typeof s.args[2] === "number"
									? s.args[2] < 0 //count
										? -1
										: s.args[2]
									: 1;

								if (count < 0) {
									console.warn("shake2 cannot looped");
									break;
								}

								args.push(
									s.args[0], // strength
									count,
								);

								setFX("shake");
								setFXDuration(dur);
								setFXArgs(args);

								addBlock(Wait(dur * count * 1000, () => {
									unblock();
								}));
							}
							return;

						case "shake_fadeout":
							{
								if (typeof s.args[0] !== "number" && typeof s.args[0] !== "undefined") {
									console.warn("shake_fadeout argument should be Number");
									break;
								}

								setFX(s.fx);
								setFXDuration(s.args[0] ?? 2);
								setFXArgs([
									`${s.args[0] ?? 2}s`, // duration
								]);

								addBlock(Wait((s.args[0] ?? 2) * 1000, () => {
									unblock();
								}));
							}
							break;

						case "charfx":
							if (!["left", "center", "right"].includes(s.args[0].toString())) {
								console.warn("charfx 1st parameter should be 'left' or 'center' or 'right'");
								break;
							}
							if (typeof s.args[1] !== "number") {
								console.warn("charfx 2nd parameter should be Number");
								break;
							}
							if (!["jump", "jump-short", "shake", "shake-weak"].includes(s.args[2].toString())) {
								console.warn("charfx 3rd parameter should be 'jump' or 'jump-short' or 'shake'");
								break;
							}

							args.push(
								s.args[0], // position
								s.args[2], // fx
							);

							setFX(s.fx);
							setFXDuration(s.args[1]);
							setFXArgs(args);

							addBlock(Wait(s.args[1] * 1000, () => {
								unblock();
							}));
							return;

						default:
							setFXEnd(true);
							console.warn(`Unknown FX "${s.fx}"`);
							break;
					}
				}
				return unblock();

			case "script": // load next script
				batch(() => {
					config.volatile_Script.value = s.script;
					config.volatile_ScriptCursor.value = 0;
				});
				break;

			case "title": // scene title
				config.volatile_Title.value = s.title;
				unblock();
				break;

			case "chapter": // chapter text
				config.volatile_Chapter.value = s.chapter;
				unblock();
				break;

			case "set":
				console.log("Session var set, " + s.name + " -> " + s.value);
				config.session_Data.peek().set(s.name, s.value);
				unblock();
				break;

			case "if":
				{
					const v = config.session_Data.peek().get(s.var) || ""; // 값이 지정되지 않았으면 빈 문자열로 취급
					if (s.conds.some(r => {
						if (r.value === v) { // 일치하는 경우
							batch(() => {
								config.volatile_Script.value = r.to;
								config.volatile_ScriptCursor.value = 0;
							});
							return true;
						}
						return false;
					}))
						unblock();
				}
				break;

			case "wait":
				if (typeof s.wait === "number")
					addBlock(Wait(s.wait * 1000, () => unblock()));
				else
					setFXWaiting(true);
				return;

			case "text":
				if (scriptLoading) return unblock();
				setHistory(prev => [...prev, { text: s.text }]);

				setDisplayText(s.text);
				setDisplayTeller("");
				setTextState(s => s === TextboxPhase.None ? TextboxPhase.FadeIn : TextboxPhase.SequencingText);
				break;
			case "talk":
				if (scriptLoading) return unblock();
				setHistory(prev => [...prev, { teller: s.teller, text: s.text }]);

				setDisplayText(s.text);
				setDisplayTeller(s.teller);
				setTextState(s => s === TextboxPhase.None ? TextboxPhase.FadeIn : TextboxPhase.SequencingText);
				break;
			case "clear":
				if (scriptLoading || textState === TextboxPhase.None) return unblock();

				setDisplayTeller("");
				setTextState(TextboxPhase.FadeOut);
				break;

			case "sel":
				if (scriptLoading) return unblock();

				setSelection(s.sels);
				break;

			case "char":
				{
					const removeAt = (position: CharData["pos"], duration: number) => {
						setChars(_chars => {
							const chars = [..._chars];
							let keys: string[] = [];

							chars.forEach(c => {
								if (c.pos === position) {
									c.state = 3; // unload same position
									c.fx = s.fx;
									c.duration = duration;
									keys.push(c.key);
								}
							});

							if (keys.length > 0) {
								addBlock(Wait(duration * 1000, () => {
									setChars(p => p.filter(r => r && !keys.includes(r.key)));
									unblock();
								}));
							} else
								unblock();

							return chars;
						});
					};

					if (s.name === "-")
						removeAt(s.position, s.fxDuration);
					else {
						const src = `/IMG/SCG/${s.name}.png`;
						if (chars.some(c => c.pos === s.position && c.state <= 2 && c.src === src)) // 표시될/표시중인 동일한 캐릭터가 존재
							return unblock();

						const img = new window.Image();
						img.addEventListener("load", (e) => {
							e.preventDefault();

							removeAt(s.position, s.fxDuration);

							if (s.fxDuration <= 0) {
								setChars(_chars => {
									const key = Math.floor(Math.random() * 100000).toString();
									const chars = [..._chars, {
										key,
										pos: s.position,
										src,
										fx: s.fx,
										duration: s.fxDuration,
										state: 2,
									} satisfies CharData];
									unblock();

									return chars;
								});
							} else {
								setChars(_chars => [..._chars, {
									key: Math.floor(Math.random() * 100000).toString(),
									pos: s.position,
									src,
									fx: s.fx,
									duration: s.fxDuration,
									state: 0,
								} satisfies CharData]);
							}
						});
						img.src = `/IMG/SCG/${s.name}.png`;
					}
				}
				break;

			case "pic":
			case "bpic":
				if (s.name === "-") {
					if (pics[s.id] === undefined) return unblock(); // already empty

					setPics(_pics => {
						const pics = [..._pics];

						addBlock(Wait(s.fadeDuration * 1000, () => {
							setPics(_pics => {
								const pics = [..._pics];
								delete pics[s.id];
								return pics;
							});

							unblock();
						}));

						pics[s.id].fadeDuration = s.fadeDuration;
						pics[s.id].state = 3;
						return pics;
					});
				} else {
					setPics(_pics => {
						const pics = [..._pics];

						pics[s.id] = {
							key: Math.floor(Math.random() * 100000).toString(),
							layer: s.type === "pic" ? "front" : "back",
							pos: s.position,
							src: `/IMG/CUT/${s.name}.png`,
							fadeDuration: s.fadeDuration,
							state: 0,
						};
						return pics;
					});
				}
				break;

			case "filter":
			case "bfilter":
				if (s.target === "char") {
					const target = chars.find(c => c.state === 2 && c.pos === s.position);
					if (!target) return unblock();

					const base = target.colorFilter || Matrix4x5Identity; // identity
					const key = target.key;
					const update = (v: number) => {
						const values = base.map((b, i) => b + (s.values[i] - b) * v) as Tuple<number, 20>;
						setChars(chars => {
							return chars.map(c => {
								if (c.key !== key) return c;

								const ret = { ...c };
								if (s.type === "filter")
									ret.colorFilter = values;
								else
									ret.backColorFilter = values;
								return ret;
							});
						});
					};

					let running = true;
					const begin = Date.now();
					const fn = () => {
						const e = Date.now() - begin;
						const p = Math.min(1, e / (s.duration * 1000));
						if (!running || p >= 1) return;

						update(p);
						requestAnimationFrame(fn);
					};
					requestAnimationFrame(fn);

					addBlock(Wait(s.duration * 1000, () => {
						update(1);

						running = false;
						unblock();
					}));
				} else {
					const target = pics[s.id];
					if (!target) return unblock();

					const base = target.colorFilter || Matrix4x5Identity; // identity
					const update = (v: number) => {
						const values = base.map((b, i) => b + (s.values[i] - b) * v) as Tuple<number, 20>;
						setPics(_pics => {
							const pics = [..._pics];

							if (s.type === "filter")
								pics[s.id].colorFilter = values;
							else
								pics[s.id].backColorFilter = values;

							return pics;
						});
					};

					let running = true;
					const begin = Date.now();
					const fn = () => {
						const e = Date.now() - begin;
						const p = Math.min(1, e / (s.duration * 1000));
						if (!running || p >= 1) return;

						update(p);
						requestAnimationFrame(fn);
					};
					requestAnimationFrame(fn);

					addBlock(Wait(s.duration * 1000, () => {
						update(1);

						running = false;
						unblock();
					}));
				}
				break;
		}
	}, [script, scriptRun]);

	useEffect(() => {
		if (!fxEnd || !fxWaiting) return;
		setFXWaiting(false);

		console.log("fx end");
		unblock();
	}, [fxEnd, fxWaiting]);

	useLayoutEffect(() => {
		if (!assetLoaded) {
			SpriteImage.load("UI/sprite.png")
				.then(() => setAssetLoaded(true));
			return;
		}

		const script = new Script();
		const unsub = config.volatile_Script.subscribe(v => {
			console.log("New script requsted -> " + v);

			script.unload();
			setScript(null);
			config.volatile_Mute.value = true;

			if (v) {
				fetch(`/SCRIPT/${v}.vn`)
					.then(r => r.text())
					.then(r => {
						script.load(r);
						setScript(script);
						setScriptCursor(config.volatile_ScriptCursor.peek());

						console.log(config.volatile_ScriptCursor.peek());
					});
			}
		});

		let lastTitleWait: WaitData | undefined = undefined;

		const titleUnsub = config.volatile_Title.subscribe(v => {
			setTitle(v);
			setTitleShow(true);

			if (lastTitleWait) {
				lastTitleWait.cancel();
				lastTitleWait = undefined;
			}

			lastTitleWait = Wait(4000, () => setTitleShow(false));
		});

		const bgs = new ManagedAudio(false);
		bgs.loop(true);
		setBGS(bgs);

		const bgm = new ManagedAudio(true);
		setBGM(bgm);

		return () => {
			bgs.destroy();
			bgm.destroy();
			titleUnsub();
			unsub();
		};
	}, [assetLoaded]);

	useEffect(() => {
		if (chars.some(r => r.state === 0)) {
			setChars(_chars => {
				const dur = _chars
					.filter(r => r.state === 0)
					.reduce((p, c) => p > c.duration ? p : c.duration, 0);

				if (scriptLoading)
					unblock();
				else
					Wait(dur * 1000, () => unblock());

				return _chars.map(r => r.state === 0 ? ({ ...r, state: 1 }) : r);
			});
		}
	}, [chars]);
	useEffect(() => {
		if (pics.some(r => r && r.state === 0)) {
			setPics(_pics => {
				const dur = _pics
					.filter(r => r && r.state === 0)
					.reduce((p, c) => p > c.fadeDuration ? p : c.fadeDuration, 0);

				if (scriptLoading)
					unblock();
				else
					Wait(dur * 1000, () => unblock());

				return _pics.map(r => r && r.state === 0 ? ({ ...r, state: 1 }) : r);
			});
		}
	}, [pics]);

	useEffect(() => { // Global effect register
		const fn = (e: KeyboardEvent) => {
			if (selection.length > 0)
				return; // Selection exists

			if (e.key === "Enter" || e.key === " ") {
				if (!e.repeat)
					tryNext();
			} else if (e.key === "Control")
				tryNext(); // keep run
		};

		window.addEventListener("keydown", fn);
		return () => {
			window.removeEventListener("keydown", fn);
		};
	}, [script, selection, textState]);

	useEffect(() => {
		const ref = historyScrollboxRef.current;
		if (!ref) return;

		ref.scrollTo({
			top: ref.scrollHeight,
		});
	}, [history, historyScrollboxRef]);

	const PosStyles = {
		"<<": style.LeftMin,
		"<": style.LeftMinOver,
		"left-top": style.LeftTop,
		top: style.Top,
		"right-top": style.RightTop,
		left: style.Left,
		center: style.Center,
		right: style.Right,
		"left-bottom": style.LeftBottom,
		bottom: style.Bottom,
		"right-bottom": style.RightBottom,
		">": style.RightMinOver,
		">>": style.RightMin,
	};

	function ColorMatrixToSVGUrl (colorMatrix: Tuple<number, 20>): string {
		const v = colorMatrix.map(r => parseFloat(r.toFixed(3)));
		return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="f"><feColorMatrix in="SourceGraphic" type="matrix" values="${v.join(" ")}" /></filter></defs></svg>#f')`;
	}

	function SetSaveLoadWindow (isSave: boolean) {
		setSubwindow(<Window_SaveLoad
			isSave={ isSave }
			canSave
			scriptCursor={ script?.cursor ?? 0 }
			onClose={ () => setSubwindow(null) }
			onModeChange={ mode => {
				if ((mode === "save" && isSave) || (mode === "load" && !isSave)) return;

				SetSaveLoadWindow(!isSave);
			} }
		/>);
	}

	return <>
		<Scene_Base
			class={ BuildClass("Scene_Game", style.Scene_Game, hideUI && style.HideUI) }
			onClick={ e => {
				e.preventDefault();

				if (e.target && (e.target instanceof Element) && (e.target.matches(`.${style.Selection}`) || e.target.matches(`.${style.Sel}`)))
					return; // Selection click

				tryNext();
			} }
		>
			<div
				class={ BuildClass("Screen", style.Screen) }
				ref={ ScreenEl }
			>
				{ bgImage
					? <Image
						class={ style.BG }
						src={ bgImage }
						exts={ [".jpg", ".png"] }
						onError={ e => {
							e.preventDefault();
							console.warn(`<BG> Failed to load image ${bgImage}`);
						} }
					/>
					: <img class={ style.BG } src={ TRANSPARENT } />
				}

				{ chars.map((c, i) => c
					? <img
						key={ `char-key-${c.key}` }
						class={ BuildClass(
							style.Char,
							PosStyles[c.pos],
							style[`fx-${c.fx}`],
							c.state === 1 && style.Loading,
							c.state === 2 && style.Loaded,
							c.state === 3 && style.Unloading,
						) }
						src={ c.src }
						style={ {
							"--fx-duration": `${c.duration}s`,
							filter: c.colorFilter ? ColorMatrixToSVGUrl(c.colorFilter) : undefined,
							backdropFilter: c.backColorFilter ? ColorMatrixToSVGUrl(c.backColorFilter) : undefined,
						} }
					/>
					: <></>
				) }

				{ pics.map((p, i) => p
					? <Image
						key={ `pic-key-${p.key}` }
						class={ BuildClass(
							style.Picture,
							p.layer === "front" ? style.FrontLayer : style.BackLayer,
							PosStyles[p.pos],
							p.state === 1 && style.Loading,
							p.state === 2 && style.Loaded,
							p.state === 3 && style.Unloading,
						) }
						src={ p.src }
						exts={ [".png", ".jpg"] }
						style={ {
							"--fx-duration": `${p.fadeDuration}s`,
							filter: p.colorFilter ? ColorMatrixToSVGUrl(p.colorFilter) : undefined,
							backdropFilter: p.backColorFilter ? ColorMatrixToSVGUrl(p.backColorFilter) : undefined,
						} }
					/>
					: <></>
				) }

				<div
					class={ BuildClass(style.Fader, faded && style.Faded) }
					style={ {
						"--fade-duration": `${fadeDuration}s`,
						transition: fadeDuration === 0 ? "none" : undefined,
					} }
				/>
			</div>

			<Textbox
				class={ style.Textbox }
				text={ displayText }
				teller={ displayTeller }

				phase={ textState }

				onShown={ () => setTextState(TextboxPhase.SequencingText) }
				onTextDone={ () => setTextState(TextboxPhase.Done) }
				onHidden={ () => {
					setTextState(TextboxPhase.None);
					unblock();
				} }
			/>

			<div class={ BuildClass(
				style.SideButtons,
				displayText && style.Display,
			) }>
				<SpriteButton
					src="UI/sprite.png"
					idle="btn_history.png"
					hover="btn_history_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						setHistoryDisplay(true);
					} }
				/>
				<SpriteButton
					src="UI/sprite.png"
					idle="btn_auto.png"
					hover="btn_auto_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();
					} }
				/>
				<SpriteButton
					src="UI/sprite.png"
					idle="btn_save.png"
					hover="btn_save_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						SetSaveLoadWindow(true);
					} }
				/>
				<SpriteButton
					src="UI/sprite.png"
					idle="btn_load.png"
					hover="btn_load_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						SetSaveLoadWindow(false);
					} }
				/>
				<SpriteButton
					src="UI/sprite.png"
					idle="btn_ui.png"
					hover="btn_ui_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						setHideUI(true);
					} }
				/>
			</div>

			{ selection.length > 0
				? <div class={ style.Selection }>
					{ selection.map((sel, id) => {
						return <div
							class={ style.Sel }
							onClick={ e => {
								e.preventDefault();
								e.stopPropagation();

								setHistory(prev => [...prev, {
									selections: selection.map(r => r.display),
									selected: id,
								}]);

								if (sel.script !== "-") {
									batch(() => {
										config.volatile_Script.value = sel.script;
										config.volatile_ScriptCursor.value = 0;
									});
								} else
									unblock(true);

								setSelection([]);
							} }
						>
							<SpriteImage
								class={ style.Normal }
								src="UI/sprite.png"
								sprite="btn_selection.png"
							/>
							<SpriteImage
								class={ style.Active }
								src="UI/sprite.png"
								sprite="btn_selection_down.png"
							/>

							{ sel.display }
						</div>;
					}) }
				</div>
				: <></>
			}

			<div class={ BuildClass(style.Title, titleShow && style.Display) }>
				<span>{ title }</span>
				{ title }
			</div>

			<div class={ BuildClass(style.ScriptLoading, scriptLoading && style.Display) }>
				{ config.volatile_LoadingText.value }
			</div>
		</Scene_Base>

		<div
			class={ BuildClass(style.History, historyDisplay && style.Display) }
			onClick={ e => {
				e.preventDefault();
				e.stopPropagation();

				if (historyDisplay)
					setHistoryDisplay(false);
			} }
		>
			<div class={ style.HistoryBox }>
				<SpriteImage
					class={ style.Background }
					src="UI/sprite.png"
					sprite="history_box.png"
				/>

				<div class={ style.HistoryContent }>
					<SimpleBar
						forceVisible="y"
						autoHide={ false }
						style={ { paddingRight: 15, height: 646 } }
						scrollableNodeProps={ { ref: historyScrollboxRef } }
					>
						{ history.map(h =>
							"text" in h
								? <div class={ style.TextHistory }>
									{ h.teller && <span class={ style.TellerHistory }>{ h.teller }</span> }
									{ h.text }
								</div>
								: <div class={ style.SelectionHistory }>
									{ h.selections.map((s, i) => <div class={ BuildClass(style.Selection, i === h.selected && style.Selected) }>
										{ s }
									</div>) }
								</div>
						) }
					</SimpleBar>
				</div>
			</div>
		</div>

		<SpriteButton
			class={ style.MenuButton }
			src="UI/sprite.png"
			idle="btn_menu.png"
			active="btn_menu_down.png"
			onClick={ e => {
				e.preventDefault();
				e.stopPropagation();

				setSubwindow(<Window_Menu
					onClose={ () => setSubwindow(null) }
				/>);
			} }
		/>
		<SpriteButton
			class={ style.OptionButton }
			src="UI/sprite.png"
			idle="btn_settings.png"
			active="btn_settings_down.png"
			onClick={ e => {
				e.preventDefault();
				e.stopPropagation();

				setSubwindow(<Window_Option
					onClose={ () => setSubwindow(null) }
				/>);
			} }
		/>

		<div class={ style.Subwindow }>
			{ subwindow }
		</div>
	</>;
};
export default Scene_Game;
