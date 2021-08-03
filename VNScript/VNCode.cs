using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal class VNCode {
		protected static readonly Regex NumberRegex = new Regex(@"^-?\d+(?:\.\d+)?$", RegexOptions.Compiled);

		public VNCodeType Type { get; }
		public VNValue[] Params { get; }

		public VNCode(string Code) {
			var stage = 0;
			var escaping = false;
			var sb = new StringBuilder();
			var p = new List<VNValue>();

			for (var i = 0; i < Code.Length; i++) {
				var c = Code[i];

				if (stage == 0) { // 명령어 대기중
					if (c == ' ' || c == '\t') continue;
					if (c == '#') break; // 주석 구문
					stage = 1;
					i--;
				}
				else if (stage == 1) { // 명령어 파싱
					if (c == ' ' || c == '\t') {
						if (sb.Length == 0) continue;

						this.Type = this.GetCodeType(sb.ToString());
						if (this.Type == VNCodeType.NONE)
							throw new Exception("VNCode 구문 분석 실패 - 알 수 없는 명령어입니다.");

						sb.Clear();
						stage = 2;
					}
					else
						sb.Append(c);
				}
				else if (stage == 2) { // 인자 대기중
					if (c == '#') break; // 주석 구문
					if (c == ' ' || c == '\t') continue;

					stage = 3;
					i--;
				}
				else if (stage == 3) { // 인자 파싱
					if (c == ' ' || c == '\t' || c == ',') {
						var v = this.GetValue(sb.ToString());
						p.Add(v);
						sb.Clear();

						stage = 4;
						i--;
					}
					else if (c == '"') {
						stage = 5; // String
						sb.Append(c);
					}
					else
						sb.Append(c);
				}
				else if (stage == 4) { // 다음 인자 또는 끝을 기다리는 중
					if (c == ' ' || c == '\t')
						continue;
					else if (c == ',')
						stage = 2;
					else
						throw new Exception("VNCode 구문 분석 실패 - 예상하지 못한 문자입니다.");
				}
				else if (stage == 5) { // 문자열 파싱
					if (c == '"' && !escaping)
						stage = 3;
					else if (c == '\\') {
						escaping = true;
						continue;
					}

					sb.Append(c);
				}
			}

			if (stage == 0) { // 비어있는 코드 (주석 줄 등)
				this.Type = VNCodeType.NONE;
				this.Params = new VNValue[0];
				return;
			}

			if (stage == 5) // 문자열 파싱 도중에 끝을 만남
				throw new Exception("VNCode 구문 분석 실패 - 예상하지 못한 끝입니다.");

			if (sb.Length > 0)
				p.Add(this.GetValue(sb.ToString()));

			this.Params = p.ToArray();
		}

		protected VNCodeType GetCodeType(string code) {
			var c = code.ToUpper();
			switch (c) {
				case "SCRIPT": return VNCodeType.SCRIPT;
				case "SET": return VNCodeType.SET;
				case "UNLOCK": return VNCodeType.UNLOCK;
				case "TEXT": return VNCodeType.TEXT;
				case "SAY": return VNCodeType.SAY;
				case "SEL": return VNCodeType.SEL;
				case "BGM": return VNCodeType.BGM;
				case "BG": return VNCodeType.BG;
				case "SCG": return VNCodeType.SCG;
				case "FX": return VNCodeType.FX;
				case "FREEZE": return VNCodeType.FREEZE;
				case "TRANSITION": return VNCodeType.TRANSITION;
			}
			return VNCodeType.NONE;
		}

		protected VNValue GetValue(string code) {
			if (code.StartsWith("\"")) // 문자열
				return new VNValue(VNType.String, code.Substring(1, code.Length - 2));

			if (NumberRegex.IsMatch(code))
				return new VNValue(VNType.Number, double.Parse(code));

			if (code.ToLower() == "true") return new VNValue(VNType.Boolean, true);
			if (code.ToLower() == "false") return new VNValue(VNType.Boolean, false);
			if (code.ToLower() == "null") return new VNValue(VNType.Null, null);

			return new VNValue(VNType.Symbol, code);
		}

		public override string ToString() => $"{this.Type} {string.Join(", ", this.Params.Select(x => x.AsSerialize))}";
	}

}
