export type ScriptArgument = string | number;
export type ScriptSelection = {
	display: string;
	script: string;
};
export type ScriptVarCondition = {
	value: string;
	to: string;
};

interface ScriptLine_Base {
	type: string;
}
interface ScriptLine_Text extends ScriptLine_Base {
	type: "text";
	text: string;
}
interface ScriptLine_Talk extends ScriptLine_Base {
	type: "talk";
	teller: string;
	text: string;
}
interface ScriptLine_Clear extends ScriptLine_Base {
	type: "clear"; // 대화창 닫기, 닫을 때 까지 wait
}
interface ScriptLine_Wait extends ScriptLine_Base {
	type: "wait";
	wait: number | "fx";
}
interface ScriptLine_Char extends ScriptLine_Base {
	type: "char";
	name: string;
	position: "<<" | "<" | "left" | "center" | "right" | ">" | ">>";
	fx: "" | "left" | "right" | "top" | "bottom";
	fxDuration: number;
}
interface ScriptLine_BGM extends ScriptLine_Base {
	type: "bgm";
	name: string;
	fadeDuration: number;
	wait: boolean;
}
interface ScriptLine_BGS extends ScriptLine_Base {
	type: "bgs";
	name: string;
	fadeDuration: number;
	wait: boolean;
}
interface ScriptLine_SE extends ScriptLine_Base {
	type: "se";
	name: string;
}
interface ScriptLine_BG extends ScriptLine_Base {
	type: "bg";
	name: string;
}
interface ScriptLine_Picture extends ScriptLine_Base {
	type: "pic" | "bpic";
	id: number;
	name: string;
	fadeDuration: number;
	position: "left-top" | "top" | "right-top" | "left" | "center" | "right" | "left-bottom" | "bottom" | "right-bottom";
}
interface ScriptLine_Fade extends ScriptLine_Base {
	type: "fade";
	isIn: boolean;
	fadeDuration: number;
}
interface ScriptLine_FX extends ScriptLine_Base {
	type: "fx";
	fx: string;
	args: ScriptArgument[];
}
interface ScriptLine_Selection extends ScriptLine_Base {
	type: "sel";
	sels: ScriptSelection[];
}
interface ScriptLine_Script extends ScriptLine_Base {
	type: "script";
	script: string;
}
interface ScriptLine_Title extends ScriptLine_Base {
	type: "title";
	title: string;
}
interface ScriptLine_Chapter extends ScriptLine_Base {
	type: "chapter";
	chapter: string;
}
interface ScriptLine_Set extends ScriptLine_Base {
	type: "set";
	name: string;
	value: string;
}
interface ScriptLine_If extends ScriptLine_Base {
	type: "if";
	var: string;
	conds: ScriptVarCondition[];
}
interface ScriptLine_Filter_Char extends ScriptLine_Base {
	type: "filter" | "bfilter";
	target: "char";
	position: ScriptLine_Char["position"];
	duration: number;
	values: Tuple<number, 20>;
}
interface ScriptLine_Filter_Picture extends ScriptLine_Base {
	type: "filter" | "bfilter";
	target: "pic";
	id: number;
	duration: number;
	values: Tuple<number, 20>;
}
type ScriptLine_Filter = ScriptLine_Filter_Char | ScriptLine_Filter_Picture;

export type ScriptLine = ScriptLine_Text | ScriptLine_Talk | ScriptLine_Clear | ScriptLine_Wait |
	ScriptLine_Char | ScriptLine_BGM | ScriptLine_BGS | ScriptLine_SE | ScriptLine_BG | ScriptLine_Picture |
	ScriptLine_Fade | ScriptLine_FX | ScriptLine_Selection | ScriptLine_Script | ScriptLine_Filter |
	ScriptLine_Set | ScriptLine_If | ScriptLine_Title | ScriptLine_Chapter;

export default class Script {
	private _script: ScriptLine[] = [];
	private _cursor = 0;

	protected parseArgs (source: string): ScriptArgument[] {
		const ret: ScriptArgument[] = [];
		let buffer = "";
		let isString = false;
		let expected = "";
		let escaping = false;
		let pc = "";

		for (let i = 0; i < source.length; i++) {
			const c = source[i];

			if (!!expected) {
				if (c !== expected)
					throw new Error(`Failed to parse script arguments, "${expected}" expected but "${c}" found`);

				expected = "";
			}

			if (escaping) {
				buffer += c;
				escaping = false;
				continue;
			}

			if (c === "\"" && !isString) { // string start
				isString = true;
			} else if (isString) {
				if (c === "\"") { // string end
					isString = false;
					expected = " ";
				} else if (c === "\\") { // escaping
					escaping = true;
				} else
					buffer += c;
			} else if (c === " ") { // part end
				if (pc !== " ") { // countinue part end char
					if (/^[0-9]+(\.[0-9]+)?$/.test(buffer))
						ret.push(parseFloat(buffer));
					else
						ret.push(buffer);

					buffer = "";
				}
			} else
				buffer += c;

			pc = c;
		}

		if (/^[0-9]+(\.[0-9]+)?$/.test(buffer))
			ret.push(parseFloat(buffer));
		else
			ret.push(buffer);

		return ret;
	}

	public load (script: string) {
		this._script = script.split(/[\r\n]/g)
			.filter(r => r.length > 0 && r[0] !== "#")
			.map((line): ScriptLine => {
				if (line[0] === "@") { // functions
					const cmdIdx = line.indexOf(" ");
					const cmd = cmdIdx >= 0
						? line.substring(1, cmdIdx).toLowerCase()
						: line.substring(1).toLowerCase();
					const args = cmdIdx >= 0
						? this.parseArgs(line.substring(cmdIdx + 1))
						: [];

					switch (cmd) {
						case "fadein":
						case "fadeout":
							if (args.length > 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args.length === 1 && typeof args[0] !== "number")
								throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[0]}" for "${cmd}"`);

							return {
								type: "fade",
								isIn: cmd === "fadein",
								fadeDuration: args.length === 1
									? args[0] as number
									: 1,
							};

						case "bg":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "bg",
								name: args[0].toString(),
							};

						case "bgs":
						case "bgm":
							if (args.length < 1 || args.length > 3)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args.length >= 2 && typeof args[1] !== "number")
								throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[1]}" for "${cmd}"`);
							if (args.length >= 3 && args[2] !== 0 && args[2] !== 1)
								throw new Error(`Failed to parse script line, invalid paramter type, 0 or 1 expected but was "${args[2]}" for "${cmd}"`);

							return {
								type: cmd,
								name: args[0].toString(),
								fadeDuration: (args.length >= 2 ? args[1] || 0 : 0) as number,
								wait: (args.length >= 3 ? args[2] : 1) === 1,
							};

						case "se":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: cmd,
								name: args[0].toString(),
							};

						case "fx":
							if (args.length < 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "fx",
								fx: args[0].toString(),
								args: args.slice(1),
							};

						case "clear":
							if (args.length > 0)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return { type: "clear" };

						case "wait":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (typeof args[0] !== "number" && !["fx"].includes(args[0].toLowerCase()))
								throw new Error(`Failed to parse script line, invalid paramter type, Number or "fx" expected but was "${args[0]}" for "${cmd}"`);

							return {
								type: "wait",
								wait: typeof args[0] === "number"
									? args[0]
									: args[0].toLowerCase() as ScriptLine_Wait["wait"],
							};

						case "char":
							if (args.length < 1 || args.length > 4)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args.length >= 2) {
								if (typeof args[1] !== "string")
									throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[1]}" for "${cmd}"`);
								if (!["<<", "<", "left", "center", "right", ">", ">>"].includes(args[1].toLowerCase()))
									throw new Error(`Failed to parse script line, invalid paramter value, "<<" or "<" or "left" or "center" or "right" or ">" or ">>" expected but was "${args[1]}" for "${cmd}"`);
							}
							if (args.length >= 3) {
								if (typeof args[2] !== "string")
									throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[2]}" for "${cmd}"`);
								if (!["", "left", "right", "top", "bottom"].includes(args[2].toLowerCase()))
									throw new Error(`Failed to parse script line, invalid paramter value, "" or "left" or "right" or "top" or "bottom" expected but was "${args[2]}" for "${cmd}"`);
							}
							if (args.length >= 4) {
								if (typeof args[3] !== "number")
									throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[2]}" for "${cmd}"`);
							}

							return {
								type: "char",
								name: args[0].toString(),
								position: args.length >= 2
									? (args[1] as string).toLowerCase() as ScriptLine_Char["position"]
									: "center",
								fx: args.length >= 3
									? (args[2] as string) as ScriptLine_Char["fx"]
									: "",
								fxDuration: args.length >= 4
									? (args[3] as number)
									: 0.5,
							};

						case "pic":
						case "bpic":
							if (args.length < 2 || args.length > 4)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (typeof args[0] !== "number")
								throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[0]}" for "${cmd}"`);
							if (args.length >= 3 && typeof args[2] !== "number")
								throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[2]}" for "${cmd}"`);
							if (args.length >= 4) {
								if (typeof args[3] !== "string")
									throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[3]}" for "${cmd}"`);
								if (!["left-top", "top", "right-top", "left", "center", "right", "left-bottom", "bottom", "right-bottom"].includes(args[3].toLowerCase()))
									throw new Error(`Failed to parse script line, invalid paramter value, "left-top" or "top" or "right-top" or "left" or "center" or "right" or "left-bottom" or "bottom" or "right-bottom" expected but was "${args[3]}" for "${cmd}"`);
							}

							return {
								type: cmd,
								id: args[0],
								name: args[1].toString(),
								fadeDuration: args.length >= 3
									? args[2] as number
									: 0,
								position: args.length >= 4
									? (args[3] as string) as ScriptLine_Picture["position"]
									: "center",
							};

						case "sel":
							if (args.length < 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args.length % 2 !== 0)
								throw new Error(`Failed to parse script line, invalid parameter count, should even number for "${cmd}"`);

							return {
								type: "sel",
								sels: args.filter((_, i) => (i % 2) === 0)
									.map((r, i) => ({
										display: r.toString(),
										script: args[i * 2 + 1].toString(),
									})),
							};

						case "script":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "script",
								script: args[0].toString(),
							};

						case "title":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "title",
								title: args[0].toString(),
							};

						case "chapter":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "chapter",
								chapter: args[0].toString(),
							};

						case "set":
							if (args.length !== 2)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "set",
								name: args[0].toString(),
								value: args[1].toString(),
							};

						case "if":
							if (args.length < 3 || (args.length % 2) !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);

							return {
								type: "if",
								var: args[0].toString(),
								conds: args.slice(1).filter((_, i) => (i % 2) === 0)
									.map((r, i) => ({
										value: r.toString(),
										to: args[i * 2 + 2].toString(),
									} satisfies ScriptVarCondition)),
							};

						case "filter":
						case "bfilter":
							if (args.length !== 7 && args.length != 23)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args[0] !== "char" && args[0] !== "pic")
								throw new Error(`Failed to parse script line, invalid paramter type, "char" or "pic" expected but was "${args[0]}" for "${cmd}"`);

							if (args[0] === "char") {
								if (typeof args[1] !== "string")
									throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[1]}" for "${cmd}"`);
								if (!["<<", "<", "left", "center", "right", ">", ">>"].includes(args[1].toLowerCase()))
									throw new Error(`Failed to parse script line, invalid paramter value, "<<" or "<" or "left" or "center" or "right" or ">" or ">>" expected but was "${args[1]}" for "${cmd}"`);
							} else if (args[0] === "pic") {
								if (typeof args[1] !== "number")
									throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[1]}" for "${cmd}"`);
							}

							{
								const idx = args.slice(2).findIndex(r => typeof r !== "number");
								if (idx >= 0)
									throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[idx + 2]}" for "${cmd}"`);
							}

							{
								const v = args.slice(3) as number[];
								const values: Tuple<number, 20> = args.length === 7
									? [
										v[0], 0, 0, 0, 0,
										0, v[1], 0, 0, 0,
										0, 0, v[2], 0, 0,
										0, 0, 0, v[3], 0,
									]
									: v as Tuple<number, 20>;

								return args[0] === "char"
									? {
										type: cmd,
										target: args[0],
										position: args[1] as ScriptLine_Filter_Char["position"],
										duration: args[2] as number,
										values,
									}
									: {
										type: cmd,
										target: args[0],
										id: args[1] as number,
										duration: args[2] as number,
										values,
									};
							}

						default:
							throw new Error(`Failed to parse script line, invalid command "${cmd}"`);
					}
				} else {
					if (line.includes(" -> ")) {
						const idx = line.indexOf(" -> ");
						const teller = line.substring(0, idx);
						const text = line.substring(idx + 4);

						return {
							type: "talk",
							teller,
							text,
						};
					} else {
						return {
							type: "text",
							text: line,
						} satisfies ScriptLine;
					}
				}
			});

		this._cursor = -1;
	}

	public unload () {
		this._script = [];
		this._cursor = -1;
	}

	public current (): ScriptLine | null {
		const sc = this._script[this._cursor];
		if (!sc) return null;

		return sc;
	}

	public next (): ScriptLine | null {
		const sc = this._script[++this._cursor];
		if (!sc) return null;

		return sc;
	}

	public get cursor () {
		return this._cursor;
	}
}
