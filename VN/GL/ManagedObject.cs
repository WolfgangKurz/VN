using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.GL {
	public class ManagedObject : IDisposable {
		protected bool disposed = false;
		public int RefCount { get; protected set; } = 1;

		public void Reference() {
			if (this.disposed) throw new ObjectDisposedException(nameof(Image));
			this.RefCount++;
		}
		public void Unreference() {
			if (this.disposed) throw new ObjectDisposedException(nameof(Image));
			this.RefCount--;
		}

		public virtual void Dispose() {
			this.disposed = true;
		}
	}
}
