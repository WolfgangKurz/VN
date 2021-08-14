using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	/// <summary>
	/// VNScript에서 사용하는 변수
	/// </summary>
	internal class VNValue : IEquatable<VNValue> {
		/// <summary>
		/// 값의 타입
		/// </summary>
		public VNType type { get; }

		/// <summary>
		///  값
		/// </summary>
		public object value { get; }

		public VNValue(VNType type, object value) {
			this.type = type;
			this.value = value;
		}

		#region Converters
		public bool AsBool {
			get {
				switch (this.type) {
					case VNType.Null:
						return false;
					case VNType.Number:
						return (double)this.value != 0;
					case VNType.String:
						return !string.IsNullOrEmpty((string)this.value);
					case VNType.Boolean:
						return (bool)this.value;
					case VNType.Symbol:
						return false; // 심볼은 항상 False
				}
				return false;
			}
		}

		public string AsString => this.type == VNType.Null
			? null
			: this.type == VNType.Symbol
				? ""
				: this.value.ToString();

		public double AsNumber => this.type == VNType.Number
			? (double)this.value
			: double.NaN;

		public string AsSymbol => this.type == VNType.Symbol && ((string)this.value)[0] != '$'
			? (string)this.value
			: null;

		public string AsVariable => this.type == VNType.Symbol && ((string)this.value)[0] == '$'
			? ((string)this.value).Substring(1)
			: null;

		public string AsSerialize {
			get {
				if (this.isNull) return "null";
				if (this.isString) return $"\"{this.AsString}\"";
				if (this.isSymbol) return this.AsSymbol;
				if (this.isVariable) return $"${this.AsVariable}";
				if (this.isNumber) return this.AsNumber.ToString();
				if (this.isBool) return this.AsBool.ToString();
				return this.value.ToString();
			}
		}
		#endregion

		#region Checkers
		public bool isNull => this.type == VNType.Null;
		public bool isNumber => this.type == VNType.Number;
		public bool isString => this.type == VNType.String;
		public bool isBool => this.type == VNType.Boolean;
		public bool isSymbol => this.type == VNType.Symbol && ((string)this.value)[0] != '$';
		public bool isVariable => this.type == VNType.Symbol && !this.isSymbol;
		#endregion

		public override bool Equals(object obj) => this.Equals(obj as VNValue);

		public bool Equals(VNValue v) {
			if (v is null) return false;
			if (Object.ReferenceEquals(this, v)) return true;
			if (this.GetType() != v.GetType()) return false;
			return this.type == v.type && this.AsSerialize == v.AsSerialize;
		}

		public override int GetHashCode() => (this.type, this.value).GetHashCode();

		public override string ToString() => $"[{this.type}] {this.value}";

		public static bool operator ==(VNValue a, VNValue b) {
			if (a is null) {
				if (b is null) return true;
				return false;
			}
			return a.Equals(b);
		}
		public static bool operator !=(VNValue a, VNValue b) => !(a == b);

		public static bool operator >(VNValue a, VNValue b) {
			if (a is null || b is null) return false;
			if (!a.isNumber || !b.isNumber) return false;
			return a.AsNumber > b.AsNumber;
		}
		public static bool operator <(VNValue a, VNValue b) {
			if (a is null || b is null) return false;
			if (!a.isNumber || !b.isNumber) return false;
			return a.AsNumber < b.AsNumber;
		}

		public static bool operator >=(VNValue a, VNValue b) {
			if (a is null || b is null) return false;
			if (!a.isNumber || !b.isNumber) return false;
			return a.AsNumber >= b.AsNumber;
		}
		public static bool operator <=(VNValue a, VNValue b) {
			if (a is null || b is null) return false;
			if (!a.isNumber || !b.isNumber) return false;
			return a.AsNumber <= b.AsNumber;
		}
	}
}
