import { createRef } from "preact";
import { Ref, useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { batch } from "@preact/signals";
import debounce from "lodash.debounce";

import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import config from "@/config";
import { static_PlayUISE } from "@/static";

import { Matrix4x5Identity } from "@/types/Matrix";

import GlobalStorage from "@/libs/GlobalStorage";
import { TRANSPARENT } from "@/libs/Const";
import { BuildClass } from "@/libs/ClassName";
import Wait, { WaitData } from "@/libs/Wait";
import { input2matrix } from "@/libs/Matrix";
import ManagedAudio from "@/libs/ManagedAudio";
import ScriptCommand from "@/libs/ScriptCommand";
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
import ColorFilter from "@/libs/ColorFilter";

interface ColorFilterData {
	type: "" | "circle";
	duration: number;
	begin: number;
	from: Tuple<number, 20>;
	to: Tuple<number, 20>;
	current: Tuple<number, 20>;
}

interface CharData {
	key: string;
	pos: "<<" | "<" | "left" | "center" | "right" | ">" | ">>";
	src: string;
	fx: string;
	duration: number;
	scale: number;
	state: number; // 0:init, 1:loading, 2:loaded, 3:unloading

	colorFilter?: ColorFilter;
	backColorFilter?: ColorFilter;
	el: Ref<HTMLImageElement>;
}
interface PictureData {
	key: string;
	layer: "front" | "back";
	pos: "left-top" | "top" | "right-top" | "left" | "center" | "right" | "left-bottom" | "bottom" | "right-bottom";
	src: string;
	fadeDuration: number;
	state: number; // 0:init, 1:loading, 2:loaded, 3:unloading

	colorFilter?: ColorFilter;
	backColorFilter?: ColorFilter;
	el: Ref<HTMLImageElement>;
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

const autoSprites = new Array(16).fill(0).map((_, i) => `btn_auto_on${(i + 1).toString().padStart(2, "0")}.png`);

const Scene_Game: FunctionalComponent = () => {
	const [script, setScript] = useState<Script | null>(null);
	const [scriptCursor, setScriptCursor] = useState(0);
	const [scriptRun, setScriptRun] = useState(0);
	const scriptLoading = !script || script.cursor < scriptCursor;

	const next = () => setScriptRun((scriptRun + 1) % 100000);
	const [assetLoaded, setAssetLoaded] = useState(false);

	const [subwindow, setSubwindow] = useState<preact.VNode | null>(null);

	//////////////////////////////

	const [hideUI, setHideUI] = useState(false);
	const [doAuto, setDoAuto] = useState(false);

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
	const [textStyle, setTextStyle] = useState<"normal" | "bold" | "italic" | "bi">("normal");

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
		if (!force && script.current()?.type === "sel") {
			console.warn("dismiss unblock, not force, selection now");
			return;
		}

		// console.log(new Error().stack);

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
		if (!script) return; // 스크립트를 불러오기 전
		if (hideUI) {
			setHideUI(false);
			return;
		}

		if (textState !== TextboxPhase.None) {
			if (textState === TextboxPhase.Done) // text fully shown
				unblock();
			else
				setTextState(s => Math.min(s + 1, TextboxPhase.Hide));
		} else
			unblock();
	}, [script, textState, hideUI]);

	const doAutoFn = useCallback(debounce(() => {
		if (doAuto)
			tryNext();
	}, 2500), [doAuto, tryNext]);

	//////////////////////////////

	function sessionSeen (type: "bgm" | "pic" | "char", name: string) {
		const arr = GlobalStorage.Instance.seen[type];
		if (!arr.includes(name)) {
			arr.push(name);
			GlobalStorage.Instance.Save();
		}
	}

	//////////////////////////////

	useEffect(() => { // script load skipper
		if (!script || !scriptLoading) return;

		if (blocks.length > 0) return unblock(true);
	}, [scriptCursor, blocks, displayText]);

	useEffect(() => {
		if (!scriptLoading)
			config.volatile_Mute.value = false;
	}, [scriptLoading]);

	useEffect(() => {
		if (doAuto && textState === TextboxPhase.Done)
			doAutoFn();
	}, [textState, doAuto]);

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

				return unblock();

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

								if (!s.wait)
									unblock();
								else
									addBlock(Wait(s.fadeDuration * 1000, () => {
										bgm.stop();
										if (s.wait) unblock();
									}));
								return;
							} else {
								bgm.fadeSkip();
								bgm.stop();
								return unblock();
							}
						} else {
							bgm.load(src);
							bgm.play().then(() => {
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
								} else {
									bgm.fadeSkip();
									return unblock();
								}
							});
							return;
						}
					}

					if (s.name !== "-") {
						sessionSeen("bgm", s.name);
						bgm.play().then(() => unblock());
					}
					return;
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

								if (!s.wait)
									unblock();
								else
									addBlock(Wait(s.fadeDuration * 1000, () => {
										bgs.stop();
										if (s.wait) unblock();
									}));
								return;
							} else {
								bgs.fadeSkip();
								bgs.stop();
								return unblock();
							}
						} else {
							bgs.load(src);
							bgs.play().then(() => {
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
								} else {
									bgs.fadeSkip();
									return unblock();
								}
							});
							return;
						}
					}

					if (s.name !== "-")
						bgs.play().then(() => unblock());
					return;
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
						se.load(`/SE/${s.name}.mp3`);
						se.play();

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
								console.warn("charfx 3rd parameter should be 'jump' or 'jump-short' or 'shake' or 'shake-weak'");
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

						case "filter-circle":
						case "bfilter-circle":
							if (typeof s.args[0] !== "string" || !["char", "pic"].includes(s.args[0])) {
								console.warn(`${s.fx} 1st parameter should be 'char' or 'pic'`);
								break;
							}
							if (typeof s.args[2] !== "number") {
								console.warn(`${s.fx} 3rd parameter should be Number`);
								break;
							}
							if (![1, 4, 20].includes(s.args.length - 3)) {
								console.warn(`${s.fx} value count should be 1 or 4 or 20`);
								break;
							}

							{
								const t = s.fx === "filter-circle" ? "colorFilter" : "backColorFilter";
								const cssType = s.fx === "filter-circle" ? "filter" : "backdropFilter";

								if (s.args[0] === "char") {
									const target = chars.find(c => c.state === 2 && c.pos === s.args[1]);
									if (!target) return unblock();

									const input = s.args[3] === "-"
										? Matrix4x5Identity
										: input2matrix(s.args.slice(3) as number[]);

									const key = target.key;
									setChars(chars => {
										return chars.map(c => {
											if (c.key !== key) return c;

											const ret = { ...c };
											if (ret[t])
												ret[t]!.onFrame(null).onEnd(null).stop();

											let step = 0;
											const filter = new ColorFilter(c[t])
												.to(input)
												.onFrame(v => ret.el.current && (ret.el.current.style[cssType] = ColorMatrixToSVGUrl(v)))
												.onEnd(() => {
													if (s.args[3] === "-") return; // 종료인 경우

													step = (step + 1) % 2;
													if (step === 1)
														filter.from(input).to(Matrix4x5Identity).start(s.args[2] as number * 1000);
													else
														filter.from(Matrix4x5Identity).to(input).start(s.args[2] as number * 1000);
												})
												.start(s.args[2] as number * 1000);

											ret[t] = filter;
											return ret;
										});
									});
									unblock();
								} else {
									const target = pics[s.args[1] as number];
									if (!target) return unblock();

									setPics(_pics => {
										const pics = [..._pics];
										const c = pics[s.args[1] as number];

										const input = s.args[3] === "-"
											? Matrix4x5Identity
											: input2matrix(s.args.slice(3) as number[]);

										const ret = { ...c };
										if (ret[t])
											ret[t]!.onFrame(null).onEnd(null).stop();

										let step = 0;
										const filter = new ColorFilter(c[t])
											.to(input)
											.onFrame(v => ret.el.current && (ret.el.current.style[cssType] = ColorMatrixToSVGUrl(v)))
											.onEnd(() => {
												if (s.args[3] === "-") return; // 종료인 경우

												step = (step + 1) % 2;
												if (step === 1)
													filter.from(input).to(Matrix4x5Identity).start(s.args[2] as number * 1000);
												else
													filter.from(Matrix4x5Identity).to(input).start(s.args[2] as number * 1000);
											})
											.start(s.args[2] as number * 1000);

										ret[t] = filter;
										return pics;
									});
									unblock();
								}
							}
							break;

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
				{
					const _session = config.session_Data.peek();
					_session.data[s.name] = s.value;

					console.log("Session var set, " + s.name + " -> " + s.value);
					unblock();
				}
				break;

			case "if":
				{
					const _session = config.session_Data.peek();
					const v = _session.data[s.var] || ""; // 값이 지정되지 않았으면 빈 문자열로 취급
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
				console.log("wait");

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
				setTextState(_ => TextboxPhase.FadeOut);
				break;

			case "sel":
				if (scriptLoading) return unblock(true);

				setSelection(s.sels);
				break;

			case "char":
				{
					const removeAt = (position: CharData["pos"], duration: number, unblockAfter: boolean = false) => {
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
									if (unblockAfter) unblock();
								}));
							} else if (unblockAfter)
								unblock();

							return chars;
						});
					};

					if (s.name === "-")
						removeAt(s.position, s.fxDuration, true);
					else {
						sessionSeen("char", s.name);

						const src = `/IMG/SCG/${s.name}.png`;
						if (chars.some(c => c.pos === s.position && c.state <= 2 && c.src === src)) { // 표시될/표시중인 동일한 캐릭터가 존재
							if (chars.every(c => !(c.pos === s.position && c.state <= 2 && c.src === src) || c.scale === s.scale))
								return unblock();

							setChars(_chars => [..._chars].map(c => { // scale update
								if (c.pos === s.position && c.state <= 2 && c.src === src) {
									return {
										...c,
										duration: s.fxDuration,
										scale: s.scale,
									};
								}
								return c;
							}));
							return addBlock(Wait(s.fxDuration * 1000, () => unblock()));
						}

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
										scale: s.scale,
										state: 2,
										el: createRef(),
									} satisfies CharData];

									return chars;
								});
								return addBlock(Wait(0, () => unblock()));
							} else {
								setChars(_chars => [..._chars, {
									key: Math.floor(Math.random() * 100000).toString(),
									pos: s.position,
									src,
									fx: s.fx,
									duration: s.fxDuration,
									scale: s.scale,
									state: 0,
									el: createRef(),
								} satisfies CharData]);
								return addBlock(Wait(s.fxDuration * 1000, () => unblock()));
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
					if (!s.name.includes(".."))
						sessionSeen("pic", s.name);

					setPics(_pics => {
						const pics = [..._pics];

						pics[s.id] = {
							key: Math.floor(Math.random() * 100000).toString(),
							layer: s.type === "pic" ? "front" : "back",
							pos: s.position,
							src: `/IMG/CUT/${s.name}.png`,
							fadeDuration: s.fadeDuration,
							state: 0,
							el: createRef(),
						};

						// for skip
						addBlock(Wait(s.fadeDuration * 1000, () => {
							console.log("pic end");
							unblock();
							setPics(_pics => {
								const pics = [..._pics];

								if (pics[s.id]) pics[s.id].state = 2;
								return pics;
							});
						}));

						return pics;
					});
				}
				break;

			case "filter":
			case "bfilter":
				if (s.target === "char") {
					const target = chars.find(c => c.state === 2 && c.pos === s.position);
					if (!target) return unblock();

					const key = target.key;
					setChars(chars => {
						return chars.map(c => {
							if (c.key !== key) return c;

							const t = s.type === "filter" ? "colorFilter" : "backColorFilter";
							const cssType = s.type === "filter" ? "filter" : "backdropFilter";

							const ret = { ...c };
							if (ret[t])
								ret[t]!.onFrame(null).onEnd(null).stop();

							const filter = new ColorFilter(c[t])
								.to(s.values)
								.onFrame(v => ret.el.current && (ret.el.current.style[cssType] = ColorMatrixToSVGUrl(v)))
								.start(s.duration * 1000);

							ret[t] = filter;
							return ret;
						});
					});

					addBlock(Wait(s.duration * 1000, () => unblock()));
				} else {
					const target = pics[s.id];
					if (!target) return unblock();

					setPics(_pics => {
						const pics = [..._pics];

						const t = s.type === "filter" ? "colorFilter" : "backColorFilter";
						const cssType = s.type === "filter" ? "filter" : "backdropFilter";

						const c = pics[s.id];
						const ret = { ...c };
						if (ret[t])
							ret[t]!.onFrame(null).onEnd(null).stop();

						const filter = new ColorFilter(c[t])
							.to(s.values)
							.onFrame(v => ret.el.current && (ret.el.current.style[cssType] = ColorMatrixToSVGUrl(v)))
							.start(s.duration * 1000);

						ret[t] = filter;

						return pics;
					});

					addBlock(Wait(s.duration * 1000, () => unblock()));
				}
				break;

			case "command":
				ScriptCommand.run(s.command, s.args);
				return unblock();

			case "style":
				setTextStyle(s.style);
				return unblock();
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
				// else
				// 	Wait(dur * 1000, () => unblock());

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
				// else
				// 	Wait(dur * 1000, () => unblock());

				return _pics.map(r => r && r.state === 0 ? ({ ...r, state: 1 }) : r);
			});
		}
	}, [pics]);

	useEffect(() => { // Global effect register
		const fn = (e: KeyboardEvent) => {
			if (selection.length > 0 || script?.current()?.type === "sel") {
				console.warn("dismiss key-input, selection now");
				return; // Selection
			}

			if (e.key === "Enter" || e.key === " ") {
				if (!e.repeat) {
					static_PlayUISE("dialog");
					tryNext();
				}
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

	useEffect(() => { // auto trigger
		if (doAuto) doAutoFn();
	}, [doAuto]);

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

	// function makeTransitionFilter (v: number): string {
	// 	const cl = Math.min(Math.max(v, 0), 1);

	// 	const a = cl < 1 ? cl : 1;
	// 	const b = cl > 1 ? cl - 1 : 0;

	// 	const arr = new Array(2000).fill(0).map((_, i, a) => i < cl * a.length ? 0 : 1).join(" ");

	// 	const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	// 		<defs>
	// 			<filter id="f">
	// 				<feComponentTransfer>
	// 					<feFuncR type="discrete" tableValues="${arr}"/>
	// 					<feFuncG type="discrete" tableValues="${arr}"/>
	// 					<feFuncB type="discrete" tableValues="${arr}"/>
	// 				</feComponentTransfer>
	// 				<!-- <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" /> -->
	// 				<feColorMatrix type="luminanceToAlpha" />
	// 				<feGaussianBlur stdDeviation="2" />
	// 			</filter>
	// 		</defs>
	// 	</svg>`;
	// 	return `url(data:image/svg+xml,${encodeURIComponent(svg)}#f)`;
	// }
	// const [transitionT, setTransitionT] = useState(0);
	// const [transitionP, setTransitionP] = useState(-1);
	// useEffect(() => {
	// 	if (scriptLoading) return;

	// 	if (transitionT === 0) {
	// 		setTransitionT(Date.now() + 500);
	// 		return;
	// 	}

	// 	const x = (Date.now() - transitionT) / 2000;
	// 	if (x <= 1)
	// 		requestAnimationFrame(() => setTransitionP(x));
	// 	else if (x !== transitionP)
	// 		setTransitionP(x);
	// }, [transitionP, transitionT, scriptLoading]);

	return <>
		<Scene_Base
			class={ BuildClass("Scene_Game", style.Scene_Game, hideUI && style.HideUI) }
			onClick={ e => {
				e.preventDefault();

				if (scriptLoading) return;

				if (doAuto) setDoAuto(false);

				if (e.target && (e.target instanceof Element) && (e.target.matches(`.${style.Selection}`) || e.target.matches(`.${style.Sel}`)))
					return; // Selection click

				static_PlayUISE("dialog");
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
						exts={ [".jpg", ".png", ".apng"] }
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
							"--fx-scale": c.scale,
							// filter: c.colorFilter ? ColorMatrixToSVGUrl(c.colorFilter.current) : undefined,
							// backdropFilter: c.backColorFilter ? ColorMatrixToSVGUrl(c.backColorFilter.current) : undefined,
						} }
						data-key={ c.key }
						ref={ c.el }
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
						exts={ [".png", ".jpg", ".apng"] }
						style={ {
							"--fx-duration": `${p.fadeDuration}s`,
							// filter: p.colorFilter ? ColorMatrixToSVGUrl(p.colorFilter.current) : undefined,
							// backdropFilter: p.backColorFilter ? ColorMatrixToSVGUrl(p.backColorFilter.current) : undefined,
						} }
						ref={ p.el }
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

				{/* <div
					class={ BuildClass(style.Transitioner) }
					style={ {
						backgroundImage: "url(/IMG/TRANSITION/0.png)",
						backgroundSize: "100% 100%",
						filter: makeTransitionFilter(transitionP),
					} }
				/> */}
			</div>

			<Textbox
				class={ style.Textbox }
				text={ displayText }
				teller={ displayTeller }

				noNext={ doAuto }
				phase={ textState }

				textStyle={ textStyle }

				onShown={ () => setTextState(_ => TextboxPhase.SequencingText) }
				onTextDone={ () => setTextState(_ => TextboxPhase.Done) }
				onHidden={ () => {
					setTextState(_ => TextboxPhase.None);

					if (!scriptLoading) unblock();
				} }
			/>

			{ doAuto && <SpriteButton
				key="scene-game-auto-display-sprite"
				class={ style.AutoDisplay }
				src="UI/sprite.png"
				idle={ autoSprites }
				timePerFrame={ 60 }
			/> }

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

						static_PlayUISE("stop");
						setHistoryDisplay(true);
					} }
				/>
				<SpriteButton
					src="UI/sprite.png"
					idle={ doAuto ? "btn_auto_hover.png" : "btn_auto.png" }
					hover="btn_auto_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						static_PlayUISE("stop");
						setDoAuto(!doAuto);
					} }
				/>
				<SpriteButton
					src="UI/sprite.png"
					idle="btn_save.png"
					hover="btn_save_hover.png"
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						static_PlayUISE("stop");
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

						static_PlayUISE("stop");
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

						static_PlayUISE("stop");
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

								static_PlayUISE("click");
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

				static_PlayUISE("stop");
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

				static_PlayUISE("stop");
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
