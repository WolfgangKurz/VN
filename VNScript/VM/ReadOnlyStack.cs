using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public sealed class ReadOnlyStack<T> : Stack<T> {
		internal ReadOnlyStack(): base() { }
		internal ReadOnlyStack(int capacity) : base(capacity) { }
		internal ReadOnlyStack(IEnumerable<T> collection) : base(collection) { }

		internal new void Clear() => base.Clear();

		internal new void TrimExcess() => base.TrimExcess();

		internal new T Pop() => base.Pop();

		internal new void Push(T item) => base.Push(item);
	}
}
