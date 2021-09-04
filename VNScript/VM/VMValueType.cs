using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public enum VMValueType : byte {
		Null = 0,
		Number = 1,
		Boolean = 2,
		String = 3,
		Keyword = 4,
		Integer = 5,

		None = 255,
	}
}
