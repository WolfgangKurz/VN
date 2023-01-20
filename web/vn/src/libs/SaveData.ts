const Buffer = window.Buffer;

// 0000/00/00 00:00
const dateReg = /^([0-9]{4})\/([0-9]{2})\/([0-9]{2}) ([0-9]{2}):([0-9]{2})$/;

const validVersions = ["VN1.1"];

export default class SaveData {
	private _version: string = "VN1.1";
	public get version () {
		return this._version;
	}
	private set version (value: string) {
		this._version = value;
	}

	public chapter: string = "";
	public title: string = "";
	public date: Date = new Date();
	public session: string = "";

	public get formattedDate (): string {
		const date = this.date;
		return `${date.getFullYear()}/` +
			`${(date.getMonth() + 1).toString().padStart(2, "0")}/` +
			`${date.getDate().toString().padStart(2, "0")} ` +
			`${date.getHours().toString().padStart(2, "0")}:` +
			`${date.getMinutes().toString().padStart(2, "0")}`;
	}

	public script: string = "";
	public cursor: number = 0;

	private _image: Blob | null = null;
	private _imageUrl: string = "";
	public get imageUrl () {
		if (this._image && !this._imageUrl) {
			this._imageUrl = URL.createObjectURL(this._image);
		}
		return this._imageUrl;
	}

	public async setImage (thumbnail?: HTMLCanvasElement): Promise<boolean> {
		if (!thumbnail) {
			this._image = null;
			if (this._imageUrl) {
				URL.revokeObjectURL(this._imageUrl);
				this._imageUrl = "";
			}
			return true;
		}

		const cv = document.createElement("canvas");
		cv.width = 320; // 16
		cv.height = 180; // 9

		const ctx = cv.getContext("2d");
		if (!ctx) return false;

		ctx.drawImage(thumbnail, 0, 0, cv.width, cv.height);

		this._image = await new Promise<Blob | null>(resolve => cv.toBlob(b => resolve(b), "image/jpeg", 0.7));
		return this._image !== null;
	}

	public async save (): Promise<Buffer | null> {
		let buffer = Buffer.alloc(440);
		let cursor = 0;

		function write (text: string, length: number) {
			const len = buffer.write(text, cursor, "utf-8");
			if (length >= 0)
				buffer.write(" ".repeat(length - len), cursor + len);
			cursor += length;
		}

		write(this.version, 10);

		write(this.chapter, 200);
		write(this.title, 200);
		write(this.formattedDate, 20);

		{
			const subBuffer = Buffer.from(this.session, "utf-8");
			console.log(subBuffer.length, subBuffer.byteLength);
			write(subBuffer.byteLength.toString(), 10);
			buffer = Buffer.concat([buffer, subBuffer], buffer.length + subBuffer.length + 60);
			cursor = buffer.length - 60;
		}

		write(this.script, 50);
		write(this.cursor.toString(), 10);

		if (this._image)
			buffer = Buffer.concat([buffer, Buffer.from(await this._image.arrayBuffer())]);

		return buffer;
	}

	public read (data: Buffer): boolean {
		// 10 (version) + 200 (chapter) + 200 (title) + 20 (date) + 10 (session length) + 50 (script) + 10 (cursor)
		if (data.byteLength < 500) return false;

		let offset = 0;
		function read (length: number): string;
		function read (length: number, raw: true): Buffer;
		function read (length: number, raw?: boolean): Buffer | string {
			const v = data.subarray(offset, offset + length);
			offset += length;
			if (raw) return v;
			return v.toString("utf-8").trim();
		}

		this.version = read(10);
		if (!validVersions.includes(this.version)) return false;

		this.chapter = read(200);
		this.title = read(200);

		const date = read(20);
		if (!dateReg.test(date)) return false;

		const dateMatch = dateReg.exec(date)!;
		this.date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]} ${dateMatch[4]}:${dateMatch[5]}`);

		const sessionLength = parseInt(read(10), 10);
		this.session = read(sessionLength);

		this.script = read(50);
		this.cursor = parseInt(read(10), 10);
		this._image = new Blob([data.subarray(offset)]);

		return true;
	}

	public dispose () {
		this.chapter = "";
		this.title = "";
		this.date = new Date();

		this.script = "";
		this.cursor = 0;

		this._image = null;
		if (this._imageUrl) {
			URL.revokeObjectURL(this._imageUrl);
			this._imageUrl = "";
		}
	}
}
