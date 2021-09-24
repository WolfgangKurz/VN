using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace VN.GL.Internal {
	internal class GlobalIntPtr : IDisposable {
		private bool disposed = false;

		public int Length { get; private set; }
		public IntPtr Handle { get; private set; }

		public GlobalIntPtr(int size) {
			this.Length = size;
			this.Handle = Marshal.AllocHGlobal(size);
		}

		public void Dispose() {
			if (this.disposed) return;

			this.disposed = true;
			Marshal.FreeHGlobal(this.Handle);
			this.Length = -1;
			this.Handle = IntPtr.Zero;
		}
	}
}
