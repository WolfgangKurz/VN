using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public class VMRuntimeFunc {
		public VMValue[] Arguments { get; }

		public byte[] Body { get; }

		public VMRuntimeFunc(VMValue[] Arguments, byte[] Body) {
			this.Arguments = Arguments;
			this.Body = Body;
		}
	}
}
