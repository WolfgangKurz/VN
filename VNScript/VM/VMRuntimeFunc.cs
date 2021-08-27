using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public class VMRuntimeFunc {
		public byte[] Body { get; }

		public VMRuntimeFunc(byte[] Body) {
			this.Body = Body;
		}
	}
}
