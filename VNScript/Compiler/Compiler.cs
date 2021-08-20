using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using VNScript.Compiler.VNSP;

namespace VNScript.Compiler {
	public class Compiler {
		private static AST.Literal Number1Node { get; } = new AST.Literal(new Lexer.Token(Lexer.TokenType.NUMBER, "1", 0, 1));
		private static Regex TrueRegex { get; } = new Regex("^true$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

		public static byte[] Compile(AST.Node node) {
			var instance = new Compiler();
			instance.Travel(node, 0);
			return instance.ToArray();
		}

		#region Pack
		public static VNSPack Pack(KeyValuePair<string, byte[]> compiled) =>
			Compiler.Pack(new KeyValuePair<string, byte[]>[] { compiled }, null);

		public static VNSPack Pack(KeyValuePair<string, byte[]> compiled, KeyValuePair<string, byte[]> meta) =>
			Compiler.Pack(new KeyValuePair<string, byte[]>[] { compiled }, new KeyValuePair<string, byte[]>[] { meta });

		public static VNSPack Pack(KeyValuePair<string, byte[]> compiled, KeyValuePair<string, byte[]>[] metas) =>
			Compiler.Pack(new KeyValuePair<string, byte[]>[] { compiled }, metas);

		public static VNSPack Pack(KeyValuePair<string, byte[]>[] compiled) =>
			Compiler.Pack(compiled, null);

		public static VNSPack Pack(KeyValuePair<string, byte[]>[] compiled, KeyValuePair<string, byte[]> meta) =>
			Compiler.Pack(compiled, new KeyValuePair<string, byte[]>[] { meta });

		public static VNSPack Pack(KeyValuePair<string, byte[]>[] compiled, KeyValuePair<string, byte[]>[] metas) {
			using var ms = new MemoryStream();
			ms.Write(new byte[] { 0x56, 0x4E, 0x53, 0x50 }, 0, 4); // VNSP
			ms.Write(BitConverter.GetBytes(100), 0, 4); // 01 . 00 version

			ms.Write(BitConverter.GetBytes(compiled.Length + (metas?.Length ?? 0)), 0, 4); // compiled + meta chunks

			if (metas != null) {
				foreach (var meta in metas) {
					var key = Encoding.UTF8.GetBytes(meta.Key.ToUpper());
					if (key.Length < 4)
						key = key.Concat(new byte[4 - key.Length]).ToArray();
					else if (key.Length > 4)
						key = key.Take(4).ToArray();

					ms.Write(key, 0, 4); // CODE

					ms.Write(BitConverter.GetBytes(meta.Value.Length), 0, 4); // body length
					ms.Write(meta.Value, 0, meta.Value.Length);
				}
			}

			foreach (var body in compiled) {
				ms.Write(new byte[] { 0x43, 0x4F, 0x44, 0x45 }, 0, 4); // CODE

				var name = Encoding.UTF8.GetBytes(body.Key);

				// ChunkSize = Entire Chunk Size except ChunkName and ChunkSize
				// ChunkSize = ChunkName + ChunkBody - 8
				ms.Write(BitConverter.GetBytes(4 + name.Length + 4 + body.Value.Length), 0, 4);

				ms.Write(BitConverter.GetBytes(name.Length), 0, 4); // name length
				ms.Write(name, 0, name.Length); // name

				ms.Write(BitConverter.GetBytes(body.Value.Length), 0, 4); // body length
				ms.Write(body.Value, 0, body.Value.Length);
			}

			ms.WriteByte(0); // Terminator
			return new VNSPack(ms.ToArray());
		}
		#endregion

		private Stream stream { get; }

		private Compiler() {
			this.stream = new MemoryStream();
		}

		public byte[] ToArray() => (this.stream as MemoryStream).ToArray();

		#region Write
		private Compiler Write(params byte[] data) {
			this.stream.Write(data, 0, data.Length);
			return this;
		}
		private Compiler Write(params byte[][] data) {
			foreach (var chunk in data)
				this.stream.Write(chunk, 0, chunk.Length);
			return this;
		}
		private Compiler Write(byte b1, params byte[][] data) {
			this.stream.WriteByte(b1);
			foreach (var chunk in data)
				this.stream.Write(chunk, 0, chunk.Length);
			return this;
		}
		private Compiler WriteLengthed1(byte[] data) => this.Write((byte)data.Length).Write(data);
		#endregion

		private void Travel(AST.Node node, int depth) {
			switch (node.Type()) {
				#region Value, Program, Block, List
				case AST.Type.Literal:
				case AST.Type.Keyword:
					if (depth == 0) break;

					this.Write((byte)ByteCodeType.Push);
					if (node.Type() == AST.Type.Literal) {
						var literal = (node as AST.Literal).Value;
						switch (literal.type) {
							case Lexer.TokenType.NULL:
								this.Write(0, 0);
								break;
							case Lexer.TokenType.NUMBER:
								this.Write(1);
								this.WriteLengthed1(BitConverter.GetBytes(double.Parse(literal.value)));
								break;
							case Lexer.TokenType.BOOLEAN:
								this.Write(2, 1, (byte)(Compiler.TrueRegex.IsMatch(literal.value) ? 1 : 0));
								break;
							case Lexer.TokenType.STRING:
								this.Write(3);
								this.WriteLengthed1(Encoding.UTF8.GetBytes(literal.value));
								break;
							default:
								throw new Exception("VNScript CompileError - Invalid Node");
						}
					}
					else {
						this.Write(4);
						this.WriteLengthed1(Encoding.UTF8.GetBytes((node as AST.Keyword).Value.value));
					}
					break;

				case AST.Type.Program:
					foreach (var n in (node as AST.Program).Body)
						this.Travel(n, 0); // Block 및 Program은 Depth 초기화
					break;

				case AST.Type.Block:
					this.Write((byte)ByteCodeType.EnterBlock);

					foreach (var n in (node as AST.Block).Body)
						this.Travel(n, 0); // Block 및 Program은 Depth 초기화

					this.Write((byte)ByteCodeType.ExitBlock);
					break;

				case AST.Type.List:
					foreach (var n in (node as AST.List).Nodes)
						this.Travel(n, depth);
					break;
				#endregion

				#region Call, Func, Return
				case AST.Type.Call: {
						var n = node as AST.Call;

						if (n.Arguments != null) {
							foreach (var arg in n.Arguments)
								this.Travel(arg, depth + 1);
						}

						this.Travel(n.Callee, depth + 1);
						if (depth > 0)
							this.Write((byte)ByteCodeType.Call, 1, (byte)(n.Arguments?.Length ?? 0));
						else
							this.Write((byte)ByteCodeType.Call, 0, (byte)(n.Arguments?.Length ?? 0));
					}
					break;

				case AST.Type.Func: {
						var n = node as AST.Func;

						var subCompiler = new Compiler();
						subCompiler.Write((byte)ByteCodeType.EnterBlock);

						foreach (var arg in n.Arguments.Keywords.Reverse()) {
							var argName = arg.Value.value;
							if (argName[0] != '@')
								throw new Exception("VNScript CompileError - Argument for Func should be local scoped.");

							subCompiler.Travel(arg, depth + 1);
							subCompiler.Write((byte)ByteCodeType.Assign); // 인자명 변수에 대입
						}
						subCompiler.Travel(n.Body, 0);

						subCompiler.Write((byte)ByteCodeType.Push, 0, 0); // null Push
						subCompiler.Write((byte)ByteCodeType.EndOfState); // End of state
						subCompiler.Write((byte)ByteCodeType.ExitBlock);
						var compiled = subCompiler.ToArray();

						var name = n.Name.Value.value;
						this.Write((byte)ByteCodeType.Define);
						this.WriteLengthed1(Encoding.UTF8.GetBytes(name));

						var lengthCursor = this.stream.Position;
						this.Write(BitConverter.GetBytes((int)compiled.Length));

						this.Write(compiled);
					}
					break;
				case AST.Type.Return: {
						var n = node as AST.Return;

						this.Travel(n.Value, depth + 1); // 값을 Push하고
						this.Write((byte)ByteCodeType.EndOfState); // 현재 State를 종료
					}
					break;
				#endregion

				#region If, While, For
				case AST.Type.If: {
						var n = node as AST.If;

						this.Write((byte)ByteCodeType.Push, 5);

						var addressCursor = this.stream.Position;
						this.WriteLengthed1(BitConverter.GetBytes((int)0)); // Jump to

						this.Travel(n.Condition, depth + 1);
						this.Write((byte)ByteCodeType.Test);

						this.Travel(n.Body, 0);

						var currentCursor = this.stream.Position;
						this.stream.Seek(addressCursor, SeekOrigin.Begin);
						this.WriteLengthed1(BitConverter.GetBytes((int)currentCursor));
						this.stream.Seek(currentCursor, SeekOrigin.Begin);
					}
					break;

				case AST.Type.While: {
						var n = node as AST.While;

						var startCursor = this.stream.Position;
						this.Write((byte)ByteCodeType.Push, 5);

						var addressCursor = this.stream.Position;
						this.WriteLengthed1(BitConverter.GetBytes((int)0)); // Jump to

						this.Travel(n.Condition, depth + 1);
						this.Write((byte)ByteCodeType.Test);

						this.Travel(n.Body, 0);

						this.Write((byte)ByteCodeType.Push, 5);
						this.WriteLengthed1(BitConverter.GetBytes((int)startCursor)); // Repeat Jump
						this.Write((byte)ByteCodeType.Jump);

						var currentCursor = this.stream.Position;
						this.stream.Seek(addressCursor, SeekOrigin.Begin);
						this.WriteLengthed1(BitConverter.GetBytes((int)currentCursor)); // JumpAddress
						this.stream.Seek(currentCursor, SeekOrigin.Begin);
					}
					break;

				case AST.Type.For: {
						var n = node as AST.For;

						this.Travel(n.Initialize, 0);

						var startCursor = this.stream.Position;
						this.Write((byte)ByteCodeType.Push, 5);

						var addressCursor = this.stream.Position;
						this.WriteLengthed1(BitConverter.GetBytes((int)0)); // Jump to

						this.Travel(n.Condition, depth + 1);
						this.Write((byte)ByteCodeType.Test);

						this.Travel(n.Body, 0);
						this.Travel(n.Loop, 0);

						this.Write((byte)ByteCodeType.Push, 5);
						this.WriteLengthed1(BitConverter.GetBytes((int)startCursor)); // Repeat Jump
						this.Write((byte)ByteCodeType.Jump);

						var currentCursor = this.stream.Position;
						this.stream.Seek(addressCursor, SeekOrigin.Begin);
						this.WriteLengthed1(BitConverter.GetBytes((int)currentCursor)); // JumpAddress
						this.stream.Seek(currentCursor, SeekOrigin.Begin);
					}
					break;
				#endregion

				#region Assign
				case AST.Type.Assign: {
						var n = node as AST.Assign;
						this.Travel(n.Value, depth + 1);
						this.Travel(n.Target, depth + 1);
						this.Write((byte)ByteCodeType.Assign);
						if (depth > 0) this.Travel(n.Target, depth + 1);
					}
					break;
				case AST.Type.AssignAddition: { // 축약 연산자이므로 같은 깊이
						var n = node as AST.AssignAddition;
						this.Travel(new AST.Assign(n.Target, new AST.Addition(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignSubtraction: {
						var n = node as AST.AssignSubtraction;
						this.Travel(new AST.Assign(n.Target, new AST.Subtraction(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignMultiplication: {
						var n = node as AST.AssignMultiplication;
						this.Travel(new AST.Assign(n.Target, new AST.Multiplication(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignDivision: {
						var n = node as AST.AssignDivision;
						this.Travel(new AST.Assign(n.Target, new AST.Division(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignRemainder: {
						var n = node as AST.AssignRemainder;
						this.Travel(new AST.Assign(n.Target, new AST.Remainder(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignPower: {
						var n = node as AST.AssignPower;
						this.Travel(new AST.Assign(n.Target, new AST.Power(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignBitwiseLeftShift: {
						var n = node as AST.AssignBitwiseLeftShift;
						this.Travel(new AST.Assign(n.Target, new AST.BitwiseLeftShift(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignBitwiseRightShift: {
						var n = node as AST.AssignBitwiseRightShift;
						this.Travel(new AST.Assign(n.Target, new AST.BitwiseRightShift(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignBitwiseAnd: {
						var n = node as AST.AssignBitwiseAnd;
						this.Travel(new AST.Assign(n.Target, new AST.BitwiseAnd(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignBitwiseXor: {
						var n = node as AST.AssignBitwiseXor;
						this.Travel(new AST.Assign(n.Target, new AST.BitwiseXor(n.Target, n.Value)), depth);
					}
					break;
				case AST.Type.AssignBitwiseOr: {
						var n = node as AST.AssignBitwiseOr;
						this.Travel(new AST.Assign(n.Target, new AST.BitwiseOr(n.Target, n.Value)), depth);
					}
					break;
				#endregion

				#region Logical/Bitwise
				case AST.Type.LogicalOr: {
						var n = node as AST.LogicalOr;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.LogicalOr);
					}
					break;
				case AST.Type.LogicalAnd: {
						var n = node as AST.LogicalAnd;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.LogicalAnd);
					}
					break;
				case AST.Type.BitwiseOr: {
						var n = node as AST.BitwiseOr;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.BitwiseOr);
					}
					break;
				case AST.Type.BitwiseXor: {
						var n = node as AST.BitwiseXor;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.BitwiseXor);
					}
					break;
				case AST.Type.BitwiseAnd: {
						var n = node as AST.BitwiseAnd;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.BitwiseAnd);
					}
					break;
				#endregion

				#region Compare
				case AST.Type.Equal: {
						var n = node as AST.Equal;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Equal);
					}
					break;
				case AST.Type.NotEqual: {
						var n = node as AST.NotEqual;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.NotEqual);
					}
					break;
				case AST.Type.Lesser: {
						var n = node as AST.Lesser;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Lesser);
					}
					break;
				case AST.Type.LesserEqual: {
						var n = node as AST.LesserEqual;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.LesserEqual);
					}
					break;
				case AST.Type.Greater: {
						var n = node as AST.Greater;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Greater);
					}
					break;
				case AST.Type.GreaterEqual: {
						var n = node as AST.GreaterEqual;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.GreaterEqual);
					}
					break;
				#endregion

				#region Bitshift
				case AST.Type.BitwiseLeftShift: {
						var n = node as AST.BitwiseLeftShift;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.BitwiseLeftShift);
					}
					break;
				case AST.Type.BitwiseRightShift: {
						var n = node as AST.BitwiseRightShift;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.BitwiseRightShift);
					}
					break;
				#endregion

				#region Mathmatics
				case AST.Type.Addition: {
						var n = node as AST.Addition;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Addition);
					}
					break;
				case AST.Type.Subtraction: {
						var n = node as AST.Subtraction;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Subtraction);
					}
					break;
				case AST.Type.Multiplication: {
						var n = node as AST.Multiplication;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Multiplication);
					}
					break;
				case AST.Type.Division: {
						var n = node as AST.Division;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Division);
					}
					break;
				case AST.Type.Remainder: {
						var n = node as AST.Remainder;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Remainder);
					}
					break;
				case AST.Type.Power: {
						var n = node as AST.Power;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Power);
					}
					break;
				#endregion

				case AST.Type.Concatenate: {
						var n = node as AST.Concatenate;
						this.Travel(n.Right, depth + 1);
						this.Travel(n.Left, depth + 1);
						this.Write((byte)ByteCodeType.Concatenate);
					}
					break;

				#region Unary
				case AST.Type.Increment: {
						var n = node as AST.Increment;
						if (n.PrefixMode) { // ++target
							this.Travel(
								new AST.Assign( // target = target + 1
									n.Target,
									new AST.Addition(n.Target, Compiler.Number1Node)
								),
								0 // Unary Increment/Decrement는 stack에 push하지 않음
							);
							if (depth > 0) {
								this.Travel(n.Target, depth + 1);
								this.Write((byte)ByteCodeType.Evaluate);
							}
						}
						else { // target++
							if (depth > 0) {
								this.Travel(n.Target, depth + 1);
								this.Write((byte)ByteCodeType.Evaluate);
							}
							this.Travel(
								new AST.Assign( // target = target + 1
									n.Target,
									new AST.Addition(n.Target, Compiler.Number1Node)
								),
								0 // Unary Increment/Decrement는 stack에 push하지 않음
							);
						}
					}
					break;
				case AST.Type.Decrement: {
						var n = node as AST.Decrement;
						if (n.PrefixMode) { // --target
							this.Travel(
								new AST.Assign( // target = target - 1
									n.Target,
									new AST.Subtraction(n.Target, Compiler.Number1Node)
								),
								0 // Unary Increment/Decrement는 stack에 push하지 않음
							);
							this.Travel(n.Target, depth + 1);
						}
						else { // target--
							this.Travel(n.Target, depth + 1);
							this.Write((byte)ByteCodeType.Evaluate);
							this.Travel(
								new AST.Assign( // target = target - 1
									n.Target,
									new AST.Subtraction(n.Target, Compiler.Number1Node)
								),
								0 // Unary Increment/Decrement는 stack에 push하지 않음
							);
						}
					}
					break;
				case AST.Type.UnaryPositive: {
						var n = node as AST.UnaryPositive;
						this.Travel(n.Target, depth + 1);
						this.Write((byte)ByteCodeType.UnaryPositive);
					}
					break;
				case AST.Type.UnaryNegative: {
						var n = node as AST.UnaryNegative;
						this.Travel(n.Target, depth + 1);
						this.Write((byte)ByteCodeType.UnaryNegative);
					}
					break;
				case AST.Type.LogicalNot: {
						var n = node as AST.LogicalNot;
						this.Travel(n.Target, depth + 1);
						this.Write((byte)ByteCodeType.LogicalNot);
					}
					break;
				case AST.Type.BitwiseNot: {
						var n = node as AST.BitwiseNot;
						this.Travel(n.Target, depth + 1);
						this.Write((byte)ByteCodeType.BitwiseNot);
					}
					break;
					#endregion
			}
		}
	}
}
