using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace VNScript.Lexer {
	public class Lexer {
		private static Regex NumberRegex { get; } = new Regex(@"^[0-9]+(\.[0-9]+)?$", RegexOptions.Compiled);
		private static Regex BooleanRegex { get; } = new Regex(@"^(true|false)$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
		private static Regex NullRegex { get; } = new Regex(@"^null$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
		private static string[] ReservedList { get; } = new string[] {
			"if",
			"while", "for",
			"func", "return",
		};
		private static Regex KeywordRegex { get; } = new Regex(@"^[@\$]?[a-zA-Z_].*$", RegexOptions.Compiled);

		private static Token LexBuffer(State state, string buffer, ref int offset) {
			var _offset = offset;
			offset = -1;

			var sb = new StringBuilder();

			if (NumberRegex.IsMatch(buffer))
				return new Token(TokenType.NUMBER, buffer, _offset, buffer.Length);

			else if (BooleanRegex.IsMatch(buffer))
				return new Token(TokenType.BOOLEAN, buffer, _offset, buffer.Length);

			else if (NullRegex.IsMatch(buffer))
				return new Token(TokenType.NULL, buffer, _offset, buffer.Length);

			else if (ReservedList.Any(x => x.Equals(buffer, StringComparison.OrdinalIgnoreCase))) {
				var keyword = buffer.ToUpper();
				TokenType tokenType;
				if (!Enum.TryParse<TokenType>(keyword, out tokenType))
					throw new Exception("VNScript SyntaxError - Unknown reserved keyword");

				return new Token(tokenType, buffer, _offset, buffer.Length);
			}
			else if (KeywordRegex.IsMatch(buffer))
				return new Token(TokenType.IDENTIFIER, buffer, _offset, buffer.Length);

			throw new Exception("VNScript SyntaxError - Invalid Keyword");
		}

		private static void ProcBuffer(State state, StringBuilder sb, List<Token> list, ref int offset) {
			if (sb.Length > 0) {
				list.Add(Lexer.LexBuffer(state, sb.ToString(), ref offset));
				sb.Clear();
			}
		}

		public static Token[] Lex(string code) {
			var list = new List<Token>();
			var state = new State(code);
			var sb = new StringBuilder();
			var offset = -1;

			while (!state.EOF) {
				var c = state.Next();

				switch (c) {
					case ' ':
					case '\t':
					case '\f':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						break;

					case '\r':
					case '\n':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (c == '\r' && state.Peek() == '\n') {
							list.Add(new Token(TokenType.NEWLINE, "\r\n", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.NEWLINE, c.ToString(), state.Offset, 1));
						break;

					case '.':
						if (state.Peek() == '.') {
							Lexer.ProcBuffer(state, sb, list, ref offset);
							list.Add(new Token(TokenType.DOT2, "..", state.Offset, 2));
							state.Next();
						}
						else {
							if (offset < 0) offset = state.Offset;
							sb.Append(c);
						}
						break;
					case '=':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.EQUAL, "==", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.ASSIGN, "=", state.Offset, 1));
						break;
					case '!':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.NOT_EQUAL, "!=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.LOGICAL_NOT, "!", state.Offset, 1));
						break;
					case '~':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.BITWISE_NOT, "~", state.Offset, 1));
						break;
					case '>':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '>') {
							state.Next();

							if (state.Peek() == '=') {
								list.Add(new Token(TokenType.RSHIFT_ASSIGN, ">>=", state.Offset, 3));
								state.Next();
							}
							else
								list.Add(new Token(TokenType.RSHIFT, ">>", state.Offset, 2));
						}
						else if (state.Peek() == '=') {
							list.Add(new Token(TokenType.GREATER_EQUAL, ">=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.GREATER, ">", state.Offset, 1));
						break;
					case '<':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '<') {
							state.Next();

							if (state.Peek() == '=') {
								list.Add(new Token(TokenType.LSHIFT_ASSIGN, "<<=", state.Offset, 3));
								state.Next();
							}
							else
								list.Add(new Token(TokenType.LSHIFT, "<<", state.Offset, 2));
						}
						else if (state.Peek() == '=') {
							list.Add(new Token(TokenType.LESSER_EQUAL, "<=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.LESSER, "<", state.Offset, 1));
						break;

					case '+':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.ADDITION_ASSIGN, "+=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.PLUS, "+", state.Offset, 1));
						break;
					case '-':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.SUBTRACTION_ASSIGN, "-=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.MINUS, "-", state.Offset, 1));
						break;
					case '*':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.MULTIPLICATION_ASSIGN, "*=", state.Offset, 2));
							state.Next();
						}
						else if (state.Peek() == '*') {
							state.Next();

							if (state.Peek() == '=') {
								list.Add(new Token(TokenType.POWER_ASSIGN, "**=", state.Offset, 3));
								state.Next();
							}
							else
								list.Add(new Token(TokenType.POWER, "**", state.Offset, 2));
						}
						else
							list.Add(new Token(TokenType.MULTIPLICATION, "*", state.Offset, 1));
						break;
					case '/':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '/') {
							var newLines = new char[] { '\r', '\n' };
							while (!state.EOF && !newLines.Contains(state.Peek()))
								state.Next();
						}
						else if (state.Peek() == '=') {
							list.Add(new Token(TokenType.DIVISION_ASSIGN, "/=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.DIVISION, "/", state.Offset, 1));
						break;
					case '%':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.REMAINDER_ASSIGN, "%=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.REMAINDER, "%", state.Offset, 1));
						break;

					case '(':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.LPAREN, "(", state.Offset, 1));
						break;
					case ')':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.RPAREN, ")", state.Offset, 1));
						break;

					case '{':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.LPARA, "{", state.Offset, 1));
						break;
					case '}':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.RPARA, "}", state.Offset, 1));
						break;

					case '&':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '&') {
							list.Add(new Token(TokenType.LOGICAL_AND, "&&", state.Offset, 2));
							state.Next();
						}
						else if (state.Peek() == '=') {
							list.Add(new Token(TokenType.AND_ASSIGN, "&=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.AND, "&", state.Offset, 1));
						break;
					case '|':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '|') {
							list.Add(new Token(TokenType.LOGICAL_OR, "||", state.Offset, 2));
							state.Next();
						}
						else if (state.Peek() == '=') {
							list.Add(new Token(TokenType.OR_ASSIGN, "|=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.OR, "|", state.Offset, 1));
						break;
					case '^':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						if (state.Peek() == '=') {
							list.Add(new Token(TokenType.XOR_ASSIGN, "^=", state.Offset, 2));
							state.Next();
						}
						else
							list.Add(new Token(TokenType.XOR, "^", state.Offset, 1));
						break;

					case ';':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.SEMICOLON, ";", state.Offset, 1));
						break;
					case ',':
						Lexer.ProcBuffer(state, sb, list, ref offset);
						list.Add(new Token(TokenType.COMMA, ",", state.Offset, 1));
						break;

					case '"': {
							var escape = false;
							while (!state.EOF) {
								var _ = state.Next();
								if (_ == '\0')
									throw new Exception("VNScript Lexer Error - String did not ended");

								if (escape) {
									switch (_) {
										case 't':
											sb.Append('\t');
											break;
										case 'r':
											sb.Append('\r');
											break;
										case 'n':
											sb.Append('\n');
											break;
										case '\\':
											sb.Append('\\');
											break;
										default:
											sb.Append(_);
											break;
									}
									escape = false;
								}
								else if (_ == '\\')
									escape = true;
								else if (_ == '"')
									break;
								else
									sb.Append(_);
							}
						}
						list.Add(new Token(TokenType.STRING, sb.ToString(), offset, sb.Length));
						sb.Clear();
						offset = -1;
						break;

					default:
						if (offset < 0) offset = state.Offset;
						sb.Append(c);
						break;
				}
			}
			Lexer.ProcBuffer(state, sb, list, ref offset);

			return list.ToArray();
		}
	}
}
