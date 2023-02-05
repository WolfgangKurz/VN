import fs from "fs";
import path from "path";

import pica from "pica";

import Bitmap from "./Bitmap";
import Session from "./Session";

export interface SaveInfo {
	version: string; // AA.BB

	script: string;
	cursor: number;
	thumbnail: Buffer;

	metadata: string;
}

export default class Save {
	static readonly Version: string = "01.00";
	static readonly SaveDir: string = path.resolve(global.__dirname, "saves");

	static readonly ThumbWidth: number = 185;
	static readonly ThumbHeight: number = 104;

	private static Canvas: HTMLCanvasElement;

	private static ensure (): void {
		if (!this.Canvas) {
			this.Canvas = document.createElement("canvas");
			this.Canvas.width = this.ThumbWidth;
			this.Canvas.height = this.ThumbHeight;
		}

		if (!fs.existsSync(Save.SaveDir))
			fs.mkdirSync(Save.SaveDir, { recursive: true });
	}

	public static list (): number[] {
		try {
			Save.ensure();

			const reg = /^Save([0-9]+)\.vnsave$/;

			return fs.readdirSync(Save.SaveDir)
				.filter(x => reg.test(x))
				.map(x => parseInt(x.replace(reg, "$1"), 10))
				.filter(x => x >= 1 && x <= 60);
		} catch {
			return [];
		}
	}

	public static load (slot: number): SaveInfo | false {
		if (slot < 1 || slot > 60) return false;

		Save.ensure();

		const filename = `Save${Math.floor(slot)}.vnsave`;
		const file = path.resolve(Save.SaveDir, filename);
		if (!fs.existsSync(file)) return false;

		const content = fs.readFileSync(file);
		return Save.deserialize(content);
	}
	public static async save (slot: number, script: string, cursor: number, snapshot: Bitmap): Promise<boolean> {
		if (slot < 1 || slot > 60) return false;

		Save.ensure();

		const filename = `Save${Math.floor(slot)}.vnsave`;
		const file = path.resolve(Save.SaveDir, filename);

		// Downscale thumbnail
		await pica().resize(snapshot.canvas, Save.Canvas);

		const thumbData = ((): Buffer => {
			const d = Save.Canvas.toDataURL("image/png");
			const b = d.substring(d.indexOf(",") + 1);
			return Buffer.from(b, "base64url");
		})();
		const data = Save.serialize({
			version: Save.Version,
			script,
			cursor,
			thumbnail: thumbData,
			metadata: JSON.stringify({
				date: new Date().toISOString(),
				session: Session.serialize(),
			}),
		});
		if (!data) return false;

		fs.writeFileSync(file, data);
		return true;
	}

	private static deserialize (buffer: Buffer): SaveInfo | false {
		try {
			let offset = 0;
			function read (size: number): Buffer {
				const b = buffer.subarray(offset, offset + size);
				offset += size;
				return b;
			}
			function binary (): Buffer {
				let length = 0;
				let depth = 0;
				while (true) {
					const b = buffer.readUInt8(offset++);
					length |= (b & 0x7F) << (depth++ * 7);

					if ((b & 0x80) === 0) break;
				}

				if (length === 0) return Buffer.alloc(0);
				return read(length);
			}
			const string = (): string => binary().toString("utf-8");
			function number (): number {
				const value = buffer.readInt32LE(offset);
				offset += 4;
				return value;
			}

			const output = {} as SaveInfo;

			const sig = read(6);
			if (!sig.equals(Buffer.from("VNsave"))) return false;

			const version = [
				read(2).toString("ascii"),
				read(2).toString("ascii"),
			];
			if (version.some(x => !/^[0-9]+$/.test(x)))
				return false;

			output.version = `${version[0]}.${version[1]}`;

			output.script = string();
			output.cursor = number();
			output.thumbnail = binary();
			output.metadata = string();

			return output;
		} catch (e) {
			console.warn(e);
			return false;
		}
	}
	private static serialize (data: SaveInfo): Buffer | false {
		try {
			if (!/^[0-9]{2}\.[0-9]{2}$/.test(data.version))
				return false;

			let offset = 0;
			function calc (length: number): number {
				let len = length;
				let count = 0;
				while (len > 0) {
					count++;
					len >>= 7;
				}
				return Math.max(1, count);
			}
			function wSize (buffer: Buffer, size: number): void {
				if (size === 0) {
					buffer.writeUInt8(0, offset);
					return;
				}

				let len = size;
				while (len > 0) {
					const v = (len & 0x7F) | (len >= 0x80 ? 0x80 : 0x00);
					buffer.writeUInt8(v, offset);
					offset++;
					len >>= 7;
				}
			}

			const size = 6 + // VNsave
				4 + // AA.BB version -> AABB
				calc(data.script.length) + data.script.length +
				4 + // cursor
				calc(data.thumbnail.byteLength) + data.thumbnail.byteLength +
				calc(data.metadata.length) + data.metadata.length;

			const buffer = Buffer.alloc(size);

			buffer.write("VNsave", 0);
			buffer.write(data.version.substring(0, 2), 6);
			buffer.write(data.version.substring(3, 5), 8);
			offset = 6 + 4;

			wSize(buffer, data.script.length);
			buffer.write(data.script, offset, "utf-8");
			offset += data.script.length;

			buffer.writeUInt32LE(data.cursor, offset);
			offset += 4;

			fs.writeFileSync(path.resolve(Save.SaveDir, "0.png"), data.thumbnail);

			wSize(buffer, data.thumbnail.byteLength);
			buffer.set(data.thumbnail, offset);
			offset += data.thumbnail.byteLength;

			wSize(buffer, data.metadata.length);
			buffer.write(data.metadata, offset, "utf-8");
			offset += data.metadata.length;

			return buffer;
		} catch {
			return false;
		}
	}
}
