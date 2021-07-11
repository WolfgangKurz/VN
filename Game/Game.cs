using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	public class Game {
		// 싱글톤 패턴
		internal static Game Instance { get; } = new Game();


		public string Title { get; set; } = "VN";

		public int Width { get; set; } = 800;
		public int Height { get; set; } = 450;

		public bool Resizable { get; set; } = false;
		public MarginType MarginType { get; set; } = MarginType.LetterBox;

		public string Entry { get; set; } = "entry.vns";


		private Game() {
			// new 할당 방지
		}
	}
}
