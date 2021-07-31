using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal static class VNHelper {
		public static bool IsInteger(double value) => !value.ToString().Contains(".");

		public static VNPosition AsPosition(string pos) {
			switch(pos.ToLower()) {
				case "left":
					return VNPosition.Left;
				case "center":
					return VNPosition.Center;
				case "right":
					return VNPosition.Right;
			}
			return VNPosition.None;
		}
	}
}
