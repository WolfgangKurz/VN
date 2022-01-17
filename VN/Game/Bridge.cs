using System;
using System.Collections.Generic;
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

		public void Debug(params object[] p) {
			object p0, p1, p2;
			p0 = p1 = p2 = null;
			if (p.Length > 0) p0 = p[0];
			if (p.Length > 1) p1 = p[1];
			if (p.Length > 2) p2 = p[2];
			;
		}

		#region Game
		public void Game_Center() => this.Parent.Center();

		public void Game_Update() => this.Parent.Update();

		public void Game_Resize(int width, int height) => this.Parent.ResizeBuffer(width, height);

		public void Game_Title(string name, bool memory = false) => this.Parent.UpdateTitle(name, memory);
		#endregion

		#region Input
		public (int, int, int) Input_Mouse() => (this.Parent.Mouse.X, this.Parent.Mouse.Y, this.Parent.Mouse.State);

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
			foreach (var kv in this.Parent.ImageDict) {
				if (kv.Value.uid == filename) {
					kv.Value.Reference();
					return kv.Key;
				}
			}

			while (this.Parent.ImageDict.ContainsKey(idx)) idx++;
			this.Parent.ImageDict[idx] = new GL.Image(this.Parent.gl, filename);
			return idx;
		}

		public void Image_Clone(int id) {
			if (!this.Parent.ImageDict.ContainsKey(id)) return;

			var item = this.Parent.ImageDict[id];
			item.Reference();
		}

		public (int, int) Image_Size(int id) {
			if (!this.Parent.ImageDict.ContainsKey(id)) return (-1, -1);

			var img = this.Parent.ImageDict[id];
			return (img.width, img.height);
		}

		public void Image_Unload(int id) {
			if (!this.Parent.ImageDict.ContainsKey(id)) return;

			var item = this.Parent.ImageDict[id];
			item.Unreference();
			if (item.RefCount <= 0) {
				item.Dispose();
				this.Parent.ImageDict.Remove(id);
			}
		}

		public void Image_Draw(int id, double srcx, double srcy, double srcw, double srch, double x, double y, double w, double h, double orix, double oriy, uint color, double angle) {
			if (!this.Parent.ImageDict.ContainsKey(id)) return;

			var image = this.Parent.ImageDict[id];
			this.Parent.gl.DrawImage(image, srcx, srcy, srcw, srch, x, y, w, h, orix, oriy, color, angle);
		}
		#endregion

		#region Sprite
		public string[][] Sprite_Info(string spriteName) {
			var path = Path.Combine(Helper.DirName, "VNData", spriteName + ".sprite.txt");
			return File.ReadAllLines(path)
				.Where(x => !string.IsNullOrEmpty(x))
				.Select(x => x.Split('\t'))
				.ToArray();
		}
		#endregion

		#region Graphics
		public void Graphics_Fill(uint color) => this.Parent.Fill(color);
		public void Graphics_EnterSurface() => this.Parent.EnterSurface();
		public int Graphics_FlushSurface() {
			var tex = this.Parent.FlushSurface();
			if (tex == 0) return 0;

			var idx = 0;
			while (this.Parent.ImageDict.ContainsKey(idx)) idx++;
			this.Parent.ImageDict[idx] = new GL.Image(this.Parent.gl, tex, this.Parent.gl.Width, this.Parent.gl.Height);
			return idx;
		}
		public int Graphics_Snap() {
			var tex = this.Parent.gl.Snap();
			if (tex == 0) return 0;

			var idx = 0;
			while (this.Parent.ImageDict.ContainsKey(idx)) idx++;
			this.Parent.ImageDict[idx] = new GL.Image(this.Parent.gl, tex, this.Parent.gl.Width, this.Parent.gl.Height);
			return idx;
		}
		#endregion

		#region Font
		public int Font_Create(string fontName) {
			var idx = 0;
			foreach (var kv in this.Parent.FontDict) {
				if (kv.Value.FontName == fontName) {
					kv.Value.Reference();
					return kv.Key;
				}
			}

			while (this.Parent.FontDict.ContainsKey(idx)) idx++;
			this.Parent.FontDict[idx] = new GL.Font(this.Parent.gl, fontName);
			return idx;
		}

		public void Font_Clone(int id) {
			if (!this.Parent.FontDict.ContainsKey(id)) return;

			var item = this.Parent.FontDict[id];
			item.Reference();
		}

		public void Font_Unload(int id) {
			if (!this.Parent.FontDict.ContainsKey(id)) return;

			var item = this.Parent.FontDict[id];
			item.Unreference();
			if (item.RefCount <= 0) {
				item.Dispose();
				this.Parent.FontDict.Remove(id);
			}
		}

		public void Font_Draw(int id, string text, float size, int x, int y, uint color = 0xFFFFFF, bool bold = false, bool italic = false, bool underline = false, bool strike = false, int align = 0, float width = 0f) {
			if (!this.Parent.FontDict.ContainsKey(id)) return;

			var font = this.Parent.FontDict[id];
			font.Draw(text, new System.Drawing.PointF(x, y), width, size, bold, italic, underline, strike, color, align);
			// this.Parent.gl.Text(fontface, size, text, x, y, color);
		}
		#endregion

		#region Audio
		public int Audio_Load(string path, bool repeats = false) {
			var idx = 0;
			while (this.Parent.AudioDict.ContainsKey(idx)) idx++;

			var audio = new Audio();
			audio.Load(Path.Combine(Helper.DirName, "VNData", path), repeats);
			this.Parent.AudioDict[idx] = audio;
			return idx;
		}

		public void Audio_Unload(int id) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return;

			var item = this.Parent.AudioDict[id];
			item.Dispose();
			this.Parent.AudioDict.Remove(id);
		}

		public void Audio_Play(int id) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return;

			var audio = this.Parent.AudioDict[id];
			audio.Play();
		}

		public void Audio_Stop(int id) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return;

			var audio = this.Parent.AudioDict[id];
			audio.Stop();
		}

		public void Audio_Pause(int id) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return;

			var audio = this.Parent.AudioDict[id];
			audio.Pause();
		}

		public void Audio_Volume(int id, float volume) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return;

			var audio = this.Parent.AudioDict[id];
			audio.Volume = volume;
		}

		public void Audio_Seek(int id, double pos) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return;

			var audio = this.Parent.AudioDict[id];
			audio.Seek(pos);
		}
		public double Audio_Pos(int id) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return 0;

			var audio = this.Parent.AudioDict[id];
			return audio.CurrentTime;
		}

		public bool Audio_isPlaying(int id) {
			if (!this.Parent.AudioDict.ContainsKey(id)) return false;

			var audio = this.Parent.AudioDict[id];
			return audio.Playing;
		}
		#endregion

		public void Dispose() {
			{
				var list = this.Parent.ImageDict.Values.ToArray();
				foreach (var item in list)
					item.Dispose();
				this.Parent.ImageDict.Clear();
			}
		}
	}
}
