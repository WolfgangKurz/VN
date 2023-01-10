type GlobalValueType = string | number | boolean;

let table: Record<string, GlobalValueType> = {};

export default class Global {
	static {
		table = JSON.parse(window.localStorage.getItem("global.data") || "{}") || {};
	}
	private static save () {
		window.localStorage.setItem("global.data", JSON.stringify(table));
	}
	public static clear (): void {
		table = {};
		this.save();
	}

	public static get<T extends GlobalValueType> (key: string): T | null;
	public static get<T extends GlobalValueType> (key: string, def: T): T;
	public static get<T extends GlobalValueType> (key: string, def?: T): T | null {
		return key in table
			? table[key] as T
			: def ?? null;
	}

	public static set (key: string, value: GlobalValueType): void {
		table[key] = value;
		this.save();
	}
}
