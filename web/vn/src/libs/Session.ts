export default class Session {
	private _vars: Record<string, string> = {};

	public set (name: string, value: string): void;
	public set (table: Record<string, string>): void;
	public set (name: Record<string, string> | string, value?: string): void {
		if (typeof name === "string") {
			this._vars[name] = value!;
		} else {
			Object.keys(name).forEach(k => {
				this._vars[k] = name[k];
			});
		}
	}

	public get (name: string): string | null {
		return name in this._vars
			? this._vars[name]
			: null;
	}

	public serialize (): string {
		return JSON.stringify(this._vars);
	}

	public toString () {
		return this.serialize();
	}
}
