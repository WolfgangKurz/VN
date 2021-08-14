using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Threading.Tasks;

using VNScript.Compiler;
using VNScript.Compiler.VNSP;

namespace VNScript.VM {
	public class VMState : StreamHelper {
		public CodeChunk Chunk { get; }

		public string Name => this.Chunk?.CodeName;
		public byte[] Body => this.Chunk?.CodeBody;

		public bool EOS => this.stream.Position >= this.Body.Length;

		public VMState(CodeChunk Chunk) {
			this.Chunk = Chunk;
			this.stream = new MemoryStream(Chunk.CodeBody);
		}

		public void Next(ReadOnlyStack<VMValue> Stack, VMStorage Storage, ReadOnlyStack<int> BlockStack, IReadOnlyDictionary<string, VM.VMFunc> Funcs) {
			var op = (ByteCodeType)this.Byte();

			switch (op) {
				case ByteCodeType.None:
					break;

				case ByteCodeType.EnterBlock:
					BlockStack.Push(Stack.Count);
					Storage.Up();
					break;
				case ByteCodeType.ExitBlock: {
						var count = BlockStack.Pop();
						while (Stack.Count > count) Stack.Pop();
						Storage.Down();
					}
					break;

				case ByteCodeType.Test: {
						var test = Stack.Pop();
						var address = Stack.Pop();

						if (!test.AsBoolean(Storage))
							this.Seek(address.AsInteger(Storage));
					}
					break;

				case ByteCodeType.Jump: {
						var address = Stack.Pop();
						this.Seek(address.AsInteger(Storage));
					}
					break;

				case ByteCodeType.Push: {
						var type = (VMValueType)this.Byte();
						var buffer = this.Read(this.Byte());
						VMValue data;

						switch(type) {
							case VMValueType.Null:
								if (buffer.Length != 0) throw new Exception("VNScript VMError - Invalid Data Length for Null");
								data = VMValue.Null();
								break;
							case VMValueType.Number:
								if (buffer.Length != 8) throw new Exception("VNScript VMError - Invalid Data Length for Number");
								data = VMValue.Number(BitConverter.ToDouble(buffer, 0));
								break;
							case VMValueType.Boolean:
								if (buffer.Length != 1) throw new Exception("VNScript VMError - Invalid Data Length for Boolean");
								data = VMValue.Boolean(buffer[0] != 0);
								break;
							case VMValueType.String:
								data = VMValue.String(Encoding.UTF8.GetString(buffer));
								break;
							case VMValueType.Keyword:
								data = VMValue.Keyword(Encoding.UTF8.GetString(buffer));
								break;
							case VMValueType.Integer:
								if (buffer.Length != 4) throw new Exception("VNScript VMError - Invalid Data Length for Integer");
								data = VMValue.Integer(BitConverter.ToInt32(buffer, 0));
								break;
							default:
								throw new Exception("VNScript VMError - Unexpected Value Type");
						}
						Stack.Push(data);
					}
					break;

				case ByteCodeType.Pop:
					Stack.Pop();
					break;

				case ByteCodeType.Call: {
						var argc = this.Byte();
						var _callee = Stack.Pop();
						if (_callee.Type != VMValueType.Keyword)
							throw new Exception("VNScript VMError - Callee should be Keyword");

						var callee = _callee.AsString();
						var arguments = new VMValue[argc]
							.Select(_ => Stack.Pop())
							.Reverse()
							.ToArray();

						if (!Funcs.ContainsKey(callee))
							throw new Exception($"VNScript VMError - Function '{callee}' not defined or registered");

						var result = Funcs[callee].Invoke(arguments, Storage);
						Stack.Push(result);
					}
					break;

				case ByteCodeType.Assign: {
						var _target = Stack.Pop();
						if(_target.Type != VMValueType.Keyword)
							throw new Exception("VNScript VMError - Assign Target should be Keyword");

						var target = _target.AsString();
						var value = Stack.Pop();
						if (value.Type == VMValueType.Keyword) {
							var name = value.AsString();
							if (Storage.Has(name))
								value = Storage.Get(name).Value;
							else
								value = VMValue.Null();
						}

						if (target[0] == '$')
							Storage.Set(-1, target, value);
						else if (target[0] == '@')
							Storage.Set(target, value);
						else
							throw new Exception("VNScript VMError - Assign Target should be Global or Scoped");
					}
					break;

				case ByteCodeType.Evaluate: {
						var value = Stack.Pop();
						if (value.Type != VMValueType.Keyword)
							throw new Exception("VNScript VMError - Evaluate require Keyword");

						var name = value.AsString();
						Stack.Push(
							Storage.Has(name)
								? Storage.Get(name).Value
								: VMValue.Null()
						);
					}
					break;

				case ByteCodeType.LogicalOr: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsBoolean(Storage) || right.AsBoolean(Storage)));
					}
					break;
				case ByteCodeType.LogicalAnd: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsBoolean(Storage) && right.AsBoolean(Storage)));
					}
					break;

				case ByteCodeType.BitwiseOr: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsInteger(Storage) | right.AsInteger(Storage)));
					}
					break;
				case ByteCodeType.BitwiseXor: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsInteger(Storage) ^ right.AsInteger(Storage)));
					}
					break;
				case ByteCodeType.BitwiseAnd: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsInteger(Storage) & right.AsInteger(Storage)));
					}
					break;

				case ByteCodeType.Equal: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsString(Storage) == right.AsString(Storage)));
					}
					break;
				case ByteCodeType.NotEqual: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsString(Storage) != right.AsString(Storage)));
					}
					break;
				case ByteCodeType.Lesser: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsNumber(Storage) < right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.LesserEqual: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsNumber(Storage) <= right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.Greater: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsNumber(Storage) > right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.GreaterEqual: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, left.AsNumber(Storage) >= right.AsNumber(Storage)));
					}
					break;

				case ByteCodeType.BitwiseLeftShift: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsInteger(Storage) << right.AsInteger(Storage)));
					}
					break;
				case ByteCodeType.BitwiseRightShift: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsInteger(Storage) >> right.AsInteger(Storage)));
					}
					break;

				case ByteCodeType.Addition: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsNumber(Storage) + right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.Subtraction: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsNumber(Storage) - right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.Concatenate: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.String, left.AsString(Storage) + right.AsString(Storage)));
					}
					break;
				case ByteCodeType.Multiplication: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsNumber(Storage) * right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.Division: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsNumber(Storage) / right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.Remainder: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, left.AsNumber(Storage) % right.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.Power: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, Math.Pow(left.AsNumber(Storage), right.AsNumber(Storage))));
					}
					break;

				case ByteCodeType.UnaryPositive: {
						var target = Stack.Pop();
						Stack.Push(target);
					}
					break;
				case ByteCodeType.UnaryNegative: {
						var target = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, -target.AsNumber(Storage)));
					}
					break;
				case ByteCodeType.LogicalNot: {
						var target = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Boolean, !target.AsBoolean(Storage)));
					}
					break;
				case ByteCodeType.BitwiseNot: {
						var target = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, ~target.AsInteger(Storage)));
					}
					break;

				default:
					throw new NotImplementedException("VNScript VMError - Invalid Operation");
			}
		}
	}
}
