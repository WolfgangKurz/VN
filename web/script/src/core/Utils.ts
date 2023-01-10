export default class Utils {
	static isNwjs (): boolean {
		return typeof require === "function" && typeof process === "object";
	}

	static isMobileDevice (): boolean {
		const r = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i;
		return !!navigator.userAgent.match(r);
	}
	static isMobileSafari (): boolean {
		const agent = navigator.userAgent;
		return !!(
			agent.match(/iPhone|iPad|iPod/) &&
			agent.match(/AppleWebKit/) &&
			!agent.match("CriOS")
		);
	}
	static isAndroidChrome (): boolean {
		const agent = navigator.userAgent;
		return !!(agent.match(/Android/) && agent.match(/Chrome/));
	}
	static isLocal (): boolean {
		return window.location.href.startsWith("file:");
	}

	static canUseWebGL (): boolean {
		try {
			const canvas = document.createElement("canvas");
			return !!canvas.getContext("webgl");
		} catch (e) {
			return false;
		}
	}
	static canUseWebAudioAPI (): boolean {
		return !!(window.AudioContext || "webkitAudioContext" in window);
	}
	static canUseCssFontLoading (): boolean {
		return "fonts" in document && "ready" in document["fonts"];
	}

	static clamp (value: number, min: number, max: number) {
		if (value < min) return min;
		if (value > max) return max;
		return value;
	}
	static equals<T> (a1: T[], a2: T[]): boolean {
		if (a1.length !== a2.length) return false;

		for (let i = 0; i < a1.length; i++)
			if (a1[i] !== a2[i]) return false;

		return true;
	}
}
