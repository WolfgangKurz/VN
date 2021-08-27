using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Parser {
	internal class Result<T> : IResult<T>, IEquatable<Result<T>> {
		public Cursor StartCursor { get; }
		public Cursor EndCursor { get; }
		public T Value { get; }

		public Result(Cursor startCursor, Cursor endCursor, T value) {
			this.StartCursor = startCursor;
			this.EndCursor = endCursor;
			this.Value = value;
		}

		public static bool operator !=(Result<T> left, Result<T> right) => !object.Equals(left, right);
		public static bool operator ==(Result<T> left, Result<T> right) => object.Equals(left, right);
		public override bool Equals(object obj) => this.Equals(obj as Result<T>);

		public bool Equals(Result<T> other) =>
			!(other is null) &&
			this.StartCursor == other.StartCursor &&
			this.EndCursor == other.EndCursor &&
			object.Equals(this.Value, other.Value);

		public override int GetHashCode() {
			unchecked {
				var hash = 0x3EFB6AC0;
				hash = (hash * -0x13228765) + this.StartCursor.GetHashCode();
				hash = (hash * -0x13228765) + this.EndCursor.GetHashCode();
				hash = (hash * -0x13228765) + (object.ReferenceEquals(this.Value, null) ? 0 : this.Value.GetHashCode());
				return hash;
			}
		}
	}
}
