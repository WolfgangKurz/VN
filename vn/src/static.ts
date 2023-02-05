import ManagedAudio from "@/libs/ManagedAudio";

export type UISEType = "hover" | "click" | "dialog" | "stop" | "arrow" | "arrow_disabled";
export function static_PlayUISE (type: UISEType) {
	try {
		const audio = new ManagedAudio(false);
		audio.destroyAfterPlay = true;
		audio.load(`/SE/ui/${type}.mp3`);
		audio.play();
	} catch {
		// Dismiss
	}
}
