using SharpGL;

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

using VN.GL.Internal;

namespace VN.GL {
	internal class Font : ManagedObject {
		#region GDI
		[StructLayout(LayoutKind.Sequential)]
		private struct POINT {
			public int X;
			public int Y;
		}
		[StructLayout(LayoutKind.Sequential)]
		private struct GLYPHMETRICS {
			public uint gmBlackBoxX;
			public uint gmBlackBoxY;
			[MarshalAs(UnmanagedType.Struct)]
			public POINT gmptGlyphOrigin;
			public short gmCellIncX;
			public short gmCellIncY;
		}
		[StructLayout(LayoutKind.Sequential)]
		private struct FIXED {
			public short fract;
			public short value;

			public FIXED(short f, short v) {
				this.fract = f;
				this.value = v;
			}
			public double Double => this.value + (this.fract / 65536.0);
			public float Float => this.value + (this.fract / 65536.0f);
			public override string ToString() => $"{Double}";
		}
		[StructLayout(LayoutKind.Sequential)]
		private struct MAT2 {
			[MarshalAs(UnmanagedType.Struct)]
			public FIXED mM11;
			[MarshalAs(UnmanagedType.Struct)]
			public FIXED mM12;
			[MarshalAs(UnmanagedType.Struct)]
			public FIXED mM21;
			[MarshalAs(UnmanagedType.Struct)]
			public FIXED mM22;
		}
		[StructLayout(LayoutKind.Sequential)]
		private struct POINTFX {
			[MarshalAs(UnmanagedType.Struct)]
			public FIXED x;
			[MarshalAs(UnmanagedType.Struct)]
			public FIXED y;

			public override string ToString() => $"{x}, {y}";
		}
		[StructLayout(LayoutKind.Sequential)]
		private struct TTPOLYGONHEADER {
			public int cb;
			public int dwType;
			[MarshalAs(UnmanagedType.Struct)]
			public POINTFX pfxStart;
		}
		[StructLayout(LayoutKind.Sequential)]
		private struct TTPOLYCURVE {
			public ushort wType;
			public ushort cpfx;
		}
		private class TTPolyCurve {
			public ushort wType;
			public ushort cpfx;
			public POINTFX[] apfx;

			public TTPolyCurve(TTPOLYCURVE source, IntPtr sourcePtr) {
				this.wType = source.wType;
				this.cpfx = source.cpfx;
				this.apfx = new POINTFX[this.cpfx];

				var basePtr = sourcePtr + Marshal.SizeOf<TTPOLYCURVE>();
				for (var i = 0; i < this.cpfx; i++)
					this.apfx[i] = Marshal.PtrToStructure<POINTFX>(basePtr + i * Marshal.SizeOf<POINTFX>());
			}
		}
		private const int TT_PRIM_LINE = 1;
		private const int TT_PRIM_QSPLINE = 2;
		private const int TT_PRIM_CSPLINE = 3;

		[DllImport("gdi32.dll", EntryPoint = "GetGlyphOutlineW", CharSet = CharSet.Unicode)]
		private static extern int GetGlyphOutline(IntPtr hdc, int uChar, int fuFormat, out GLYPHMETRICS lpgm, int cbBuffer, IntPtr lpBuffer, ref MAT2 lpmat2);
		private const int GGO_METRICS = 0;
		private const int GGO_BEZIER = 3;
		private const int GGO_UNHINTED = 0x100;

		[DllImport("gdi32.dll")]
		private static extern IntPtr SelectObject(IntPtr hdc, IntPtr objectHandle);

		[DllImport("gdi32.dll")]
		public static extern bool DeleteObject(IntPtr objectHandle);
		#endregion

		private const float BaseFontSize = 60f;
		private const int BezierSteps = 3;

		public string FontName { get; }

		private GL gl { get; }
		private FontFamily font { get; }
		private Dictionary<(char, FontStyle), (uint, float)> cachedList { get; }
		private Dictionary<FontStyle, System.Drawing.Font> fontDict { get; }

		private Bitmap measureCanvas { get; }
		private Graphics measureGraphics { get; }

		public Font(GL gl, string fontName) {
			this.FontName = FontName;

			this.gl = gl;
			try {
				this.font = new FontFamily(fontName);
			}
			catch {
				var _f = new System.Drawing.Font(fontName, 1);
				this.font = _f.FontFamily;
			}

			this.cachedList = new Dictionary<(char, FontStyle), (uint, float)>();
			this.fontDict = new Dictionary<FontStyle, System.Drawing.Font>();
			this.measureCanvas = new Bitmap(1, 1);
			this.measureGraphics = Graphics.FromImage(this.measureCanvas);
		}
		public override void Dispose() {
			if (base.disposed) return;
			base.Dispose();

			foreach (var item in this.cachedList)
				this.gl.Unlist(item.Key.Item1);
			this.cachedList.Clear();

			this.measureCanvas?.Dispose();
			this.measureGraphics?.Dispose();
		}

		public void Draw(string Text, PointF Location, float Size, bool Bold, bool Italic, bool Underline, bool Strike, uint Color, int Align) {
			double x = 0, y = 0;
			double fs = Size * 96 / 72;
			double ratio = fs / Font.BaseFontSize;
			float a = ((Color >> 24) & 0xFF) / 255f;
			float r = ((Color >> 16) & 0xFF) / 255f;
			float g = ((Color >> 8) & 0xFF) / 255f;
			float b = ((Color >> 0) & 0xFF) / 255f;

			var lines = Text.Replace("\r", "").Split('\n');
			foreach (var line in lines) {
				var size = this.Measure(Text, Size, Bold, Italic, Underline, Strike);

				if (Align == 0)
					x = 0;
				else if (Align == 1)
					x = -size.X / 2;
				else if (Align == 2)
					x = -size.X;

				var style = (Bold ? FontStyle.Bold : 0) |
					(Italic ? FontStyle.Italic : 0) |
					(Underline ? FontStyle.Underline : 0) |
					(Strike ? FontStyle.Strikeout : 0);

				foreach (var c in line) {
					var key = (c, style);
					if (!this.cachedList.ContainsKey(key)) this.Cache(c, style);
					if (!this.cachedList.ContainsKey(key)) continue;

					var (list, cw) = this.cachedList[key];

					this.gl.Push(() => {
						this.gl
							.Tex(false)
							.Translate(Location.X, Location.Y)
							.Scale(ratio, ratio)
							.Translate(x, y)
							.Color(r, g, b, a)
							.RunList(list);
					});

					x += cw;
				}

				y += Font.BaseFontSize * 1.5;
			}
		}
		public PointF Measure(string Text, float Size, bool Bold, bool Italic, bool Underline, bool Strike) {
			float x = 0, y = 0, w = 0, h = Size;
			float fs = Size * 96 / 72;
			float ratio = fs / Font.BaseFontSize;

			var style = (Bold ? FontStyle.Bold : 0) |
				(Italic ? FontStyle.Italic : 0) |
				(Underline ? FontStyle.Underline : 0) |
				(Strike ? FontStyle.Strikeout : 0);

			foreach (var c in Text) {
				if (c == '\r') continue;
				if (c == '\n') {
					x = 0;
					y += Size;
					h += Size;
					continue;
				}

				var key = (c, style);
				if (!this.cachedList.ContainsKey(key)) this.Cache(c, style);
				if (!this.cachedList.ContainsKey(key)) continue;

				x += ratio * this.cachedList[key].Item2;
				if (x > w) w = x;
			}

			return new PointF(w, h);
		}

		// n1 + (n2 - n1) * t
		private PointF MixBezierPoint(PointF p0, PointF p1, float t)
			=> new PointF(
				p0.X + (p1.X - p0.X) * t,
				p0.Y + (p1.Y - p0.Y) * t
			);

		private void Cache(char c, FontStyle style) {
			if (this.cachedList.ContainsKey((c, style))) return;

			var g = this.measureGraphics;
			if (!this.fontDict.ContainsKey(style))
				this.fontDict.Add(style, new System.Drawing.Font(this.font, Font.BaseFontSize, style));

			var f = this.fontDict[style];
			float size;

			GLYPHMETRICS gm;
			var mat2 = new MAT2();
			mat2.mM11 = new FIXED(0, 1);
			mat2.mM12 = new FIXED(0, 0);
			mat2.mM21 = new FIXED(0, 0);
			mat2.mM22 = new FIXED(0, 1);

			var hdc = g.GetHdc();
			var hfont = SelectObject(hdc, f.ToHfont());

			var pathes = new List<PointF[]>();
			var lists = new List<PointF>();

			try {
				var bufferSize = GetGlyphOutline(hdc, c, GGO_METRICS | GGO_BEZIER | GGO_UNHINTED, out gm, 0, IntPtr.Zero, ref mat2);
				if (bufferSize == -1) return;

				if (bufferSize > 0) {
					using (var buffer = new GlobalIntPtr(bufferSize)) {
						if (GetGlyphOutline(hdc, c, GGO_METRICS | GGO_BEZIER | GGO_UNHINTED, out gm, bufferSize, buffer.Handle, ref mat2) == 0) return;

						var offset = 0;
						while (offset < bufferSize) {
							var header = Marshal.PtrToStructure<TTPOLYGONHEADER>(buffer.Handle + offset);

							var baseOffset = offset;
							offset += Marshal.SizeOf<TTPOLYGONHEADER>();

							var start = new PointF(header.pfxStart.x.Float, header.pfxStart.y.Float);
							lists.Add(start);

							while (offset < baseOffset + header.cb) {
								var _curve = Marshal.PtrToStructure<TTPOLYCURVE>(buffer.Handle + offset);
								var curve = new TTPolyCurve(_curve, buffer.Handle + offset);

								if (curve.wType == TT_PRIM_LINE) {
									foreach (var pt in curve.apfx)
										lists.Add(new PointF(pt.x.Float, pt.y.Float));

								}
								else if (curve.wType == TT_PRIM_CSPLINE) {
									for (var i = 0; i < curve.cpfx; i += 3) {
										var p = new PointF[] {
											start,
											new PointF(curve.apfx[i + 0].x.Float, curve.apfx[i + 0].y.Float),
											new PointF(curve.apfx[i + 1].x.Float, curve.apfx[i + 1].y.Float),
											new PointF(curve.apfx[i + 2].x.Float, curve.apfx[i + 2].y.Float),
										};

										for (var j = 0; j <= Font.BezierSteps; j++) {
											var t = (float)j / Font.BezierSteps;

											var q0 = this.MixBezierPoint(p[0], p[1], t);
											var q1 = this.MixBezierPoint(p[1], p[2], t);
											var q2 = this.MixBezierPoint(p[2], p[3], t);

											var r0 = this.MixBezierPoint(q0, q1, t);
											var r1 = this.MixBezierPoint(q1, q2, t);

											var o = this.MixBezierPoint(r0, r1, t);
											lists.Add(o);
										}

										start = p[3];
									}
								}

								if (curve.cpfx > 0)
									start = new PointF(curve.apfx[curve.cpfx - 1].x.Float, curve.apfx[curve.cpfx - 1].y.Float);

								offset += Marshal.SizeOf<TTPOLYCURVE>() + Marshal.SizeOf<POINTFX>() * curve.cpfx;
							}
							offset = baseOffset + header.cb;

							if (lists.Count > 0) {
								pathes.Add(lists.Select(p => new PointF(p.X, Font.BaseFontSize - p.Y)).ToArray());
								lists.Clear();
							}
						}
					}
				}
			}
			finally {
				DeleteObject(SelectObject(hdc, hfont));
				g.ReleaseHdc(hdc);
			}

			size = gm.gmCellIncX;

			this.cachedList.Add(
				(c, style),
				(gl.Triangulate(pathes.ToArray()), size)
			);
		}
	}
}
