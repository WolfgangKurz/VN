// #define USE_POW2_TEXTURE

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.GL {
	public class Image : ManagedObject {
		public string uid { get; }
		private GL gl { get; }

		public uint textureId { get; }
		public int width { get; }
		public int height { get; }

		public Image(GL gl, string filename, string uid = null) {
			this.uid = uid ?? filename;
			this.gl = gl;

			var image = System.Drawing.Image.FromFile(Path.Combine(Helper.DirName, "VNData", filename + ".png")) as Bitmap;
			this.width = image.Width;
			this.height = image.Height;

#if USE_POW2_TEXTURE
			var tWidth = 2 << (int)Math.Floor(Math.Log(this.width, 2));
			var tHeight = 2 << (int)Math.Floor(Math.Log(this.height, 2));
			if (this.width != tWidth || this.height != tHeight) {
				var prev = image;
				image = prev.GetThumbnailImage(tWidth, tHeight, null, IntPtr.Zero) as Bitmap;
				prev.Dispose();
			}
#else
			var tWidth = this.width;
			var tHeight = this.height;
#endif

			var bits = image.LockBits(new Rectangle(Point.Empty, image.Size), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
			this.textureId = gl.Texture(tWidth, tHeight, bits.Scan0);
			image.UnlockBits(bits);
			image.Dispose();
		}
		internal Image(GL gl, uint id, int width, int height) {
			this.gl = gl;
			this.uid = "#";
			this.textureId = id;
			this.width = width;
			this.height = height;
		}

		public override void Dispose() {
			if(this.disposed) return;
			base.Dispose();

			this.RefCount = 0;
			this.gl?.Untexture(this.textureId);
		}
	}
}
