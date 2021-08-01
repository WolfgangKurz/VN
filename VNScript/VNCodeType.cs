using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal enum VNCodeType : int {
		NONE = 0,
		SCRIPT,
		SET,
		UNLOCK,
		TEXT,
		SAY,
		SEL,
		BGM,
		BG,
		SCG,
		FX,
		FREEZE,
		TRANSITION,
	}
}
