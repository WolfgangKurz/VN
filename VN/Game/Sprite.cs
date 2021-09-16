using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class Sprite : IDisposable {
		public struct SpriteInfo {
			public string name;
			public int x;
			public int y;
			public int width;
			public int height;

			public SpriteInfo(string name, int x, int y, int width, int height) {
				this.name = name;
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
			}
		}

		public Image this[string name] => this.Images[name];

		private Dictionary<string, Image> _Images { get; } = new Dictionary<string, Image>();
		public IReadOnlyDictionary<string, Image> Images => this._Images;

		public string DefaultKey { get; }
		public Image Default => this.Images[this.DefaultKey];

		public Sprite(Image Image, SpriteInfo[] Infos) {
			DefaultKey = Infos[0].name;

			foreach (var info in Infos) {
				var crop = (Image as Bitmap).Clone(new Rectangle(info.x, info.y, info.width, info.height), Image.PixelFormat);
				this._Images.Add(info.name, crop);
			}
		}

		public void Dispose() {
			foreach (var image in this._Images)
				image.Value.Dispose();
			this._Images.Clear();
		}
	}
}
