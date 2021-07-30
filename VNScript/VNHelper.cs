using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal static class VNHelper {
		public static bool IsInteger(double value) => !value.ToString().Contains(".");
	}
}
