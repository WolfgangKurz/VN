using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	public class Surface : IDisposable {
		public Graphics g { get; private set; }
		private Bitmap bitmap { get; set; }

		public Surface(Bitmap bitmap) {
			this.bitmap = bitmap;
			this.g = Graphics.FromImage(this.bitmap);
			this.g.InterpolationMode = InterpolationMode.NearestNeighbor;
			this.g.SmoothingMode = SmoothingMode.HighSpeed;
		}

		public void Flush(Graphics g, float opacity = 1.0f) {
			if (this.bitmap == null) return;

			if (opacity < 1.0f) {
				var matrix = new ColorMatrix();
				matrix.Matrix33 = opacity; // Alpha

				var imgAttr = new ImageAttributes();
				imgAttr.SetColorMatrix(matrix);

				g.DrawImage(
					this.bitmap,
					new Rectangle(Point.Empty, this.bitmap.Size),
					0, 0, this.bitmap.Width, this.bitmap.Height,
					GraphicsUnit.Pixel, imgAttr
				);
			}
			else
				g.DrawImageUnscaled(this.bitmap, Point.Empty);
		}

		public void Dispose() {
			this.g?.Dispose();
			this.g = null;

			this.bitmap?.Dispose();
			this.bitmap = null;
		}
	}

	internal class SurfaceManager : IDisposable{
		public int Width { get; private set; }
		public int Height { get; private set; }

		private List<Surface> surfaces { get; }

		public int Count { get; private set; }

		public Surface this[int index] => this.surfaces[index];

		public SurfaceManager(int Width, int Height) {
			this.surfaces = new List<Surface>();
			this.Count = 0;
			this.Width = Width;
			this.Height = Height;
		}

		public void Resize(int Width, int Height) {
			if (this.Width == Width && this.Height == Height) return;
			this.Width = Width;
			this.Height = Height;

			this.Dispose();
		}

		public void Clear(int Remaining = 0) {
			this.Count = Remaining;
		}

		public void Push() {
			if (this.surfaces.Count == this.Count) {
				this.surfaces.Add(new Surface(new Bitmap(this.Width, this.Height, PixelFormat.Format32bppArgb)));
				this.Count++;
			}
			else {
				this.Count++;
				this.Peek().g.Clear(Color.Transparent);
			}
		}

		public Surface Pop() => this.surfaces[--this.Count];

		public Surface Peek() {
			if (this.Count == 0) return null;
			return this.surfaces[this.Count - 1];
		}

		public void Dispose() {
			foreach (var surface in this.surfaces)
				surface?.Dispose();

			this.surfaces.Clear();
			this.Count = 0;
		}
	}
}
