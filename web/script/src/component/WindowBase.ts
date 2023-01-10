import FadeBase from "@/core/FadeBase";

export default class WindowBase extends FadeBase {
	public start () { }
	public create () { }

	public open () {
		this.interactive = true;
		this.interactiveChildren = true;

		this.startFadeIn();
	}
	public close () {
		this.interactive = false;
		this.interactiveChildren = false;

		this.startFadeOut();
	}

	public show () {
		this.interactive = true;
		this.interactiveChildren = true;
		this.opacity = 1;
	}

	public hide () {
		this.interactive = false;
		this.interactiveChildren = false;
		this.opacity = 0;
	}
}
