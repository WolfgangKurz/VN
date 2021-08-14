using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Compiler.VNSP {
	public sealed class CodeChunk : Chunk {
		public string CodeName { get; }
		public byte[] CodeBody { get; }

		public CodeChunk(byte[] data) : base(data) {
			this.CodeName = this.String();
			this.CodeBody = this.Read(this.Int());
		}
	}
}
