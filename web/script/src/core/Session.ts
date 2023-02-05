export default class Session {
	private static table: Record<string, string> = {};

	public static clear (): void {
		this.table = {};
	}
	public static serialize (): string {
		return JSON.stringify(this.table);
	}
	public static deserialize (serialized: string): void {
		this.table = JSON.parse(serialized) || {};
	}

	public static get (key: string): string | null {
		return key in this.table ? this.table[key] : null;
	}
	public static set (key: string, value: string): void {
		this.table[key] = value;
	}
}
