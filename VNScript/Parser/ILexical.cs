using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Parser {
	internal interface ILexical {
		Cursor StartCursor { get; set; }
		Cursor EndCursor { get; set; }
	}
}
