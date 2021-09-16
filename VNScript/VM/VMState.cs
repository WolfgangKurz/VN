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
		public Chunk Chunk { get; }
		public int StorageLevel { get; }

		public string Name { get; }
		public byte[] Body { get; }

		public bool EOS => this.stream.Position >= this.Body.Length;

		public bool Ended { get; private set; }

		public VMState(CodeChunk Chunk, int StorageLevel) {
			this.Chunk = Chunk;

			this.Name = Chunk.CodeName;
			this.Body = Chunk.CodeBody;
			this.stream = new MemoryStream(this.Body);

			this.StorageLevel = StorageLevel;
		}
		public VMState(byte[] body, int StorageLevel, string Name = "") {
			this.Chunk = null;

			this.Name = Name + "#RuntimeChunk";
			this.Body = body;
			this.stream = new MemoryStream(this.Body);

			this.StorageLevel = StorageLevel;
		}

		public void End() => this.Ended = true;

		public void Next(VM vm) {
			if(this.EOS) {
				this.End();
				return;
			}

			var Stack = vm.Stack;
			var Storage = vm.Storage;
			var NativeFuncs = vm.NativeFuncs;
			var RuntimeFuncs = vm.RuntimeFuncs;

			var op = (ByteCodeType)this.Byte();

			switch (op) {
				case ByteCodeType.Reserved:
					break;

				case ByteCodeType.EnterBlock:
					Storage.Up();
					break;
				case ByteCodeType.ExitBlock:
					Storage.Down();
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
						var returns = this.Byte();

						var argc = this.Byte();
						var _callee = Stack.Pop();
						if (_callee.Type != VMValueType.Keyword)
							throw new Exception("VNScript VMError - Callee should be Keyword");

						var callee = _callee.AsKeyword();
						var arguments = new VMValue[argc]
							.Select(_ => Stack.Pop())
							.Reverse()
							.ToArray();

						if (NativeFuncs.ContainsKey(callee)) {
							var result = NativeFuncs[callee].Invoke(arguments, Storage);
							if (returns == 1)
								Stack.Push(result);
						}
						else if (RuntimeFuncs.ContainsKey(callee)) {
							var func = RuntimeFuncs[callee];
							var state = new VMState(func.Body, vm.Storage.CurrentLevel);

							var argList = new List<VMValue>();
							foreach (var arg in arguments) argList.Add(arg);

							// Optional 값 추가
							for (var i = argList.Count; i < func.Arguments.Length; i++) {
								var arg = func.Arguments[i];

								if (arg == null) {
									var mod = i % 10;
									var index = (i + 1) + (mod == 1 ? "st" : mod == 2 ? "nd" : mod == 3 ? "rd" : "th");
									throw new Exception($"VNScript VMError - Function \"{callee}\"'s {index} argument is not optional");
								}

								argList.Add(arg);
							}

							// 스택에 삽입
							foreach (var arg in argList) Stack.Push(arg);

							// 결과를 받지 않는 경우, 함수 반환값을 무시 (Pop)
							if (returns == 0)
								vm.States.Push(new VMState(new byte[] { (byte)ByteCodeType.Pop }, vm.Storage.CurrentLevel));

							vm.States.Push(state);
						}
						else
							throw new Exception($"VNScript VMError - Function '{callee}' not defined or registered");
					}
					break;

				case ByteCodeType.Assign: {
						var _target = Stack.Pop();
						if(_target.Type != VMValueType.Keyword)
							throw new Exception("VNScript VMError - Assign Target should be Keyword");

						var target = _target.AsKeyword();
						var value = Stack.Pop();
						if (value.Type == VMValueType.Keyword) {
							var name = value.AsKeyword();
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

						var name = value.AsKeyword();
						Stack.Push(
							Storage.Has(name)
								? Storage.Get(name).Value
								: VMValue.Null()
						);
					}
					break;

				case ByteCodeType.Define: {
						var paramLen = this.Byte();
						var paramList = new VMValue[paramLen];
						for (var i = 0; i < paramLen; i++) {
							var spec = (VMValueType)this.Byte();
							if (spec == VMValueType.None)
								paramList[i] = null;
							else {
								var buffer = this.Read(this.Byte());
								VMValue data;

								switch (spec) {
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
								paramList[i] = data;
							}
						}

						var nameLen = this.Byte();
						var name = this.String(nameLen);

						if (NativeFuncs.ContainsKey(name))
							throw new Exception("VNScript VMError - '" + name + "' Already defined at Native Functions");

						var bodySize = this.Int();
						var address = (int)this.stream.Position;
						this.Skip(bodySize);

						var body = new byte[bodySize];
						Array.Copy(this.Body, address, body, 0, bodySize);

						// Add or Replace
						RuntimeFuncs[name] = new VMRuntimeFunc(paramList, body);
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
						Stack.Push(new VMValue(VMValueType.Number, (double)(left.AsInteger(Storage) | right.AsInteger(Storage))));
					}
					break;
				case ByteCodeType.BitwiseXor: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, (double)(left.AsInteger(Storage) ^ right.AsInteger(Storage))));
					}
					break;
				case ByteCodeType.BitwiseAnd: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, (double)(left.AsInteger(Storage) & right.AsInteger(Storage))));
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
						Stack.Push(new VMValue(VMValueType.Number, (double)(left.AsInteger(Storage) << right.AsInteger(Storage))));
					}
					break;
				case ByteCodeType.BitwiseRightShift: {
						var left = Stack.Pop();
						var right = Stack.Pop();
						Stack.Push(new VMValue(VMValueType.Number, (double)(left.AsInteger(Storage) >> right.AsInteger(Storage))));
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
						Stack.Push(new VMValue(VMValueType.Number, (double)(~target.AsInteger(Storage))));
					}
					break;

				case ByteCodeType.EndOfState:
					this.End();
					break;

				default:
					throw new NotImplementedException("VNScript VMError - Invalid Operation");
			}
		}
	}
}
