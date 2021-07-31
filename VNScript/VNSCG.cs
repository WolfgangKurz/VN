using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal class VNSCG : IDisposable {
		public bool Disposed { get; private set; }

		public Image Image { get; private set; }
		public VNPosition Position { get; }

		public VNSCG(Image image, VNPosition pos) {
			this.Image = image;
			this.Position = pos;
		}

		public void Dispose() {
			if (this.Disposed) return;

			if (this.Image != null) {
				this.Image.Dispose();
				this.Image = null;
			}
			this.Disposed = true;
		}
	}
}
