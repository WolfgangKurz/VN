export type ScriptArgs = string | number;

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
	position: string;
	fx: "" | "left" | "right" | "top" | "bottom";
}
interface ScriptLine_BGM extends ScriptLine_Base {
	type: "bgm";
	name: string;
	fadeDuration: number;
}
interface ScriptLine_BGS extends ScriptLine_Base {
	type: "bgs";
	name: string;
	fadeDuration: number;
}
interface ScriptLine_BG extends ScriptLine_Base {
	type: "bg";
	name: string;
}
interface ScriptLine_Picture extends ScriptLine_Base {
	type: "pic";
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
	args: ScriptArgs[];
}
interface ScriptLine_Selection extends ScriptLine_Base {
	type: "sel";
	sels: ScriptArgs[];
}
interface ScriptLine_Script extends ScriptLine_Base {
	type: "script";
	script: string;
}
export type ScriptLine = ScriptLine_Text | ScriptLine_Talk | ScriptLine_Clear | ScriptLine_Wait |
	ScriptLine_Char | ScriptLine_BGM | ScriptLine_BGS | ScriptLine_BG | ScriptLine_Picture |
	ScriptLine_Fade | ScriptLine_FX | ScriptLine_Selection | ScriptLine_Script;

export default class Script {
	private script: ScriptLine[] = [];
	private cursor = 0;

	protected parseArgs (source: string): ScriptArgs[] {
		const ret: ScriptArgs[] = [];
		let buffer = "";
		let isString = false;
		let expected = "";
		let escaping = false;

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

			if (c === "\"" && !buffer) { // string start
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
				if (!!buffer) {
					if (/^[0-9]+(\.[0-9]+)?$/.test(buffer))
						ret.push(parseFloat(buffer));
					else
						ret.push(buffer);

					buffer = "";
				}
			} else
				buffer += c;
		}

		if (/^[0-9]+(\.[0-9]+)?$/.test(buffer))
			ret.push(parseFloat(buffer));
		else
			ret.push(buffer);

		return ret;
	}

	public load (script: string) {
		this.script = script.split(/[\r\n]/g)
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
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (typeof args[0] !== "number")
								throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[0]}" for "${cmd}"`);

							return {
								type: "fade",
								isIn: cmd === "fadein",
								fadeDuration: args[0],
							};

						case "bg":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (typeof args[0] !== "string")
								throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[0]}" for "${cmd}"`);

							return {
								type: "bg",
								name: args[0],
							};

						case "bgs":
						case "bgm":
							if (args.length < 1 || args.length > 2)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args.length === 2 && typeof args[1] !== "number")
								throw new Error(`Failed to parse script line, invalid paramter type, Number expected but was "${typeof args[1]}" for "${cmd}"`);

							return {
								type: cmd,
								name: args[0].toString(),
								fadeDuration: (args.length === 2 ? args[1] || 0 : 0) as number,
							};

						case "fx":
							if (args.length < 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (typeof args[0] !== "string")
								throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[0]}" for "${cmd}"`);

							return {
								type: "fx",
								fx: args[0],
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
							if (args.length < 1 || args.length > 3)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (args.length >= 2) {
								if (typeof args[1] !== "string")
									throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[1]}" for "${cmd}"`);
								if (!["left", "center", "right"].includes(args[1].toLowerCase()))
									throw new Error(`Failed to parse script line, invalid paramter value, "left" or "center" or "right" expected but was "${args[1]}" for "${cmd}"`);
							}
							if (args.length >= 3) {
								if (typeof args[2] !== "string")
									throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[2]}" for "${cmd}"`);
								if (!["", "left", "right", "top", "bottom"].includes(args[2].toLowerCase()))
									throw new Error(`Failed to parse script line, invalid paramter value, "" or "left" or "right" or "top" or "bottom" expected but was "${args[2]}" for "${cmd}"`);
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
							};

						case "pic":
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
								type: "pic",
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

							return {
								type: "sel",
								sels: args,
							};

						case "script":
							if (args.length !== 1)
								throw new Error(`Failed to parse script line, invalid parameter count for "${cmd}"`);
							if (typeof args[0] !== "string")
								throw new Error(`Failed to parse script line, invalid paramter type, String expected but was "${typeof args[0]}" for "${cmd}"`);

							return {
								type: "script",
								script: args[0],
							};

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

		this.cursor = 0;
	}

	public unload () {
		this.script = [];
		this.cursor = 0;
	}

	public next (): ScriptLine | null {
		const sc = this.script[this.cursor];
		if (!sc) return null;

		this.cursor++;
		return sc;
	}
}
