const Buffer = window.Buffer;

// 0000/00/00 00:00
const dateReg = /^([0-9]{4})\/([0-9]{2})\/([0-9]{2}) ([0-9]{2}):([0-9]{2})$/;

export default class SaveData {
	public chapter: string = "";
	public title: string = "";
	public date: Date = new Date();

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
		const buffer = Buffer.alloc(500);
		let cursor = 0;

		function write (text: string, length: number) {
			const len = buffer.write(text, cursor, "utf-8");
			buffer.write(" ".repeat(length - len), cursor + len);
			cursor += length;
		}

		write(this.chapter, 200);
		write(this.title, 200);
		write(this.formattedDate, 20);

		write(this.script, 70);
		write(this.cursor.toString(), 10);

		if (this._image)
			return Buffer.concat([buffer, Buffer.from(await this._image.arrayBuffer())]);
		else
			return buffer;
	}

	public read (data: Buffer): boolean {
		// 200 (chapter) + 200 (title) + 20 (date) + 70 (script) + 10 (cursor)
		if (data.byteLength < 500) return false;

		this.chapter = data.subarray(0, 200).toString("utf-8").trim();
		this.title = data.subarray(200, 400).toString("utf-8").trim();

		const date = data.subarray(400, 420).toString("utf-8").trim();
		if (!dateReg.test(date)) return false;

		const dateMatch = dateReg.exec(date)!;
		this.date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]} ${dateMatch[4]}:${dateMatch[5]}`);

		this.script = data.subarray(420, 490).toString("utf-8").trim();
		this.cursor = parseInt(data.subarray(490, 500).toString("utf-8").trim(), 10);
		this._image = new Blob([data.subarray(500)]);

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
