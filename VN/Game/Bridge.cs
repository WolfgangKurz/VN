using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class Bridge : IDisposable {
		private Game Parent { get; }

		public Bridge(Game Parent) {
			this.Parent = Parent;
		}

		public void Debug(object p) {
			;
		}

		#region Game
		public void Game_Center() => this.Parent.Center();

		public void Game_Update() => this.Parent.Update();

		public void Game_Resize(int width, int height) => this.Parent.ResizeBuffer(width, height);

		public void Game_Title(string name) => this.Parent.UpdateTitle(name);
		#endregion

		#region Input
		public int[] Input_Mouse() {
			return new int[] {
				this.Parent.Mouse.X,
				this.Parent.Mouse.Y,
				this.Parent.Mouse.State
			};
		}

		public int[][] Input_Clicks() {
			var ret = this.Parent.ClickQueue
				.Select(e => new int[] { e.X, e.Y })
				.ToArray();
			this.Parent.ClickQueue.Clear();
			return ret;
		}
		#endregion

		#region Image
		public int Image_Load(string filename) {
			var idx = 0;
			foreach (var kv in this.Parent.ImageDictionary) {
				if (kv.Value.id == filename) {
					kv.Value.Reference();
					return kv.Key;
				}
			}

			while (this.Parent.ImageDictionary.ContainsKey(idx)) idx++;
			this.Parent.ImageDictionary[idx] = new VImage(filename);
			return idx;
		}

		public int[] Image_Size(int id) {
			if (!this.Parent.ImageDictionary.ContainsKey(id)) return new int[] { -1, -1 };

			var img = this.Parent.ImageDictionary[id];
			return new int[] {
				img.width,
				img.height,
			};
		}

		public void Image_Unload(int id) {
			if (!this.Parent.ImageDictionary.ContainsKey(id)) return;

			var item = this.Parent.ImageDictionary[id];
			item.Unreference();
			if (item.References == 0) {
				item.Dispose();
				this.Parent.ImageDictionary.Remove(id);
			}
		}

		public void Image_Draw(int id, int srcx, int srcy, int srcw, int srch, int x, int y, int w, int h) {
			if (!this.Parent.ImageDictionary.ContainsKey(id)) return;

			var img = this.Parent.ImageDictionary[id];
			if (srcx == 0 && srcy == 0 && srcw == w && srch == h)
				this.Parent.Graphics.DrawImageUnscaledAndClipped(img.image, new Rectangle(x, y, w, h));
			else
				this.Parent.Graphics.DrawImage(img.image, new Rectangle(x, y, w, h), new Rectangle(srcx, srcy, srcw, srch), GraphicsUnit.Pixel);
		}
		#endregion

		#region Sprite
		public string Sprite_Info(string spriteName) {
			var path = Path.Combine(Helper.DirName, "VNData", spriteName + ".sprite.txt");
			//return File.ReadAllLines(path)
			//	.Where(x => !string.IsNullOrEmpty(x))
			//	.Select(x => x.Split('\t'))
			//	.Select(x => new {
			//		name = x[0],
			//		x = int.Parse(x[1]),
			//		y = int.Parse(x[2]),
			//		w = int.Parse(x[3]),
			//		h = int.Parse(x[4])
			//	})
			//	.ToArray();
			return File.ReadAllText(path);
		}
		#endregion

		#region Graphics
		public void Graphics_Text(string text, int x, int y) {
			this.Parent.DrawStrokedString(this.Parent.Graphics, text, new Rectangle(x, y, 1000, 1000));
		}

		public void Graphics_EnterSurface() {
			this.Parent.EnterSurface();
		}
		public void Graphics_FlushSurface(double opacity) {
			this.Parent.FlushSurface((float)opacity);
		}
		#endregion

		public void Dispose() {
			{
				var list = this.Parent.ImageDictionary.Values.ToArray();
				foreach (var item in list)
					item.Dispose();
				this.Parent.ImageDictionary.Clear();
			}
		}
	}
}
