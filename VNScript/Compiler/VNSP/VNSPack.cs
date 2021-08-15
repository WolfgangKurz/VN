using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Compiler.VNSP {
	using RawChunk = KeyValuePair<string, byte[]>;

	public class VNSPack : StreamHelper {
		public int Version { get; }

		public RawChunk[] Chunks { get; }

		public CodeChunk[] Codes { get; }

		public VNSPack (byte[] packed) {
			this.stream = new MemoryStream(packed);

			if (this.stream.Length < 8)
				throw new Exception("VNScript VMError - Invalid Format");

			if (!this.Assert("VNSP", AssertMode.Read))
				throw new Exception("VNScript VMError - Invalid Format");

			this.Version = this.Int();
			if (this.Version < 100 || this.Version > 100)
				throw new Exception("VNScript VMError - Invalid Version");

			var chunkSize = this.Int();
			var chunks = new List<RawChunk>();
			for (var i = 0; i < chunkSize; i++) {
				chunks.Add(new RawChunk(
					this.String(4),
					this.Read(this.Int())
				));
			}
			this.Chunks = chunks.ToArray();

			this.Codes = this.Chunks
				.Where(x => x.Key == "CODE")
				.Select(x => new CodeChunk(x.Value))
				.ToArray();

			if (this.Byte() != 0)
				throw new Exception("VNScript VMError - Unexpected data");
		}

		public byte[] ToArray() => (this.stream as MemoryStream).ToArray();
	}
}
