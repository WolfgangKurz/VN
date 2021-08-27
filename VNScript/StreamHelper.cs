using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript {
	public class StreamHelper {
		protected enum AssertMode {
			Take,
			Read,
		}

		protected static byte[] EmptyBuffer { get; } = new byte[0];
		protected Stream stream { get; set; }

		#region Assert
		protected bool Assert(string text, AssertMode mode = AssertMode.Take) => this.Assert(Encoding.UTF8.GetBytes(text), mode);

		protected bool Assert(byte[] data, AssertMode mode = AssertMode.Take) {
			var buffer = mode == AssertMode.Read
				? this.Read(data.Length)
				: this.Take(data.Length);
			return buffer.SequenceEqual(data);
		}
		#endregion

		#region Take, Readers
		protected byte[] Take(int size) {
			var buffer = this.Read(size);
			this.Rewind(size);
			return buffer;
		}

		protected byte[] Read(int size) {
			if (size == 0) return StreamHelper.EmptyBuffer;

			var buffer = new byte[size];
			if (this.stream.Read(buffer, 0, size) != size)
				throw new EndOfStreamException("VNScript VMError - Unexpected End Of Stream");
			return buffer;
		}

		protected byte Byte() {
			var ret = this.stream.ReadByte();
			if (ret == -1) throw new EndOfStreamException("VNScript VMError - Unexpected End Of Stream");
			return (byte)ret;
		}

		protected int Int() => BitConverter.ToInt32(this.Read(4), 0);

		protected string String() {
			var len = this.Int();
			return Encoding.UTF8.GetString(this.Read(len));
		}

		protected string String(int size) => Encoding.UTF8.GetString(this.Read(size));

		protected bool Bool() => this.Byte() != 0;

		protected double Number() => BitConverter.ToDouble(this.Read(8), 0);
		#endregion

		#region Seek
		protected void Seek(long offset) => this.stream.Seek(offset, SeekOrigin.Begin);
		protected void Seek(int offset) => this.stream.Seek(offset, SeekOrigin.Begin);
		protected void Seek(long offset, SeekOrigin origin) => this.stream.Seek(offset, origin);
		protected void Seek(int offset, SeekOrigin origin) => this.stream.Seek(offset, origin);
		#endregion

		protected void Skip(int size) => this.Seek(size, SeekOrigin.Current);

		protected void Rewind(int size) => this.Seek(-size, SeekOrigin.Current);
	}
}
