using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Lexer {
	internal class State {
		private char[] Data { get; }

		public int Offset { get; private set; }

		public State(string code) {
			this.Data = code.ToCharArray();
			this.Offset = 0;
		}

		public bool EOF => this.Offset >= this.Data.Length;

		public char Peek() => this.EOF ? '\0' : this.Data[this.Offset];

		public char Next() => this.EOF ? '\0' : this.Data[this.Offset++];
	}
}
