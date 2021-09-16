using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	[Flags]
	internal enum UIState {
		/// <summary>
		/// 어떠한 상태도 아님
		/// </summary>
		None = 0,

		/// <summary>
		/// 조작 가능한 상태
		/// </summary>
		Interactive = 1,

		/// <summary>
		/// UI가 그려질 준비가 된 상태 (인게임)
		/// </summary>
		Ready = 2,

		All = Interactive | Ready,
	}
}
