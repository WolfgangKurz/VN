using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class SCG : IDisposable {
		public Image Image { get; set; }
		public double X { get; set; }

		public SCG(Image Image, double X) {
			this.Image = Image;
			this.X = X;
		}

		public void Dispose() {
			this.Image?.Dispose();
			this.Image = null;
		}
	}
}
