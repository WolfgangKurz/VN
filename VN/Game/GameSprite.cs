using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class GameSprite : GameImage {
		private string currentKey;

		private Sprite Sprite { get; set; }

		public GameSprite(Sprite sprite, string ID, double X, double Y, double centerX, double centerY) : base(sprite[sprite.DefaultKey], ID, X, Y, centerX, centerY) {
			this.Sprite = sprite;
			this.currentKey = sprite.DefaultKey;
		}

		public void Update(string name) {
			this.currentKey = name;
			this.Image = this.Sprite[name];
		}

		private new void Dispose() {
			this.Sprite?.Dispose();
			this.Sprite = null;

			this.Image = null;
		}
	}
}
