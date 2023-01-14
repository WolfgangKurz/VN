import NodeFS from "node:fs";

import debounce from "lodash.debounce";
import { signal } from "@preact/signals";

import Session from "./libs/Session";

const fs: typeof NodeFS = window.nw.require("fs");

type ConfigValue = string | number | boolean;
const CONFIG_FILENAME = "vn-config.json";

/** Read from config file */
const configData: Record<string, ConfigValue> = (() => {
	if (fs.existsSync(CONFIG_FILENAME)) {
		try {
			return JSON.parse(fs.readFileSync(CONFIG_FILENAME, "utf-8"));
		} catch {
			return {};
		}
	}
	return {};
})();

//#region getter
function asFloat (v: ConfigValue, def: number = 0): number {
	if (typeof v === "undefined") return def;
	if (typeof v === "number") return v;
	if (typeof v === "string") {
		if (/^[0-9.]+$/.test(v))
			return parseInt(v, 10);
		else
			return def;
	}
	return def;
}
function asInteger (v: ConfigValue, def: number = 0): number {
	return Math.floor(asFloat(v, def));
}
function asString (v: ConfigValue, def: string): string {
	if (typeof v === "undefined") return def;
	return v.toString();
}
function asBoolean (v: ConfigValue, def: boolean): boolean {
	if (typeof v === "undefined") return def;
	return !!v;
}
function clamp (v: number, min: number, max: number): number {
	if (v < min) return min;
	if (v > max) return max;
	return v;
}
//#endregion

const config = {
	// volatile variables
	volatile_LoadingText: signal<string>(""),

	volatile_Scene: signal<string>(""),

	volatile_Script: signal<string>(""),
	volatile_ScriptCursor: signal<number>(-1),

	volatile_Mute: signal<boolean>(false),

	volatile_Title: signal<string>(""),

	// session
	session_Data: signal<Session>(new Session()),

	// settings
	volume_SFX: signal<number>(clamp(asInteger(configData["volume.sfx"], 100), 0, 100)),
	volume_BGM: signal<number>(clamp(asInteger(configData["volume.bgm"], 100), 0, 100)),
	text_Speed: signal<number>(clamp(asInteger(configData["text.speed"], 100), 0, 2)), // 0-slow, 1-regular, 2-fast
};
export default config;


/** Set to config file */
const set = debounce((name: string, value: ConfigValue) => {
	configData[name] = value;
	fs.writeFileSync(CONFIG_FILENAME, JSON.stringify(configData, undefined, 4), "utf-8");
}, 100);

config.volume_SFX.value;

config.volume_SFX.subscribe(v => set("volume.sfx", v));
config.volume_BGM.subscribe(v => set("volume.bgm", v));
config.text_Speed.subscribe(v => set("text.speed", v));
