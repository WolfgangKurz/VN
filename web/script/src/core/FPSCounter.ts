export default class FPSCounter {
	private _frameTime = 100;
	private _frameStart = 0;
	private _lastLoop = performance.now() - 100;

	public fps = 0;
	public duration = 0;

	public startTick () {
		this._frameStart = performance.now();
	}
	public endTick () {
		const time = performance.now();
		const frameTime = time - this._lastLoop;
		this._frameTime += (frameTime - this._frameTime) / 12;
		this.fps = 1000 / this._frameTime;
		this.duration = Math.max(0, time - this._frameStart);
		this._lastLoop = time;
	}
}
