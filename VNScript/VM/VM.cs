using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using VNScript.Compiler.VNSP;

namespace VNScript.VM {
	public sealed class VM {
		public delegate VMValue VMNativeFunc(VMValue[] arguments, VMStorage storage);

		public ReadOnlyStack<VMState> States { get; private set; }
		public ReadOnlyStack<VMValue> Stack { get; private set; }
		public VMStorage Storage { get; }

		internal Dictionary<string, VMNativeFunc> NativeFuncs { get; }
		internal Dictionary<string, VMRuntimeFunc> RuntimeFuncs { get; }

		private bool Running = false;
		private int Calling = 0;

		public VM() {
			this.States = new ReadOnlyStack<VMState>();
			this.Storage = new VMStorage();

			this.NativeFuncs = new Dictionary<string, VMNativeFunc>();
			this.RuntimeFuncs = new Dictionary<string, VMRuntimeFunc>();
		}

		public void Load(CodeChunk chunk) {
			this.States.Push(new VMState(chunk, this.Storage.CurrentLevel));
			this.Storage.Up();
		}

		public VM Register(string FuncName, VMNativeFunc FuncBody) {
			this.NativeFuncs[FuncName] = FuncBody;
			return this;
		}

		public VM Call(string FuncName, params VMValue[] args) {
			if (this.NativeFuncs.ContainsKey(FuncName)) {
				var func = this.NativeFuncs[FuncName];
				func.Invoke(args, this.Storage);
			}
			else if (this.RuntimeFuncs.ContainsKey(FuncName)) {
				// 기존 실행중인 State
				var curLevel = this.States.Count;

				var func = this.RuntimeFuncs[FuncName];
				var funcState = new VMState(func.Body, this.Storage.CurrentLevel);

				var argList = new List<VMValue>();
				foreach (var arg in args) argList.Add(arg);

				// Optional 값 추가
				for (var i = argList.Count; i < func.Arguments.Length; i++) {
					var arg = func.Arguments[i];

					if (arg == null) {
						var mod = i % 10;
						var index = (i + 1) + (mod == 1 ? "st" : mod == 2 ? "nd" : mod == 3 ? "rd" : "th");
						throw new Exception($"VNScript VMError - Function \"{FuncName}\"'s {index} argument is not optional");
					}

					argList.Add(arg);
				}

				// 스택에 삽입
				foreach (var arg in argList) Stack.Push(arg);

				// 함수 반환값을 무시 (Pop)
				this.States.Push(new VMState(new byte[] { (byte)Compiler.ByteCodeType.Pop }, this.Storage.CurrentLevel));
				this.States.Push(funcState);

				this.Calling++;

				while (this.States.Count > curLevel) {
					var state = this.States.Peek();

					if (!state.Ended)
						state.Next(this);
					else {
						var level = state.StorageLevel;
						while (this.Storage.CurrentLevel > level)
							this.Storage.Down();

						this.States.Pop();
					}
				}

				this.Calling--;
			}
			else
				throw new Exception("VMScript VMError - Undefined Function");

			return this;
		}

		public bool FuncExists(string FuncName) => this.NativeFuncs.ContainsKey(FuncName) || this.RuntimeFuncs.ContainsKey(FuncName);

		public void Run() {
			this.Stack = new ReadOnlyStack<VMValue>();

			if (this.Running)
				throw new Exception("VMScript VMError - Already Running");

			while (this.States.Count > 0) {
				if (this.Calling > 0)
					continue;

				var state = this.States.Peek();

				if (!state.Ended)
					state.Next(this);
				else {
					var level = state.StorageLevel;
					while (this.Storage.CurrentLevel > level)
						this.Storage.Down();

					this.States.Pop();
				}
			}
		}
	}
}
