using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using VNScript.Compiler.VNSP;

namespace VNScript.VM {
	public sealed class VM {
		public delegate VMValue VMFunc(VMValue[] arguments, VMStorage storage);

		public ReadOnlyStack<VMState> States { get; private set; }
		public ReadOnlyStack<VMValue> Stack { get; private set; }
		public VMStorage Storage { get; }

		private ReadOnlyStack<int> BlockStack { get; }
		private Dictionary<string, VMFunc> Funcs { get; }

		private bool Running = false;

		public VM() {
			this.States = new ReadOnlyStack<VMState>();
			this.Storage = new VMStorage();

			this.BlockStack = new ReadOnlyStack<int>();
			this.Funcs = new Dictionary<string, VMFunc>();
		}

		public void Load(CodeChunk chunk) {
			this.States.Push(new VMState(chunk));
			this.Storage.Up();
		}

		public VM Register(string FuncName, VMFunc FuncBody) {
			this.Funcs[FuncName] = FuncBody;
			return this;
		}

		public void Run() {
			this.Stack = new ReadOnlyStack<VMValue>();
			this.BlockStack.Clear();

			if (this.Running)
				throw new Exception("VMScript VMError - Already Running");

			while (this.States.Count > 0) {
				var state = this.States.Peek();

				while (!state.EOS)
					state.Next(this.Stack, this.Storage, this.BlockStack, this.Funcs);

				this.Storage.Down();
				this.States.Pop();
			}
		}
	}
}
