using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace VNScript.Parser {
	internal class Cursor {
		public Lexer.Token[] Tokens { get; }
		public int Offset { get; private set; }
		public int StateKey { get; }

		private static int previousStateKey = -1;
		private static int NextStateKey() => Interlocked.Increment(ref previousStateKey);

		public Cursor(Lexer.Token[] Tokens) {
			this.Tokens = Tokens;
			this.Offset = 0;
			this.StateKey = Cursor.NextStateKey();
		}

		public int Size => this.Tokens.Length;

		public bool EOF => this.Offset >= this.Size;

		public Lexer.Token Get() => this.EOF ? null : this.Tokens[this.Offset++];

		public Lexer.Token Peek(int offset = 0) => this.Offset + offset >= this.Size
			? null
			: this.Tokens[this.Offset + offset];

		public Lexer.Token[] Take(int count) {
			var ret = new Lexer.Token[count];
			Array.Copy(this.Tokens, this.Offset, ret, 0, count);
			return ret;
		}

		public void Move(int pos) => this.Offset = pos;

		public Cursor Prev(int step = 1) {
			this.Offset -= step;
			return this;
		}
		public Cursor Next(int step = 1) {
			this.Offset += step;
			return this;
		}

		public Cursor Clone() {
			var _ = new Cursor(this.Tokens);
			_.Move(this.Offset);
			return _;
		}
	}

}
