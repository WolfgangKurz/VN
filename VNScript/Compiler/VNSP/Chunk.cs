using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Compiler.VNSP {
	public class Chunk : StreamHelper {
		public int Size => (int)this.stream.Length;
		public byte[] Data => (this.stream as MemoryStream).ToArray();

		public Chunk(byte[] data) {
			this.stream = new MemoryStream(data);
		}
	}
}
