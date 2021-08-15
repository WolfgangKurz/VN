using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	using VM = VNScript.VM.VM;
	using VMValue = VNScript.VM.VMValue;
	using VMValueType = VNScript.VM.VMValueType;

	internal class FX {
		public static void Register(VNScript.VM.VM VM) {
			VM.Register("SCG_LightOff", (args, storage) => VMValue.Null());
			VM.Register("SCG_Light", (args, storage) => VMValue.Null());
			VM.Register("Shake_Week", (args, storage) => VMValue.Null());
			VM.Register("Shake_Fadeout", (args, storage) => VMValue.Null());
			VM.Register("BGM_Fadeout", (args, storage) => VMValue.Null());

			// TODO, remove
			VM.Register("Fadein", (args, storage) => VMValue.Null());
			VM.Register("Fadeout", (args, storage) => VMValue.Null());
		}
	}
}
