using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	public class VImage : IDisposable {
		public string id { get; }

		public Image image { get; }
		public int width { get; }
		public int height { get; }

		public int References { get; private set; } = 0;

		public VImage(string filename) {
			this.id = filename;
			this.image = Image.FromFile(Path.Combine(Helper.DirName, "VNData", filename + ".png"));
			this.width = this.image.Width;
			this.height = this.image.Height;
		}

		public void Reference() => this.References++;
		public void Unreference() => this.References--;

		public void Dispose() {
			this.image?.Dispose();
		}
	}
}
