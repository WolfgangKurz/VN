using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Lexer {
	public class Token {
		private static TokenType[] OperandTypes { get; } = new TokenType[] {
				TokenType.STRING,
				TokenType.NUMBER,
				TokenType.BOOLEAN,
				TokenType.IDENTIFIER,
			};

		public TokenType type { get; }
		public string value { get; }
		public int offset { get; }
		public int length { get; }

		public Token(TokenType type, string value, int offset, int length) {
			this.type = type;
			this.value = value;
			this.offset = offset;
			this.length = length;
		}

		public bool isOperand => Token.OperandTypes.Contains(this.type);

		public bool isOperator => !this.isOperand;

		public override string ToString() => this.value;
	}
}
