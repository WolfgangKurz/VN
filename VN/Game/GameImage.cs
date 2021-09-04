using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class GameImage : IDisposable {
		public Image Image { get; set; }
		public double X { get; set; }
		public double Y { get; set; }
		public double CenterX { get; set; }
		public double CenterY { get; set; }

		public GameImage(Image Image, double X, double Y, double centerX, double centerY) {
			this.Image = Image;
			this.X = X;
			this.Y = Y;
			this.CenterX = centerX;
			this.CenterY = centerY;
		}

		public void Dispose() {
			this.Image?.Dispose();
			this.Image = null;
		}
	}
}
