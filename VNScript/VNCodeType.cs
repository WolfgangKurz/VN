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
		ADD,
		SUB,
		MUL,
		DIV,
		MOD,
		FLOOR,
		ROUND,
		CEIL,

		STRING,
		CONCAT,

		IF,
		END,
		LABEL,
		GOTO,

		UNLOCK,
		TEXT,
		SAY,
		SEL,

		BGM,
		SND,
		BG,
		SCG,

		FX,
		FREEZE,
		TRANSITION,
	}
}
