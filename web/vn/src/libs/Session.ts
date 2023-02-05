export default class Session<T extends {}> {
	private _vars: T = {} as T;

	constructor (init?: T) {
		if (init) this._vars = init;
	}

	public get data () {
		return this._vars;
	}

	public serialize (): string {
		return JSON.stringify(this._vars);
	}

	public deserialize (data: string) {
		this._vars = JSON.parse(data) || {};
	}

	public toString () {
		return this.serialize();
	}
}
