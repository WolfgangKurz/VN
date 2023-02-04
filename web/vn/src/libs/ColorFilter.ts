import { Matrix4x5Identity } from "@/types/Matrix";

type ColorFilterMatrix = Tuple<number, 20>;
type Nullable<T> = T | null;

export default class ColorFilter {
	private source: ColorFilterMatrix;
	private destination: ColorFilterMatrix = Matrix4x5Identity;

	private current: ColorFilterMatrix = Matrix4x5Identity;
	private running = false;

	private duration: number = 0;
	private beginAt: number = 0;

	private eFrame: Nullable<(value: ColorFilterMatrix) => void> = null;
	private eEnd: Nullable<VoidFunction> = null;

	constructor (from?: ColorFilter) {
		if (from)
			this.source = from.current;
		else
			this.source = Matrix4x5Identity;
	}

	public from (value: ColorFilterMatrix): this {
		this.source = value;
		return this;
	}

	public to (value: ColorFilterMatrix): this {
		this.destination = value;
		return this;
	}

	public get value (): typeof this.current {
		return this.current;
	}

	public onFrame (cb: Nullable<(value: ColorFilterMatrix) => void>): this {
		this.eFrame = cb;
		return this;
	}

	public onEnd (cb: Nullable<VoidFunction>): this {
		this.eEnd = cb;
		return this;
	}

	public start (duration: number = 1000): this {
		this.beginAt = Date.now();
		this.duration = duration;
		requestAnimationFrame(this.frame.bind(this));

		this.running = true;
		return this;
	}

	public stop (): this {
		this.running = false;
		return this;
	}

	private frame () {
		const elapsed = Date.now() - this.beginAt;
		const p = elapsed / this.duration;

		if (!this.running || p >= 1) {
			this.running = false;
			this.current = this.destination;
			if (this.eFrame) this.eFrame(this.current);
			if (this.eEnd) this.eEnd();
			return;
		}

		const v = -(Math.cos(Math.PI * p) - 1) / 2;

		const values = this.source.map((b, i) => b + (this.destination[i] - b) * v) as Tuple<number, 20>;
		this.current = values;
		if (this.eFrame) this.eFrame(this.current);

		requestAnimationFrame(this.frame.bind(this));
	}
}
