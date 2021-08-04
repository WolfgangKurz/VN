using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal class VNStatus {
		public string ScriptName { get; }

		public int Cursor { get; private set; }

		public ReadOnlyDictionary<string, int> Labels { get; }

		protected VNCode[] Codes { get; }

		public VNStatus(string Script) {
			this.Codes = Script.Split(new char[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
				.Select(x => new VNCode(x.Trim()))
				.Where(x => x.Type != VNCodeType.NONE)
				.ToArray();

			this.Cursor = 0;

			var labels = new Dictionary<string, int>();
			for (int i = 0; i < this.Codes.Length; i++) {
				var code = this.Codes[i];
				if (code.Type == VNCodeType.LABEL) {
					var param = code.Params;

					if (param.Length != 1)
						throw VNException.ParamLenException("LABEL", 1, param.Length);
					if (!param[0].isSymbol)
						throw VNException.ParamTypeException("LABEL", 1, "Symbol", param[0].type.ToString());

					var label = param[0].AsSymbol;
					if (labels.ContainsKey(label))
						throw VNException.LabelAlreadyExists(label);
					labels[label] = i;
				}
			}
			this.Labels = new ReadOnlyDictionary<string, int>(labels);
		}

		public void Seek(int cursor) {
			if (cursor < 0 || cursor >= this.Codes.Length)
				throw new Exception("VNStatus 오류 - 범위를 벗어났습니다.");

			this.Cursor = cursor;
		}

		public VNCode Next() => this.Codes[this.Cursor++];

		public bool EOF => this.Cursor >= this.Codes.Length;
	}
}
