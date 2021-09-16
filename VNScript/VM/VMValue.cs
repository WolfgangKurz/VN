using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public class VMValue {
		public VMValueType Type { get; private set; }
		public object Data { get; private set; }

		public VMValue(VMValueType Type, object Data) {
			this.Type = Type;
			this.Data = Data;
		}

		public override string ToString() {
			switch(this.Type) {
				case VMValueType.Null: return "Null";
				case VMValueType.Number: {
						var v = ((double)this.Data).ToString();
						return v.Contains(".") ? v : v + ".0";
					}
				case VMValueType.Boolean: return ((bool)this.Data).ToString();
				case VMValueType.String:
				case VMValueType.Keyword: return this.Data as string;
				case VMValueType.Integer: return ((int)this.Data).ToString();
			}
			return "???";
		}

		#region Static Constructor
		public static VMValue Null() => new VMValue(VMValueType.Null, null);
		public static VMValue Number(double value) => new VMValue(VMValueType.Number, value);
		public static VMValue Boolean(bool value) => new VMValue(VMValueType.Boolean, value);
		public static VMValue String(string value) => new VMValue(VMValueType.String, value);
		public static VMValue Keyword(string value) => new VMValue(VMValueType.Keyword, value);
		public static VMValue Integer(int value) => new VMValue(VMValueType.Integer, value);
		#endregion

		#region Converter
		public object AsNull => null;

		public string AsString(VMStorage storage = null) {
			switch (this.Type) {
				case VMValueType.Null:
					return "null";
				case VMValueType.Number:
					return ((double)this.Data).ToString();
				case VMValueType.Boolean:
					return (bool)this.Data ? "true" : "false";
				case VMValueType.String:
					return this.Data as string;
				case VMValueType.Keyword: {
						var name = this.Data as string;
						if (storage?.Has(name) ?? false)
							return storage.Get(name).Value.AsString(storage);
						return VMValue.Null().AsString(storage);
					}
				case VMValueType.Integer:
					return ((int)this.Data).ToString();
				default:
					throw new Exception("VNScript VMError - Invalid Type");
			}
		}
		public string AsKeyword(VMStorage storage = null) {
			switch (this.Type) {
				case VMValueType.Null:
					return "null";
				case VMValueType.Number:
					return ((double)this.Data).ToString();
				case VMValueType.Boolean:
					return (bool)this.Data ? "true" : "false";
				case VMValueType.String:
					return this.Data as string;
				case VMValueType.Keyword: {
						var name = this.Data as string;
						if (storage?.Has(name) ?? false)
							return storage.Get(name).Value.AsString(storage);
						return name;
					}
				case VMValueType.Integer:
					return ((int)this.Data).ToString();
				default:
					throw new Exception("VNScript VMError - Invalid Type");
			}
		}

		public bool AsBoolean(VMStorage storage = null) {
			switch (this.Type) {
				case VMValueType.Null:
					return false;
				case VMValueType.Number:
					return (double)this.Data != 0;
				case VMValueType.Boolean:
					return (bool)this.Data;
				case VMValueType.String:
					return string.IsNullOrEmpty(this.Data as string);
				case VMValueType.Keyword: {
						var name = this.Data as string;
						if (storage?.Has(name) ?? false)
							return storage.Get(name).Value.AsBoolean(storage);
						return string.IsNullOrEmpty(this.Data as string);
					}
				case VMValueType.Integer:
					return (int)this.Data != 0;
				default:
					throw new Exception("VNScript VMError - Invalid Type");
			}
		}

		public double AsNumber(VMStorage storage = null) {
			switch (this.Type) {
				case VMValueType.Null:
					return 0;
				case VMValueType.Number:
					return (double)this.Data;
				case VMValueType.Boolean:
					return (bool)this.Data ? 1 : 0;
				case VMValueType.String: {
						double value;
						if (double.TryParse(this.Data as string, out value))
							return value;
						else
							return 0;
					}
				case VMValueType.Keyword: {
						double value;
						var name = this.Data as string;
						if (storage?.Has(name) ?? false)
							return storage.Get(name).Value.AsNumber(storage);

						if (double.TryParse(name, out value))
							return value;
						else
							return 0;
					}
				case VMValueType.Integer:
					return (int)this.Data;
				default:
					throw new Exception("VNScript VMError - Invalid Type");
			}
		}

		public int AsInteger(VMStorage storage = null) {
			switch (this.Type) {
				case VMValueType.Null:
					return 0;
				case VMValueType.Number:
					return (int)((double)this.Data);
				case VMValueType.Boolean:
					return (bool)this.Data ? 1 : 0;
				case VMValueType.String: {
						int value;
						if (int.TryParse(this.Data as string, out value))
							return value;
						else
							return 0;
					}
				case VMValueType.Keyword: {
						int value;
						var name = this.Data as string;
						if (storage?.Has(name) ?? false)
							return storage.Get(name).Value.AsInteger(storage);

						if (int.TryParse(name, out value))
							return value;
						else
							return 0;
					}
				case VMValueType.Integer:
					return (int)this.Data;
				default:
					throw new Exception("VNScript VMError - Invalid Type");
			}
		}
		#endregion
	}
}
