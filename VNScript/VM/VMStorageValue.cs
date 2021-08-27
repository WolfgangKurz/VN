using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public sealed class VMStorageValue {
		public int Level { get; }
		public string Name { get; }
		public VMValue Value { get; private set; }

		public VMStorageValue(int Level, string Name, VMValue Value) {
			this.Level = Level;
			this.Name = Name;
			this.Value = Value;
		}

		public void Set(VMValue Value) {
			this.Value = Value;
		}

		public override string ToString() => $"Level={this.Level}, Name={this.Name}, Value={this.Value}";
	}
}
