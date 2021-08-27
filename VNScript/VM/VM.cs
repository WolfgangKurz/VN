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

		public void Run() {
			this.Stack = new ReadOnlyStack<VMValue>();

			if (this.Running)
				throw new Exception("VMScript VMError - Already Running");

			while (this.States.Count > 0) {
				var stateSize = this.States.Count;
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
