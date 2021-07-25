using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal class VNStatus {
		public string ScriptName { get; }

		protected int Cursor { get; private set; }

		protected VNCode[] Codes { get; }

		public VNStatus(string Script) {
			this.Codes = Script.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
				.Select(x => new VNCode(x.Trim()))
				.Where(x => x.Type != VNCodeType.NONE)
				.ToArray();

			this.Cursor = 0;
		}

		public VNCode Next() {
			return this.Codes[this.Cursor++];
		}

		public bool EOF => this.Cursor >= this.Codes.Length;
	}
}
