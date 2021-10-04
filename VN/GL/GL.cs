using SharpGL;
using SharpGL.Enumerations;

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

using Marshal = System.Runtime.InteropServices.Marshal;
using MultisampleNativeRenderContext =  SharpGL.RenderContextProviders.MultisampleNativeRenderContext;

namespace VN.GL {
	public sealed class GL : IDisposable {
		private IntPtr context { get; set; } // WGL Context
		private IntPtr dc { get; set; } // WGL HDC
		private OpenGL gl { get; set; }

		public int Width { get; private set; }
		public int Height { get; private set; }

		private Stack<Surface> FrameBufferStack { get; } = new Stack<Surface>();

		public GL(IntPtr hWnd) {
			var w = Math.Max(1, this.Width);
			var h = Math.Max(1, this.Height);

			this.gl = new OpenGL();
			// this.gl.Create(SharpGL.Version.OpenGLVersion.OpenGL2_1, RenderContextType.NativeWindow, w, h, 32, (object)hWnd);
			{
				// RenderContext를 MultisampleNativeRenderContext로 사용하기 위해 Reflection 이용
				var type = typeof(OpenGL);
				var field = type.GetField("renderContextProvider", BindingFlags.NonPublic | BindingFlags.Instance);

				field.SetValue(this.gl, new MultisampleNativeRenderContext());
				(field.GetValue(this.gl) as MultisampleNativeRenderContext).Create(SharpGL.Version.OpenGLVersion.OpenGL2_1, this.gl, w, h, 32, (object)hWnd);
			}

			this.gl.Disable(OpenGL.GL_CULL_FACE);
			this.gl.Enable(OpenGL.GL_MULTISAMPLE);
			this.gl.ShadeModel(OpenGL.GL_SMOOTH);

			this.Clear();
		}

		public void Dispose() {
			if (this.dc == IntPtr.Zero || this.context == IntPtr.Zero) return;

			Win32.wglMakeCurrent(this.dc, IntPtr.Zero);
			Win32.wglDeleteContext(this.context);

			Win32.DeleteDC(this.dc);
			this.dc = this.context = IntPtr.Zero;
		}

		public GL Resize(int width, int height) {
			if (height == 0) height = 1;

			this.gl.SetDimensions(width, height);
			this.gl.Viewport(0, 0, width, height);

			this.gl.MatrixMode(MatrixMode.Projection);
			this.gl.LoadIdentity();
			this.gl.Ortho(0, width, height, 0, -1, 1);

			this.gl.MatrixMode(MatrixMode.Modelview);
			this.gl.LoadIdentity();

			this.gl.Enable(OpenGL.GL_BLEND);
			this.gl.BlendFunc(BlendingSourceFactor.SourceAlpha, BlendingDestinationFactor.OneMinusSourceAlpha);
			this.gl.BlendEquation(OpenGL.GL_FUNC_ADD_EXT);
			this.gl.Disable(OpenGL.GL_LIGHTING);
			this.gl.Disable(OpenGL.GL_DEPTH_TEST);

			this.Width = width;
			this.Height = height;

			return this;
		}

		public GL Flush() {
			if (this.dc == IntPtr.Zero) return this;

			while (this.FrameBufferStack.Count > 0)
				this.Exit(1);

			this.gl.Flush();
			return this;
		}

		public GL Render() {
			this.gl.MakeCurrent();
			this.gl.Blit(IntPtr.Zero);
			return this;
		}

		public GL Clear() {
			this.gl.ClearColor(0, 0, 0, 0);
			this.gl.Clear(OpenGL.GL_COLOR_BUFFER_BIT);
			return this;
		}

		public uint Texture(int width, int height, IntPtr data) {
			var tex = new uint[1];
			this.gl.GenTextures(1, tex);

			var id = tex[0];
			if (id == 0) return 0;

			this.gl.BindTexture(OpenGL.GL_TEXTURE_2D, id);
			this.gl.TexImage2D(OpenGL.GL_TEXTURE_2D, 0, OpenGL.GL_RGBA, width, height, 0, OpenGL.GL_BGRA, OpenGL.GL_UNSIGNED_BYTE, data);
			return id;
		}
		public GL Untexture(uint id) {
			var tex = new uint[1] { id };
			this.gl.DeleteTextures(1, tex);
			return this;
		}

		public GL DrawImage(Image image, double srcX, double srcY, double srcWidth, double srcHeight, double x, double y, double width, double height, double originX, double originY, double opacity, double angle) {
			if (image.textureId == 0) return this;

			this.gl.Enable(OpenGL.GL_TEXTURE_2D);

			this.gl.Color(1, 1, 1, opacity);
			this.gl.BindTexture(OpenGL.GL_TEXTURE_2D, image.textureId);
			this.gl.TexParameter(OpenGL.GL_TEXTURE_2D, OpenGL.GL_TEXTURE_MAG_FILTER, OpenGL.GL_LINEAR);
			this.gl.TexParameter(OpenGL.GL_TEXTURE_2D, OpenGL.GL_TEXTURE_MIN_FILTER, OpenGL.GL_LINEAR);

			this.gl.PushMatrix();
			this.gl.LoadIdentity();

			// offset, size
			if (x != 0 || y != 0)
				this.gl.Translate(x, y, 0.0);

			//if (srcWidth != width || srcHeight != height)
			//	this.gl.Scale(width / srcWidth, height / srcHeight, 0.0);

			// Rotate
			if (angle != 0) {
				this.gl.Translate(originX, originY, 0.0);
				this.gl.Rotate(angle, 0.0, 0.0, 1.0);
				this.gl.Translate(-originX, -originY, 0.0);
			}

			this.gl.Begin(OpenGL.GL_TRIANGLE_FAN);

			var left = srcX / image.width;
			var top = srcY / image.height;
			var right = (srcX + srcWidth) / image.width;
			var bottom = (srcY + srcHeight) / image.height;

			// left top
			this.gl.TexCoord(left, top);
			this.gl.Vertex(0, 0);

			// left bottom
			this.gl.TexCoord(left, bottom);
			this.gl.Vertex(0, height);

			// right bottom
			this.gl.TexCoord(right, bottom);
			this.gl.Vertex(width, height);

			// right top
			this.gl.TexCoord(right, top);
			this.gl.Vertex(width, 0);

			this.gl.End();
			this.gl.PopMatrix();

			return this;
		}

		public GL Fill(uint color) {
			this.gl.Disable(OpenGL.GL_TEXTURE_2D);

			var a = ((color >> 24) & 0xFF) / 255f;
			var r = ((color >> 16) & 0xFF) / 255f;
			var g = ((color >> 8) & 0xFF) / 255f;
			var b = ((color >> 0) & 0xFF) / 255f;

			this.gl.Color(r, g, b, a);

			this.gl.PushMatrix();
			this.gl.LoadIdentity();

			this.gl.Begin(OpenGL.GL_TRIANGLE_FAN);

			this.gl.Vertex(0, 0);
			this.gl.Vertex(0, this.Height);
			this.gl.Vertex(this.Width, this.Height);
			this.gl.Vertex(this.Width, 0);

			this.gl.End();
			this.gl.PopMatrix();

			return this;
		}
		public GL Enter() {
			var fb = new uint[1];
			var rb = new uint[1];
			var tex = new uint[1];

			this.gl.GenTextures(1, tex);
			this.gl.BindTexture(OpenGL.GL_TEXTURE_2D, tex[0]);
			this.gl.TexParameter(OpenGL.GL_TEXTURE_2D, OpenGL.GL_TEXTURE_MAG_FILTER, OpenGL.GL_LINEAR);
			this.gl.TexParameter(OpenGL.GL_TEXTURE_2D, OpenGL.GL_TEXTURE_MIN_FILTER, OpenGL.GL_LINEAR);
			this.gl.TexImage2D(OpenGL.GL_TEXTURE_2D, 0, OpenGL.GL_RGBA, this.Width, this.Height, 0, OpenGL.GL_BGRA, OpenGL.GL_UNSIGNED_BYTE, IntPtr.Zero);

			this.gl.GenFramebuffersEXT(1, fb);
			this.gl.BindFramebufferEXT(OpenGL.GL_FRAMEBUFFER_EXT, fb[0]);
			this.gl.FramebufferTexture2DEXT(OpenGL.GL_FRAMEBUFFER_EXT, OpenGL.GL_COLOR_ATTACHMENT0_EXT, OpenGL.GL_TEXTURE_2D, tex[0], 0);

			//this.gl.GenRenderbuffersEXT(1, rb);
			//this.gl.BindRenderbufferEXT(OpenGL.GL_RENDERBUFFER_EXT, rb[0]);
			//this.gl.RenderbufferStorageEXT(OpenGL.GL_RENDERBUFFER_EXT, OpenGL.GL_DEPTH_COMPONENT24, this.Width, this.Height);
			//this.gl.FramebufferRenderbufferEXT(OpenGL.GL_FRAMEBUFFER_EXT, OpenGL.GL_DEPTH_ATTACHMENT_EXT, OpenGL.GL_RENDERBUFFER_EXT, rb[0]);

			this.gl.BindFramebufferEXT(OpenGL.GL_FRAMEBUFFER_EXT, fb[0]);
			this.gl.ClearColor(0, 0, 0, 0);
			this.gl.Clear(OpenGL.GL_COLOR_BUFFER_BIT);

			this.gl.Enable(OpenGL.GL_BLEND);
			// this.gl.BlendFunc(OpenGL.GL_SRC_ALPHA, OpenGL.GL_ONE_MINUS_SRC_ALPHA);
			this.gl.BlendFuncSeparate(OpenGL.GL_SRC_ALPHA, OpenGL.GL_ONE_MINUS_SRC_ALPHA, OpenGL.GL_ONE, OpenGL.GL_ONE_MINUS_SRC_ALPHA);
			this.gl.Disable(OpenGL.GL_LIGHTING);
			this.gl.Disable(OpenGL.GL_DEPTH_TEST);

			this.FrameBufferStack.Push(new Surface(fb[0], rb[0], tex[0]));
			return this;
		}
		public GL Exit(float opacity) {
			if (this.FrameBufferStack.Count <= 0) return this;

			var b = this.FrameBufferStack.Pop();
			if (this.FrameBufferStack.Count > 0)
				this.gl.BindFramebufferEXT(OpenGL.GL_FRAMEBUFFER_EXT, this.FrameBufferStack.Peek().framebuffer);
			else {
				this.gl.BindFramebufferEXT(OpenGL.GL_FRAMEBUFFER_EXT, 0);
				this.gl.BlendFunc(OpenGL.GL_SRC_ALPHA, OpenGL.GL_ONE_MINUS_SRC_ALPHA);
			}

			this.DrawImage(
				new Image(b.texture, this.Width, -this.Height),
				0, 0, this.Width, this.Height,
				0, 0, this.Width, this.Height,
				0, 0,
				opacity, 0
			);

			var _tex = new uint[1] { b.texture };
			this.gl.DeleteTextures(1, _tex);

			//var _rb = new uint[1] { b.renderbuffer };
			//this.gl.DeleteRenderbuffersEXT(1, _rb);

			var _fb = new uint[1] { b.framebuffer };
			this.gl.DeleteFramebuffersEXT(1, _fb);

			return this;
		}

		public GL RunList(uint id) {
			this.gl.CallList(id);
			return this;
		}
		public GL RunList(uint[] ids) {
			this.gl.CallLists(ids.Length, ids);
			return this;
		}
		public GL Unlist(uint id) {
			this.gl.DeleteLists(id, 1);
			return this;
		}
		public uint Triangulate(PointF[][] pathes) {
			var id = this.gl.GenLists(1);
			var tess = this.gl.NewTess();

			this.gl.PolygonMode(FaceMode.FrontAndBack, PolygonMode.Filled);
			this.gl.TessProperty(tess, (int)OpenGL.GLU_TESS_WINDING_RULE, OpenGL.GLU_TESS_WINDING_POSITIVE);

			this.gl.TessCallback(tess, (Tess.Delegates.Begin)(mode => this.gl.Begin(mode)));
			this.gl.TessCallback(tess, () => this.gl.End()); // End
			this.gl.TessCallback(tess, data => this.gl.Vertex(data[0], data[1]));
			this.gl.TessCallback(tess, (double[] coords, double[] vertexData, float[] weight, out double[] outData) => outData = coords);
			this.gl.TessCallback(tess, (Tess.Delegates.Error)(code => {
				// Error?
				throw new Exception($"Tess error - {code}");
			}));

			this.gl.NewList(id, OpenGL.GL_COMPILE);
			this.gl.TessBeginPolygon(tess, IntPtr.Zero);

			foreach (var points in pathes) {
				this.gl.TessBeginContour(tess);

				foreach (var pt in points) {
					var vert = new double[3];
					vert[0] = pt.X;
					vert[1] = pt.Y;
					this.gl.TessVertex(tess, vert, vert);
				}

				this.gl.TessEndContour(tess);
			}
			this.gl.TessEndPolygon(tess);
			this.gl.EndList();

			this.gl.DeleteTess(tess);

			return id;
		}

		public GL Push(Action callback) {
			this.gl.PushMatrix();
			callback();
			this.gl.PopMatrix();
			return this;
		}

		public GL Translate(double X, double Y) {
			this.gl.Translate(X, Y, 0);
			return this;
		}
		public GL Scale(double X, double Y) {
			this.gl.Scale(X, Y, 0);
			return this;
		}
		public GL Color(float r, float g, float b, float a) {
			this.gl.Color(r, g, b, a);
			return this;
		}
		public GL Tex(bool Use) {
			if (Use)
				this.gl.Enable(OpenGL.GL_TEXTURE_2D);
			else
				this.gl.Disable(OpenGL.GL_TEXTURE_2D);

			return this;
		}
	}
}
