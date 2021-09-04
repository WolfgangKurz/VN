using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Compiler {
	internal enum ByteCodeType : byte {
		/// <summary>
		/// <c>[0]</c>
		/// <para>아무것도 하지 않음 (예약됨)</para>
		/// </summary>
		Reserved = 0,

		/// <summary>
		/// <c>[1]</c>
		/// <para>새로운 Scope를 생성함</para>
		/// </summary>
		EnterBlock = 1,

		/// <summary>
		/// <c>[2]</c>
		/// <para>현재 Scope를 종료함</para>
		/// </summary>
		ExitBlock = 2,

		/// <summary>
		/// <c>[3]</c>
		/// <para>{stack:0}이 논리적으로 false라면 {stack:-1, int} 위치로 이동</para>
		/// </summary>
		Test = 3,

		/// <summary>
		/// <c>[4]</c>
		/// <para>{stack:0, int} 위치로 이동</para>
		/// </summary>
		Jump = 4,

		/// <summary>
		/// <c>[5] [t:1] [n:1] [...:n]</c>
		/// <para>[n] 바이트만큼 읽어서 [t]</c> 형식으로 스택에 추가</para>
		/// <para>  t = VMValueType</para>
		/// </summary>
		Push = 5,

		/// <summary>
		/// <c>[6]</c>
		/// <para>가장 마지막 스택을 꺼냄</para>
		/// </summary>
		Pop = 6,

		/// <summary>
		/// <c>[7]</c>
		/// <para>{stack:0}에 {stack:-1}을 대입 후 {stack:0}을 다시 Push</para>
		/// </summary>
		Assign = 7,

		/// <summary>
		/// <c>[8]</c>
		/// <para>{stack:0}을 꺼내서 Keyword를 평가하여 값을 Push</para>
		/// </summary>
		Evaluate = 8,

		/// <summary>
		/// <c>[9] [paramLen:1] &lt;param: [spec:1] &lt;def?: [pn:1] [...:pn]&gt;&gt;:paramLen   [nameLen:1] [name:nameLen]   [len:4] [...:len]</c>
		/// <para>[...] 바이트코드를 [name] 이름과 &lt;param&gt; 인자를 가지는 함수로 정의</para>
		/// <para>[spec]은 <see cref="Push"/>의 [t]와 같으며, 기본 값이 없는 인자라면 (반드시 포함해야하는 인자라면) 255 값을 가짐</para>
		/// <para>[spec]이 255가 아니라면, &lt;def&gt;가 있어야하며, <see cref="Push"/>의 내용과 같음</para>
		/// </summary>
		Define = 9,


		/// <summary>
		/// <c>[11]</c>
		/// <para>{stack:0}과 {stack:-1}을 논리 OR 연산 후 Number를 Push</para>
		/// </summary>
		LogicalOr = 11,

		/// <summary>
		/// <c>[12]</c>
		/// <para>{stack:0}과 {stack:-1}을 논리 AND 연산 후 Number를 Push</para>
		/// </summary>
		LogicalAnd = 12,

		/// <summary>
		/// <c>[13]</c>
		/// <para>{stack:0}과 {stack:-1}을 Integer로 변환하고 비트 OR 연산 후 Number를 Push</para>
		/// </summary>
		BitwiseOr = 13,

		/// <summary>
		/// <c>[14]</c>
		/// <para>{stack:0}과 {stack:-1}을 Integer로 변환하고 비트 XOR 연산 후 Number를 Push</para>
		/// </summary>
		BitwiseXor = 14,

		/// <summary>
		/// <c>[15]</c>
		/// <para>{stack:0}과 {stack:-1}을 Integer로 변환하고 비트 AND 연산 후 Number를 Push</para>
		/// </summary>
		BitwiseAnd = 15,


		/// <summary>
		/// <c>[21]</c>
		/// <para>{stack:0}과 {stack:-1}을 일치 비교 후 Boolean을 Push</para>
		/// </summary>
		Equal = 21,

		/// <summary>
		/// <c>[22]</c>
		/// <para>{stack:0}과 {stack:-1}을 불일치 비교 후 Boolean을 Push</para>
		/// </summary>
		NotEqual = 22,

		/// <summary>
		/// <c>[23]</c>
		/// <para>{stack:0}과 {stack:-1}을 대소 비교 후 Boolean을 Push</para>
		/// </summary>
		Lesser = 23,

		/// <summary>
		/// <c>[24]</c>
		/// <para>{stack:0}과 {stack:-1}을 대소/일치 비교 후 Boolean을 Push</para>
		/// </summary>
		LesserEqual = 24,

		/// <summary>
		/// <c>[25]</c>
		/// <para>{stack:0}과 {stack:-1}을 대소 비교 후 Boolean을 Push</para>
		/// </summary>
		Greater = 25,

		/// <summary>
		/// <c>[26]</c>
		/// <para>{stack:0}과 {stack:-1}을 대소/일치 비교 후 Boolean을 Push</para>
		/// </summary>
		GreaterEqual = 26,


		/// <summary>
		/// <c>[31]</c>
		/// <para>{stack:0}를 {stack:-1}만큼 좌측방향 비트시프트 후 Number를 Push</para>
		/// </summary>
		BitwiseLeftShift = 31,

		/// <summary>
		/// <c>[32]</c>
		/// <para>{stack:0}를 {stack:-1}만큼 우측방향 비트시프트 후 Number를 Push</para>
		/// </summary>
		BitwiseRightShift = 32,


		/// <summary>
		/// <c>[51]</c>
		/// <para>{stack:0}과 {stack:-1}를 가산 연산 후 Number 또는 String을 Push</para>
		/// </summary>
		Addition = 51,

		/// <summary>
		/// <c>[52]</c>
		/// <para>{stack:0}과 {stack:-1}를 감산 연산 후 Number를 Push</para>
		/// </summary>
		Subtraction = 52,

		/// <summary>
		/// <c>[53]</c>
		/// <para>{stack:0}과 {stack:-1}를 문자열로 이은 후 String을 Push</para>
		/// </summary>
		Concatenate = 53,

		/// <summary>
		/// <c>[54]</c>
		/// <para>{stack:0}과 {stack:-1}를 곱셈 연산 후 Number를 Push</para>
		/// </summary>
		Multiplication = 54,

		/// <summary>
		/// <c>[55]</c>
		/// <para>{stack:0}과 {stack:-1}를 나눔 연산 후 Number를 Push</para>
		/// </summary>
		Division = 55,

		/// <summary>
		/// <c>[56]</c>
		/// <para>{stack:0}과 {stack:-1}를 나머지 연산 후 Number를 Push</para>
		/// </summary>
		Remainder = 56,

		/// <summary>
		/// <c>[57]</c>
		/// <para>{stack:0}과 {stack:-1}를 제곱 연산 후 Number를 Push</para>
		/// </summary>
		Power = 57,

		/// <summary>
		/// <c>[61]</c>
		/// <para>{stack:0}의 부호를 변경하지 않고 Number를 Push</para>
		/// </summary>
		UnaryPositive = 61,

		/// <summary>
		/// <c>[62]</c>
		/// <para>{stack:0}의 부호를 반전 후 Number를 Push</para>
		/// </summary>
		UnaryNegative = 62,

		/// <summary>
		/// <c>[63]</c>
		/// <para>{stack:0}의 논리를 반전 후 Boolean을 Push</para>
		/// </summary>
		LogicalNot = 63,

		/// <summary>
		/// <c>[64]</c>
		/// <para>{stack:0}를 Integer로 변환하고 비트를 반전 후 Number를 Push</para>
		/// </summary>
		BitwiseNot = 64,


		/// <summary>
		/// <c>[71] [return:1] [argc:1]</c>
		/// <para>{stack:0} 이름을 가지는 함수를 {stack:argc} 파라메터로 전달, 인자는 스택에서 역순 꺼냄</para>
		/// <list>
		/// <item>첫번째 인자 -> {stack:-n+1}</item>
		/// <item>두번째 인자 -> {stack:-n+2} ...</item>
		/// </list>
		/// <para><c>[return]</c>이 1인 경우 결과를 Push 하며, 결과가 없어도 Null을 Push함</para>
		/// <para><c>[return]</c>이 0인 경우, 결과를 Push하지 않음</para>
		/// </summary>
		Call = 71,

		/// <summary>
		/// <c>[72]</c>
		/// <para>현재 실행중인 State를 종료</para>
		/// </summary>
		EndOfState = 73,
	}

	internal enum ReservedCodeType: byte {
	}
}
