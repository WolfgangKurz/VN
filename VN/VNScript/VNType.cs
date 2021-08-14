using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	/// <summary>
	/// VNScript에서 사용하는 값의 형식
	/// </summary>
	internal enum VNType : int {
		/// <summary>
		/// 빈 값
		/// </summary>
		Null = 0,

		/// <summary>
		/// 숫자 값 (double 사용)
		/// </summary>
		Number = 1,

		/// <summary>
		/// 문자열
		/// </summary>
		String = 2,

		/// <summary>
		/// 논리값
		/// </summary>
		Boolean = 3,

		/// <summary>
		/// 심볼
		/// </summary>
		Symbol = 4,
	}
}
