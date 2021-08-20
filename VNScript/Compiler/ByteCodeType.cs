using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Compiler {
	internal enum ByteCodeType : byte {
		/// <summary>
		/// [0]
		/// 아무것도 하지 않음 (예약됨)
		/// </summary>
		Reserved = 0,

		/// <summary>
		/// [1]
		/// 새로운 Scope를 생성함
		/// </summary>
		EnterBlock = 1,

		/// <summary>
		/// [2]
		/// 현재 Scope를 종료함
		/// </summary>
		ExitBlock = 2,

		/// <summary>
		/// [3]
		/// {stack:0}이 논리적으로 false라면 {stack:-1, int} 위치로 이동
		/// </summary>
		Test = 3,

		/// <summary>
		/// [4]
		/// {stack:0, int} 위치로 이동
		/// </summary>
		Jump = 4,

		/// <summary>
		/// [5] [t:1] [n:1] [...:n]
		/// [n] 바이트만큼 읽어서 [t] 형식으로 스택에 추가
		///   t = VMValueType
		/// </summary>
		Push = 5,

		/// <summary>
		/// [6]
		/// 가장 마지막 스택을 꺼냄
		/// </summary>
		Pop = 6,

		/// <summary>
		/// [7]
		/// {stack:0}에 {stack:-1}을 대입 후 {stack:0}을 다시 Push
		/// </summary>
		Assign = 7,

		/// <summary>
		/// [8]
		/// {stack:0}을 꺼내서 Keyword를 평가하여 값을 Push
		/// </summary>
		Evaluate = 8,

		/// <summary>
		/// [9] [n:1] [name:n] [len:4] [...:len]
		/// [...] 바이트코드를 [name] 이름을 가지는 함수로 정의
		/// </summary>
		Define = 9,


		/// <summary>
		/// [11]
		/// {stack:0}과 {stack:-1}을 논리 OR 연산 후 Number를 Push
		/// </summary>
		LogicalOr = 11,

		/// <summary>
		/// [12]
		/// {stack:0}과 {stack:-1}을 논리 AND 연산 후 Number를 Push
		/// </summary>
		LogicalAnd = 12,

		/// <summary>
		/// [13]
		/// {stack:0}과 {stack:-1}을 Integer로 변환하고 비트 OR 연산 후 Number를 Push
		/// </summary>
		BitwiseOr = 13,

		/// <summary>
		/// [14]
		/// {stack:0}과 {stack:-1}을 Integer로 변환하고 비트 XOR 연산 후 Number를 Push
		/// </summary>
		BitwiseXor = 14,

		/// <summary>
		/// [15]
		/// {stack:0}과 {stack:-1}을 Integer로 변환하고 비트 AND 연산 후 Number를 Push
		/// </summary>
		BitwiseAnd = 15,


		/// <summary>
		/// [21]
		/// {stack:0}과 {stack:-1}을 일치 비교 후 Boolean을 Push
		/// </summary>
		Equal = 21,

		/// <summary>
		/// [22]
		/// {stack:0}과 {stack:-1}을 불일치 비교 후 Boolean을 Push
		/// </summary>
		NotEqual = 22,

		/// <summary>
		/// [23]
		/// {stack:0}과 {stack:-1}을 대소 비교 후 Boolean을 Push
		/// </summary>
		Lesser = 23,

		/// <summary>
		/// [24]
		/// {stack:0}과 {stack:-1}을 대소/일치 비교 후 Boolean을 Push
		/// </summary>
		LesserEqual = 24,

		/// <summary>
		/// [25]
		/// {stack:0}과 {stack:-1}을 대소 비교 후 Boolean을 Push
		/// </summary>
		Greater = 25,

		/// <summary>
		/// [26]
		/// {stack:0}과 {stack:-1}을 대소/일치 비교 후 Boolean을 Push
		/// </summary>
		GreaterEqual = 26,


		/// <summary>
		/// [31]
		/// {stack:0}를 {stack:-1}만큼 좌측방향 비트시프트 후 Number를 Push
		/// </summary>
		BitwiseLeftShift = 31,

		/// <summary>
		/// [32]
		/// {stack:0}를 {stack:-1}만큼 우측방향 비트시프트 후 Number를 Push
		/// </summary>
		BitwiseRightShift = 32,


		/// <summary>
		/// [51]
		/// {stack:0}과 {stack:-1}를 가산 연산 후 Number 또는 String을 Push
		/// </summary>
		Addition = 51,

		/// <summary>
		/// [52]
		/// {stack:0}과 {stack:-1}를 감산 연산 후 Number를 Push
		/// </summary>
		Subtraction = 52,

		/// <summary>
		/// [53]
		/// {stack:0}과 {stack:-1}를 문자열로 이은 후 String을 Push
		/// </summary>
		Concatenate = 53,

		/// <summary>
		/// [54]
		/// {stack:0}과 {stack:-1}를 곱셈 연산 후 Number를 Push
		/// </summary>
		Multiplication = 54,

		/// <summary>
		/// [55]
		/// {stack:0}과 {stack:-1}를 나눔 연산 후 Number를 Push
		/// </summary>
		Division = 55,

		/// <summary>
		/// [56]
		/// {stack:0}과 {stack:-1}를 나머지 연산 후 Number를 Push
		/// </summary>
		Remainder = 56,

		/// <summary>
		/// [57]
		/// {stack:0}과 {stack:-1}를 제곱 연산 후 Number를 Push
		/// </summary>
		Power = 57,

		/// <summary>
		/// [61]
		/// {stack:0}의 부호를 변경하지 않고 Number를 Push
		/// </summary>
		UnaryPositive = 61,

		/// <summary>
		/// [62]
		/// {stack:0}의 부호를 반전 후 Number를 Push
		/// </summary>
		UnaryNegative = 62,

		/// <summary>
		/// [63]
		/// {stack:0}의 논리를 반전 후 Boolean을 Push
		/// </summary>
		LogicalNot = 63,

		/// <summary>
		/// [64]
		/// {stack:0}를 Integer로 변환하고 비트를 반전 후 Number를 Push
		/// </summary>
		BitwiseNot = 64,


		/// <summary>
		/// [71] [return:1] [argc:1]
		/// {stack:0} 이름을 가지는 함수를 {stack:argc} 파라메터로 전달
		///   인자는 스택에서 역순 꺼냄
		///   첫번째 인자 -> {stack:-n+1}
		///   두번째 인자 -> {stack:-n+2} ...
		/// [return]이 1인 경우 결과를 Push 하며, 결과가 없어도 Null을 Push함
		/// [return]이 0인 경우, 결과를 Push하지 않음
		/// </summary>
		Call = 71,

		/// <summary>
		/// [72]
		/// 현재 실행중인 State를 종료
		/// </summary>
		EndOfState = 73,
	}

	internal enum ReservedCodeType: byte {
	}
}
