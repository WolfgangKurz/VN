using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Parser {
	internal interface IResult<out T> {
		T Value { get; }
		Cursor StartCursor { get; }
		Cursor EndCursor { get; }
	}
}
