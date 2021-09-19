using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VNTest {
	public partial class Form1 : Form {
		private Bitmap[] buffer = new Bitmap[2];
		private int cursor = 0;

		private object locker = new object();

		private Bitmap current = null;

		private Thread renderThread;

		private Image bg, logo;
		private long frames = 0;

		public Form1() {
			InitializeComponent();

			var w = 1280;
			var h = 720;

			this.ClientSize = new Size(w, h);
			this.FormBorderStyle = FormBorderStyle.FixedSingle;
			this.MaximizeBox = false;

			this.buffer[0] = new Bitmap(w, h, PixelFormat.Format32bppArgb);
			this.buffer[1] = new Bitmap(w, h, PixelFormat.Format32bppArgb);

			this.bg = Image.FromFile(@"F:\Develop\VN\VN\VNData\BG\BG_Title.png");
			this.logo = Image.FromFile(@"F:\Develop\VN\VN\VNData\IMG\logo.png");

			this.renderThread = new Thread(() => {
				while (true) 
					this.Render();
			});
			this.renderThread.Start();
		}

		private void Render() {
			// Switch Buffer
			lock (this.locker) {
				this.current = this.buffer[this.cursor];
				this.cursor = (this.cursor + 1) % this.buffer.Length;
			}

			if (this.InvokeRequired)
				this.Invoke(new Action(() => this.Invalidate()));
			else
				this.Invalidate();

			this.frames++;

			using var g = Graphics.FromImage(this.buffer[this.cursor]);
			g.Clear(Color.Black);
			g.DrawImageUnscaledAndClipped(this.bg, new Rectangle(Point.Empty, this.bg.Size));

			{
				var opacity = (float)Math.Abs(Math.Sin((float)this.frames / 10));

				var matrix = new ColorMatrix();
				matrix.Matrix33 = opacity; // Alpha

				var imgAttr = new ImageAttributes();
				imgAttr.SetColorMatrix(matrix);

				g.DrawImage(
					this.logo,
					new Rectangle(new Point(1200 - this.logo.Width, 40), this.logo.Size),
					0, 0, this.logo.Width, this.logo.Height,
					GraphicsUnit.Pixel, imgAttr
				);
			}
		}

		protected override void OnPaintBackground(PaintEventArgs e) {
			// base.OnPaintBackground(e);
		}

		protected override void OnPaint(PaintEventArgs e) {
			lock (this.locker) {
				if (this.current != null)
					e.Graphics.DrawImageUnscaledAndClipped(this.current, new Rectangle(Point.Empty, this.current.Size));
			}
		}

		private void Form1_FormClosing(object sender, FormClosingEventArgs e) {
			this.renderThread.Abort();
		}
	}
}
