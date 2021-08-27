using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace VNScript.Parser {
	public class Parser {
		private Dictionary<CacheKey, IResult<AST.Node>> storage { get; set; }

		private Parser() { }

		public static AST.Program Parse(string Code) {
			var instance = new Parser();

			var lexed = Lexer.Lexer.Lex(Code);
			var ret = instance.Run(lexed);
			return ret;
		}

		public AST.Program Run(Lexer.Token[] tokens) {
			var state = new Cursor(tokens);
			this.storage = new Dictionary<CacheKey, IResult<AST.Node>>();

			var ret = this.Program(ref state);
			return this.ValueOrDefault(ret);
		}

		private T ValueOrDefault<T>(IResult<T> result) => result == null ? default(T) : result.Value;
		private IResult<T> ReturnHelper<T>(Cursor startCursor, ref Cursor endCursor, Func<Cursor, T> wrappedCode) {
			var result = wrappedCode(endCursor);
			var lexical = result as ILexical;
			if (lexical != null && lexical.StartCursor == null && lexical.EndCursor == null) {
				lexical.StartCursor = startCursor;
				lexical.EndCursor = endCursor;
			}
			return new Result<T>(startCursor, endCursor, result);
		}

		private IResult<Lexer.Token[]> ParseToken(ref Cursor cursor, Lexer.TokenType[] tokens) {
			for (var i = 0; i < tokens.Length; i++) {
				var cur = tokens[i];

				var token = cursor.Peek(i);
				if (token == null) return null;

				if (token.type != cur)
					return null;
			}

			var content = cursor.Take(tokens.Length);

			var endCursor = cursor.Clone().Next(tokens.Length);
			var result = ReturnHelper<Lexer.Token[]>(cursor, ref endCursor, state => content);
			cursor = endCursor;
			return result;
		}
		private IResult<Lexer.Token[]> ParseToken(ref Cursor cursor, Lexer.TokenType token) =>
			this.ParseToken(ref cursor, new Lexer.TokenType[] { token });

		/////////////////////////////////////////////////////////////////////////////////////

		private IResult<AST.Keyword> Keyword(ref Cursor cursor) {
			var token = cursor.Peek();
			if (token != null && token.type == Lexer.TokenType.IDENTIFIER) {
				var endCursor = cursor.Clone().Next();
				var result = this.ReturnHelper<AST.Keyword>(cursor, ref endCursor, state => new AST.Keyword(token));
				cursor = endCursor;
				return result;
			}
			return null;
		}
		private IResult<AST.Literal> Literal(ref Cursor cursor) {
			var token = cursor.Peek();
			if (token != null) {
				var allows = new Lexer.TokenType[] {
					Lexer.TokenType.NUMBER,
					Lexer.TokenType.BOOLEAN,
					Lexer.TokenType.STRING,
					Lexer.TokenType.NULL,
				};

				if (allows.Contains(token.type)) {
					var endCursor = cursor.Clone().Next();
					var result = this.ReturnHelper<AST.Literal>(cursor, ref endCursor, state => new AST.Literal(token));
					cursor = endCursor;
					return result;
				}
			}
			return null;
		}

		private IResult<AST.Program> Program(ref Cursor cursor) {
			IResult<AST.Program> r0 = null;

			var sc0 = cursor;
			var l0 = new List<AST.Node>();
			while (true) {
				while (true) // Skip newlines
					if (this.ParseToken(ref cursor, Lexer.TokenType.NEWLINE) == null)
						break;

				var r1 = this.Block(ref cursor);
				if (r1 == null) r1 = this.Root(ref cursor);

				if (r1 != null) {
					while (true) // Skip newlines
						if (this.ParseToken(ref cursor, Lexer.TokenType.NEWLINE) == null)
							break;

					l0.Add(r1.Value);
				}
				else {
					r0 = this.ReturnHelper<AST.Program>(sc0, ref cursor, state => new AST.Program(l0.ToArray()));
					break;
				}
			}

			return r0;
		}

		private IResult<AST.Node> Block(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			var sc0 = cursor;

			while (true) // Skip newlines
				if (this.ParseToken(ref cursor, Lexer.TokenType.NEWLINE) == null)
					break;

			if (this.ParseToken(ref cursor, Lexer.TokenType.LPARA) != null) {
				var r1 = this.Program(ref cursor);
				var exp = this.ValueOrDefault(r1);

				if (r1 != null && this.ParseToken(ref cursor, Lexer.TokenType.RPARA) != null)
					r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.Block(exp.Body));
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}

		private IResult<AST.Node> Root(ref Cursor cursor) {
			var sc0 = cursor;

			while (true) // Skip newlines
				if (this.ParseToken(ref cursor, Lexer.TokenType.NEWLINE) == null)
					break;

			IResult<AST.Node> r0 = null;
			if (r0 == null) r0 = this.If(ref cursor);
			if (r0 == null) r0 = this.While(ref cursor);
			if (r0 == null) r0 = this.For(ref cursor);
			if (r0 == null) r0 = this.Func(ref cursor);
			if (r0 == null) r0 = this.Return(ref cursor);
			if (r0 == null) r0 = this.RootCall(ref cursor);
			if (r0 == null) r0 = this.Expression(ref cursor);

			if (r0 == null) cursor = sc0;
			return r0;
		}

		private IResult<AST.Node> If(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			var sc0 = cursor;

			if (this.ParseToken(ref cursor, new Lexer.TokenType[] { Lexer.TokenType.IF, Lexer.TokenType.LPAREN }) != null) {
				var r1 = this.Expression(ref cursor);
				var condition = this.ValueOrDefault(r1);

				if (r1 != null && this.ParseToken(ref cursor, Lexer.TokenType.RPAREN) != null) {
					var r2 = this.Block(ref cursor);
					if (r2 == null) r2 = this.Root(ref cursor);

					var body = this.ValueOrDefault(r2);
					if (r2 != null)
						r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.If(condition, body));
					else
						cursor = sc0;
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}
		private IResult<AST.Node> While(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			var sc0 = cursor;

			if (this.ParseToken(ref cursor, new Lexer.TokenType[] { Lexer.TokenType.WHILE, Lexer.TokenType.LPAREN }) != null) {
				var r1 = this.Expression(ref cursor);
				var condition = this.ValueOrDefault(r1);

				if (r1 != null) {
					if (this.ParseToken(ref cursor, Lexer.TokenType.RPAREN) != null) {
						var r2 = this.Block(ref cursor);
						if (r2 == null) r2 = this.Root(ref cursor);

						var body = this.ValueOrDefault(r2);
						if (r2 != null)
							r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.While(condition, body));
						else
							cursor = sc0;
					}
					else
						cursor = sc0;
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}
		private IResult<AST.Node> For(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			var sc0 = cursor;

			if (this.ParseToken(ref cursor, new Lexer.TokenType[] { Lexer.TokenType.FOR, Lexer.TokenType.LPAREN }) != null) {
				var r1 = this.Expression(ref cursor);
				var initialize = this.ValueOrDefault(r1);

				if (r1 != null && this.ParseToken(ref cursor, Lexer.TokenType.SEMICOLON) != null) {
					var r2 = this.Expression(ref cursor);
					var condition = this.ValueOrDefault(r2);

					if (r2 != null && this.ParseToken(ref cursor, Lexer.TokenType.SEMICOLON) != null) {
						var r3 = this.Expression(ref cursor);
						var loop = this.ValueOrDefault(r3);

						if (r3 != null && this.ParseToken(ref cursor, Lexer.TokenType.RPAREN) != null) {
							var r4 = this.Block(ref cursor);
							if (r4 == null) r4 = this.Root(ref cursor);

							var body = this.ValueOrDefault(r4);
							if (r4 != null)
								r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.For(initialize, condition, loop, body));
							else
								cursor = sc0;
						}
						else
							cursor = sc0;
					}
					else
						cursor = sc0;
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}

		private IResult<AST.Func> Func(ref Cursor cursor) {
			IResult<AST.Func> r0 = null;

			var sc0 = cursor;

			if (this.ParseToken(ref cursor, Lexer.TokenType.FUNC) != null) {
				var r1 = this.Keyword(ref cursor);
				var name = this.ValueOrDefault(r1);

				if (r1 != null && this.ParseToken(ref cursor, Lexer.TokenType.LPAREN) != null) {
					var r2 = this.KeywordList(ref cursor);
					var arguments = this.ValueOrDefault(r2);

					if (this.ParseToken(ref cursor, Lexer.TokenType.RPAREN) != null) {
						var r3 = this.Block(ref cursor);
						if (r3 == null) r3 = this.Root(ref cursor);

						var body = this.ValueOrDefault(r3);
						if (r3 != null)
							r0 = this.ReturnHelper<AST.Func>(sc0, ref cursor, state => new AST.Func(name, arguments, body));
						else
							cursor = sc0;
					}
					else
						cursor = sc0;
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}
		private IResult<AST.KeywordList> KeywordList(ref Cursor cursor) {
			IResult<AST.KeywordList> r0 = null;
			var sc0 = cursor; // StartCursor

			var r1 = this.Keyword(ref cursor);
			var left = this.ValueOrDefault(r1);
			if (r1 != null) {
				IResult<AST.KeywordList> r2 = null;

				var sc1 = cursor;
				if (this.ParseToken(ref cursor, Lexer.TokenType.COMMA) != null) {
					var r4 = this.KeywordList(ref cursor);
					var list = this.ValueOrDefault(r4);

					if (r4 != null) {
						r2 = this.ReturnHelper<AST.KeywordList>(sc1, ref cursor, state => {
							if (r2 != null)
								return new AST.KeywordList(
									r2.Value.Keywords
										.Concat(list.Keywords)
										.ToArray()
								);
							else
								return list;
						});
					}
					else
						cursor = sc1;
				}
				else
					cursor = sc1;

				var right = ValueOrDefault(r2);
				if (r2 != null) {
					r0 = this.ReturnHelper<AST.KeywordList>(sc0, ref cursor, state => new AST.KeywordList(
						new AST.Keyword[] { left }.Concat(right.Keywords).ToArray()
					));
				}
				else
					r0 = this.ReturnHelper<AST.KeywordList>(sc0, ref cursor, state => new AST.KeywordList(new AST.Keyword[] { left }));
			}
			else
				cursor = sc0;

			return r0;
		}
		private IResult<AST.Return> Return(ref Cursor cursor) {
			IResult<AST.Return> r0 = null;
			var sc0 = cursor;

			if (this.ParseToken(ref cursor, Lexer.TokenType.RETURN) != null) {
				var r1 = this.Expression(ref cursor);
				var value = this.ValueOrDefault(r1);

				if (r1 != null)
					r0 = this.ReturnHelper<AST.Return>(sc0, ref cursor, state => new AST.Return(value));
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}

		private IResult<AST.Node> RootCall(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			var sc0 = cursor;
			var r1 = this.Keyword(ref cursor);
			if (r1 != null) {
				var callee = ValueOrDefault(r1);

				var sc1 = cursor;
				var r2 = this.Expression(ref cursor);
				var exp = this.ValueOrDefault(r2);
				if (r2 != null) {
					r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.Call(
						callee,
						exp == null
							? new AST.Node[0]
							: exp.Type() == AST.Type.List
								? (exp as AST.List).Nodes
								: new AST.Node[] { exp }
					));
				}
				else if (sc1.EOF) {
					r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.Call(
						callee,
						new AST.Node[0]
					));
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}

		private IResult<AST.Node> Expression(ref Cursor cursor) => this.Lv15(ref cursor);

		private IResult<AST.Node> Lv15(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			if (r0 == null) r0 = this.List(ref cursor);
			if (r0 == null) r0 = this.Lv14(ref cursor);
			return r0;
		}
		private IResult<AST.List> List(ref Cursor cursor) {
			IResult<AST.List> r0 = null;
			var sc0 = cursor; // StartCursor

			var r1 = this.Lv14(ref cursor);
			var left = this.ValueOrDefault(r1);
			if (r1 != null) {
				IResult<AST.List> r2 = null;

				var sc1 = cursor;
				while (true) {
					var sc2 = cursor;
					if (this.ParseToken(ref cursor, Lexer.TokenType.COMMA) != null) {
						var r3 = this.Lv15(ref cursor);
						var list = this.ValueOrDefault(r3);

						if (r3 != null) {
							r2 = this.ReturnHelper<AST.List>(sc2, ref cursor, state => {
								if (r2 != null) {
									return new AST.List(
										r2.Value.Nodes
											.Concat(
												list.Type() == AST.Type.List
													? (list as AST.List).Nodes
													: new AST.Node[] { list }
											)
											.ToArray()
									);
								}
								else {
									return list.Type() == AST.Type.List
										? list as AST.List
										: new AST.List(new AST.Node[] { list });
								}
							});
						}
						else {
							cursor = sc2;
							break;
						}
					}
					else {
						cursor = sc2;
						break;
					}
				}

				var right = ValueOrDefault(r2);
				if (r2 != null) {
					r0 = this.ReturnHelper<AST.List>(sc0, ref cursor, state => new AST.List(
						(
							left.Type() == AST.Type.List
								? (left as AST.List).Nodes
								: new AST.Node[] { left }
						).Concat(right.Nodes).ToArray()
					));
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}

		private IResult<AST.Node> Lv14(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var sc0 = cursor;

			var r1 = this.Keyword(ref cursor);
			var target = this.ValueOrDefault(r1);
			if (r1 != null) {
				var sc1 = cursor;

				var matchTokens = new Lexer.TokenType[] {
					Lexer.TokenType.ASSIGN,
					Lexer.TokenType.ADDITION_ASSIGN,
					Lexer.TokenType.SUBTRACTION_ASSIGN,
					Lexer.TokenType.MULTIPLICATION_ASSIGN,
					Lexer.TokenType.DIVISION_ASSIGN,
					Lexer.TokenType.REMAINDER_ASSIGN,
					Lexer.TokenType.POWER_ASSIGN,
					Lexer.TokenType.LSHIFT_ASSIGN,
					Lexer.TokenType.RSHIFT_ASSIGN,
					Lexer.TokenType.AND_ASSIGN,
					Lexer.TokenType.XOR_ASSIGN,
					Lexer.TokenType.OR_ASSIGN,
				};
				foreach (var match in matchTokens) {
					if (this.ParseToken(ref cursor, match) != null) {
						var r2 = this.Lv14(ref cursor);
						var value = this.ValueOrDefault(r2);

						if (r2 != null) {
							r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.ASSIGN:
										return new AST.Assign(target, value);
									case Lexer.TokenType.ADDITION_ASSIGN:
										return new AST.AssignAddition(target, value);
									case Lexer.TokenType.SUBTRACTION_ASSIGN:
										return new AST.AssignSubtraction(target, value);
									case Lexer.TokenType.MULTIPLICATION_ASSIGN:
										return new AST.AssignMultiplication(target, value);
									case Lexer.TokenType.DIVISION_ASSIGN:
										return new AST.AssignDivision(target, value);
									case Lexer.TokenType.REMAINDER_ASSIGN:
										return new AST.AssignRemainder(target, value);
									case Lexer.TokenType.POWER_ASSIGN:
										return new AST.AssignPower(target, value);
									case Lexer.TokenType.LSHIFT_ASSIGN:
										return new AST.AssignBitwiseLeftShift(target, value);
									case Lexer.TokenType.RSHIFT_ASSIGN:
										return new AST.AssignBitwiseRightShift(target, value);
									case Lexer.TokenType.AND_ASSIGN:
										return new AST.AssignBitwiseAnd(target, value);
									case Lexer.TokenType.XOR_ASSIGN:
										return new AST.AssignBitwiseXor(target, value);
									case Lexer.TokenType.OR_ASSIGN:
										return new AST.AssignBitwiseOr(target, value);
									default:
										throw new Exception("VNScript ParserError - Invalid token at parsing");
								}
							});
							break;
						}
						else
							cursor = sc1;
					}
					else
						cursor = sc1;
				}
			}

			if (r0 == null) {
				cursor = sc0;
				r0 = this.Lv13(ref cursor);
			}
			return r0;
		}

		private IResult<AST.Node> Lv13(ref Cursor cursor) => this.Lv12(ref cursor); // Ternary conditional

		private IResult<AST.Node> Lv12(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv12", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;
				var sc1 = cursor;

				var r2 = this.Lv12(ref cursor);
				var left = this.ValueOrDefault(r2);
				if (r2 != null && this.ParseToken(ref cursor, Lexer.TokenType.LOGICAL_OR) != null) {
					var r3 = this.Lv11(ref cursor);
					var right = ValueOrDefault(r3);
					if (r3 != null)
						r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => new AST.LogicalOr(left, right));
					else
						cursor = sc1;
				}
				else
					cursor = sc1;

				if (r1 == null)
					r1 = this.Lv11(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv11(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv11", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;
				var sc1 = cursor;

				var r2 = this.Lv11(ref cursor);
				var left = this.ValueOrDefault(r2);
				if (r2 != null && this.ParseToken(ref cursor, Lexer.TokenType.LOGICAL_AND) != null) {
					var r3 = this.Lv10(ref cursor);
					var right = ValueOrDefault(r3);
					if (r3 != null)
						r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => new AST.LogicalAnd(left, right));
					else
						cursor = sc1;
				}
				else
					cursor = sc1;

				if (r1 == null)
					r1 = this.Lv10(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv10(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv10", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;
				var sc1 = cursor;

				var r2 = this.Lv10(ref cursor);
				var left = this.ValueOrDefault(r2);
				if (r2 != null && this.ParseToken(ref cursor, Lexer.TokenType.OR) != null) {
					var r3 = this.Lv9(ref cursor);
					var right = ValueOrDefault(r3);
					if (r3 != null)
						r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => new AST.BitwiseOr(left, right));
					else
						cursor = sc1;
				}
				else
					cursor = sc1;

				if (r1 == null)
					r1 = this.Lv9(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv9(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv9", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;
				var sc1 = cursor;

				var r2 = this.Lv9(ref cursor);
				var left = this.ValueOrDefault(r2);
				if (r2 != null && this.ParseToken(ref cursor, Lexer.TokenType.XOR) != null) {
					var r3 = this.Lv8(ref cursor);
					var right = ValueOrDefault(r3);
					if (r3 != null)
						r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => new AST.BitwiseXor(left, right));
					else
						cursor = sc1;
				}
				else
					cursor = sc1;

				if (r1 == null)
					r1 = this.Lv8(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv8(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv8", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;
				var sc1 = cursor;

				var r2 = this.Lv8(ref cursor);
				var left = this.ValueOrDefault(r2);
				if (r2 != null && this.ParseToken(ref cursor, Lexer.TokenType.AND) != null) {
					var r3 = this.Lv7(ref cursor);
					var right = ValueOrDefault(r3);
					if (r3 != null)
						r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => new AST.BitwiseAnd(left, right));
					else
						cursor = sc1;
				}
				else
					cursor = sc1;

				if (r1 == null)
					r1 = this.Lv7(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv7(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv7", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var matchTokens = new Lexer.TokenType[] {
				Lexer.TokenType.EQUAL,
				Lexer.TokenType.NOT_EQUAL,
			};

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;

				foreach (var match in matchTokens) {
					if (r1 != null) break;
					var sc1 = cursor;

					var r2 = this.Lv7(ref cursor);
					var left = this.ValueOrDefault(r2);
					if (r2 != null && this.ParseToken(ref cursor, match) != null) {
						var r3 = this.Lv6(ref cursor);
						var right = ValueOrDefault(r3);
						if (r3 != null)
							r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.EQUAL:
										return new AST.Equal(left, right);
									case Lexer.TokenType.NOT_EQUAL:
										return new AST.NotEqual(left, right);
									default:
										throw new Exception("VNScript ParserError - Invalid token at parsing");
								}
							});
						else
							cursor = sc1;
					}
					else
						cursor = sc1;
				}
				if (r1 == null)
					r1 = this.Lv6(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv6(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv6", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var matchTokens = new Lexer.TokenType[] {
				Lexer.TokenType.LESSER,
				Lexer.TokenType.LESSER_EQUAL,
				Lexer.TokenType.GREATER,
				Lexer.TokenType.GREATER_EQUAL,
			};

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;

				foreach (var match in matchTokens) {
					if (r1 != null) break;
					var sc1 = cursor;

					var r2 = this.Lv6(ref cursor);
					var left = this.ValueOrDefault(r2);
					if (r2 != null && this.ParseToken(ref cursor, match) != null) {
						var r3 = this.Lv5(ref cursor);
						var right = ValueOrDefault(r3);
						if (r3 != null)
							r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.LESSER:
										return new AST.Lesser(left, right);
									case Lexer.TokenType.LESSER_EQUAL:
										return new AST.LesserEqual(left, right);
									case Lexer.TokenType.GREATER:
										return new AST.Greater(left, right);
									case Lexer.TokenType.GREATER_EQUAL:
										return new AST.GreaterEqual(left, right);
									default:
										throw new Exception("VNScript ParserError - Invalid token at parsing");
								}
							});
						else
							cursor = sc1;
					}
					else
						cursor = sc1;
				}
				if (r1 == null)
					r1 = this.Lv5(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv5(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv5", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var matchTokens = new Lexer.TokenType[] {
				Lexer.TokenType.LSHIFT,
				Lexer.TokenType.RSHIFT,
			};

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;

				foreach (var match in matchTokens) {
					if (r1 != null) break;
					var sc1 = cursor;

					var r2 = this.Lv5(ref cursor);
					var left = this.ValueOrDefault(r2);
					if (r2 != null && this.ParseToken(ref cursor, match) != null) {
						var r3 = this.Lv4(ref cursor);
						var right = ValueOrDefault(r3);
						if (r3 != null)
							r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.LSHIFT:
										return new AST.BitwiseLeftShift(left, right);
									case Lexer.TokenType.RSHIFT:
										return new AST.BitwiseRightShift(left, right);
									default:
										throw new Exception("VNScript ParserError - Invalid token at parsing");
								}
							});
						else
							cursor = sc1;
					}
					else
						cursor = sc1;
				}
				if (r1 == null)
					r1 = this.Lv4(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv4(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv4", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var matchTokens = new Lexer.TokenType[] {
				Lexer.TokenType.PLUS,
				Lexer.TokenType.MINUS,
				Lexer.TokenType.DOT2,
			};

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;

				foreach (var match in matchTokens) {
					if (r1 != null) break;
					var sc1 = cursor;

					var r2 = this.Lv4(ref cursor);
					var left = this.ValueOrDefault(r2);
					if (r2 != null && this.ParseToken(ref cursor, match) != null) {
						var r3 = this.Lv3(ref cursor);
						var right = ValueOrDefault(r3);
						if (r3 != null)
							r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.PLUS:
										return new AST.Addition(left, right);
									case Lexer.TokenType.MINUS:
										return new AST.Subtraction(left, right);
									case Lexer.TokenType.DOT2:
										return new AST.Concatenate(left, right);
									default:
										throw new Exception("VNScript ParserError - Invalid token at parsing");
								}
							});
						else
							cursor = sc1;
					}
					else
						cursor = sc1;
				}
				if (r1 == null)
					r1 = this.Lv3(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv3(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var storageKey = new CacheKey("Lv3", cursor.StateKey, cursor.Offset);

			if (this.storage.ContainsKey(storageKey)) {
				r0 = this.storage[storageKey];
				if (r0 != null)
					cursor = r0.EndCursor;
				return r0;
			}
			this.storage[storageKey] = null;

			var matchTokens = new Lexer.TokenType[] {
				Lexer.TokenType.MULTIPLICATION,
				Lexer.TokenType.DIVISION,
				Lexer.TokenType.REMAINDER,
				Lexer.TokenType.POWER,
			};

			var sc0 = cursor; // StartCursor
			while (true) {
				IResult<AST.Node> r1 = null;

				foreach (var match in matchTokens) {
					if (r1 != null) break;
					var sc1 = cursor;

					var r2 = this.Lv3(ref cursor);
					var left = this.ValueOrDefault(r2);
					if (r2 != null && this.ParseToken(ref cursor, match) != null) {
						var r3 = this.Lv2(ref cursor);
						var right = ValueOrDefault(r3);
						if (r3 != null)
							r1 = this.ReturnHelper<AST.Node>(sc1, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.MULTIPLICATION:
										return new AST.Multiplication(left, right);
									case Lexer.TokenType.DIVISION:
										return new AST.Division(left, right);
									case Lexer.TokenType.REMAINDER:
										return new AST.Remainder(left, right);
									case Lexer.TokenType.POWER:
										return new AST.Power(left, right);
									default:
										throw new Exception("VNScript ParserError - Invalid token at parsing");
								}
							});
						else
							cursor = sc1;
					}
					else
						cursor = sc1;
				}
				if (r1 == null)
					r1 = this.Lv2(ref cursor);

				if (r1 == null || (r0 != null && r0.EndCursor.Offset >= r1.EndCursor.Offset))
					break;

				this.storage[storageKey] = r0 = r1;
				cursor = sc0;
			}

			if (r0 != null) cursor = r0.EndCursor;
			return r0;
		}

		private IResult<AST.Node> Lv2(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var sc0 = cursor;

			if (r0 == null) { // prefix ++ --
				var matchTokens = new Lexer.TokenType[][] {
					new Lexer.TokenType[] { Lexer.TokenType.PLUS, Lexer.TokenType.PLUS },
					new Lexer.TokenType[] { Lexer.TokenType.MINUS, Lexer.TokenType.MINUS },
				};

				foreach (var match in matchTokens) {
					if (this.ParseToken(ref cursor, match) != null) {
						var r1 = this.Keyword(ref cursor);
						var target = this.ValueOrDefault(r1);

						if (r1 != null) {
							r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state =>
								match[0] == Lexer.TokenType.PLUS
									? (AST.Node)new AST.Increment(target, true)
									: (AST.Node)new AST.Decrement(target, true)
							);
							break;
						}
						else
							cursor = sc0;
					}
					else
						cursor = sc0;
				}
			}
			if (r0 == null) { // Unary
				var matchTokens = new Lexer.TokenType[] {
					Lexer.TokenType.PLUS,
					Lexer.TokenType.MINUS,
					Lexer.TokenType.LOGICAL_NOT,
					Lexer.TokenType.BITWISE_NOT,
				};

				foreach (var match in matchTokens) {
					if (this.ParseToken(ref cursor, match) != null) {
						var targetStart = cursor;
						var r1 = this.Lv2(ref cursor);

						var targetEnd = cursor;
						var target = ValueOrDefault(r1);
						if (r1 != null) {
							r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => {
								switch (match) {
									case Lexer.TokenType.PLUS:
										return new AST.UnaryPositive(target);
									case Lexer.TokenType.MINUS:
										return new AST.UnaryNegative(target);
									case Lexer.TokenType.LOGICAL_NOT:
										return new AST.LogicalNot(target);
									case Lexer.TokenType.BITWISE_NOT:
										return new AST.BitwiseNot(target);
								}
								return null;
							});
							break;
						}
						else
							cursor = sc0;
					}
					else
						cursor = sc0;
				}
			}
			if (r0 == null) r0 = this.Lv1(ref cursor);

			return r0;
		}

		private IResult<AST.Node> Lv1(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var sc0 = cursor;

			if (r0 == null) r0 = this.Call(ref cursor);
			if (r0 == null) { // postfix ++ --
				var r1 = this.Keyword(ref cursor);
				var target = this.ValueOrDefault(r1);

				if (r1 != null) {
					var sc1 = cursor;
					var matchTokens = new Lexer.TokenType[][] {
						new Lexer.TokenType[] { Lexer.TokenType.PLUS, Lexer.TokenType.PLUS },
						new Lexer.TokenType[] { Lexer.TokenType.MINUS, Lexer.TokenType.MINUS },
					};
					foreach (var match in matchTokens) {
						if (this.ParseToken(ref cursor, match) != null) {
							r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state =>
								match[0] == Lexer.TokenType.PLUS
									? (AST.Node)new AST.Increment(target)
									: (AST.Node)new AST.Decrement(target)
							);
							break;
						}
						else
							cursor = sc1;
					}

					if (r0 == null)
						cursor = sc0;
				}
				else
					cursor = sc0;
			}
			if (r0 == null) r0 = this.Lv0(ref cursor);

			return r0;
		}

		private IResult<AST.Node> Lv0(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;
			var sc0 = cursor;

			if (r0 == null && this.ParseToken(ref cursor, Lexer.TokenType.LPAREN) != null) {
				var expStart = cursor;
				var r1 = this.Expression(ref cursor);

				var expEnd = cursor;
				var exp = ValueOrDefault(r1);
				if (r1 != null && this.ParseToken(ref cursor, Lexer.TokenType.RPAREN) != null)
					r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => exp);
				else
					cursor = sc0;
			}

			if (r0 == null) r0 = this.Literal(ref cursor);
			if (r0 == null) r0 = this.Keyword(ref cursor);

			return r0;
		}

		private IResult<AST.Node> Call(ref Cursor cursor) {
			IResult<AST.Node> r0 = null;

			var sc0 = cursor;
			var r1 = this.Keyword(ref cursor);
			if (r1 != null) {
				var callee = this.ValueOrDefault(r1);

				if (this.ParseToken(ref cursor, Lexer.TokenType.LPAREN) != null) {
					var r2 = this.Expression(ref cursor);
					var exp = ValueOrDefault(r2);

					if (this.ParseToken(ref cursor, Lexer.TokenType.RPAREN) != null)
						r0 = this.ReturnHelper<AST.Node>(sc0, ref cursor, state => new AST.Call(
							callee,
							exp == null
								? new AST.Node[0]
								: exp.Type() == AST.Type.List
									? (exp as AST.List).Nodes
									: new AST.Node[] { exp }
							)
						);
					else
						cursor = sc0;
				}
				else
					cursor = sc0;
			}
			else
				cursor = sc0;

			return r0;
		}
	}
}
