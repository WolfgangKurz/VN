using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal static class VNException {
		public static Exception UnknownCommand(string command) =>
			new Exception($"VNInterpreter 실행 오류 - '{command}'은(는) 알 수 없는 명령어입니다.");
		public static Exception ParamLenException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 '{should}'개여야하지만, '{input}'개였습니다.");
		public static Exception ParamLenMinException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 최소 '{should}'개여야하지만, '{input}'개였습니다.");
		public static Exception ParamLenMaxException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 최대 '{should}'개여야하지만, '{input}'개였습니다.");
		public static Exception ParamTypeException(string type, int idx, string should, string input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{should}'이어야하지만, '{input}'이었습니다.");
		public static Exception ParamVarNotFoundException(string key) =>
			new Exception($"VNInterpreter 실행 오류 - 변수 '{key}'을(를) 참조하려고 했지만 존재하지 않았습니다.");
		public static Exception ParamIntegerException(string type, int idx) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 정수형이어야합니다.");
		public static Exception ParamRangeException(string type, int idx, int min, int max, double value) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{min}'이상 '{max}'이하여야하지만, '{value}'였습니다.");
		public static Exception ParamListException(string type, int idx, string[] list, string value) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{string.Join(", ", list)}' 중 하나여야하지만 '{value}'였습니다.");
		public static Exception VarTypeException(string name, string should, string input) =>
			new Exception($"VNInterpreter 실행 오류 - 변수 '{name}'은(는) '{should}'이어야하지만, '{input}'이었습니다.");
		public static Exception LabelAlreadyExists(string label) =>
			new Exception($"VNInterpreter 실행 오류 - '{label}'은(는) 이미 존재하는 레이블입니다.");
		public static Exception LabelNotFound(string label) =>
			new Exception($"VNInterpreter 실행 오류 - 레이블 '{label}'을(를) 찾을 수 없었습니다..");
		public static Exception IFENDNotFound() =>
			new Exception("VNInterpreter 실행 오류 - IF에 짝이 맞는 END를 찾을 수 없었습니다.");
		public static Exception BGMFileNotFound(string bgm) =>
			new Exception($"VNInterpreter 실행 오류 - 배경음악 '{bgm}'을(를) 찾을 수 없습니다.");
		public static Exception BGFileNotFound(string bg)=>
			new Exception($"VNInterpreter 실행 오류 - 배경 '{bg}'을(를) 찾을 수 없습니다.");
		public static Exception SCGFileNotFound(string scg) =>
			new Exception($"VNInterpreter 실행 오류 - SCG '{scg}'을(를) 찾을 수 없습니다.");
	}
}
