using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;
using System.IO;

namespace VN {
	internal class Helper {
#if DEBUG
		private static string BaseDir = "..\\..";
#else
		private static string BaseDir = ".";
#endif

		public static string DirName => Path.Combine(Path.GetDirectoryName(Helper.Self), Helper.BaseDir);

		public static string Self => Assembly.GetEntryAssembly().Location;
	}
}
