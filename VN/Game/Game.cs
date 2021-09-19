using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing.Drawing2D;
using System.IO;
using System.Threading;
using System.Drawing.Imaging;
using System.Collections.Concurrent;
using NLua;
using System.Collections.ObjectModel;

namespace VN.Game {
	public class Game {
		private const int MaxFPS = 60;

		#region Fonts
		/// <summary>
		/// 텍스트 서체명
		/// </summary>
		private static string FontName { get; } = "맑은 고딕";

		/// <summary>
		/// 텍스트 서체 스타일
		/// </summary>
		private static FontStyle FontStyle { get; } = FontStyle.Bold;

		/// <summary>
		/// 텍스트 크기
		/// </summary>
		private static float FontSize { get; } = 20.0f;

		/// <summary>
		/// 서체명과 크기로 조합된 폰트
		/// </summary>
		private static Font Font { get; } = new Font(Game.FontName, Game.FontSize, Game.FontStyle);

		/// <summary>
		/// 텍스트 색상
		/// </summary>
		private static Color FontColor { get; } = Color.White;

		/// <summary>
		/// 텍스트 테두리 색상
		/// </summary>
		private static Color FontStrokeColor { get; } = Color.Black;

		private static float FontStrokeWidth { get; } = 3.0f;
		#endregion

		/// <summary>
		/// 엔진을 사용하는 창에서 제어할 핸들러
		/// </summary>
		public class Handler {
			public delegate void CenterHandler();
			public delegate void TitleHandler(string title);
			public delegate void ResizableHandler(bool resizable);
			public delegate void ResizeHandler(int width, int height);

			public event CenterHandler OnCenterRequest;
			public event TitleHandler OnTitleRequest;
			public event ResizableHandler OnResizableRequest;
			public event ResizeHandler OnResizeRequest;

			internal void InvokeCenter() => this.OnCenterRequest?.Invoke();
			internal void InvokeTitle(string title) => this.OnTitleRequest?.Invoke(title);
			internal void InvokeResizable(bool resizable) => this.OnResizableRequest?.Invoke(resizable);
			internal void InvokeResize(int width, int height) => this.OnResizeRequest?.Invoke(width, height);
		}

		// 싱글톤 패턴
		internal static Game Instance { get; } = new Game();

		internal Lua lua { get; set; }

		private Handler handler { get; set; }

		private Thread VMThread { get; set; }

		internal MouseInfo Mouse { get; } = new MouseInfo();
		internal Queue<Point> ClickQueue { get; } = new Queue<Point>();

		private SurfaceManager[] Buffers { get; set; } = new SurfaceManager[2];
		private int BufferCursor { get; set; } = 0;

		public object BufferLocker { get; } = new object();
		public Surface CurrentBuffer { get; private set; }

		public Graphics Graphics => this.Buffers[this.BufferCursor].Peek().g;

		internal Dictionary<int, VImage> ImageDictionary { get; } = new Dictionary<int, VImage>();


		// private로 해야 new로 생성하는 것을 방지할 수 있음
		private Game() { }

		public void Initialize(Handler handler) {
			this.handler = handler;

			this.ResizeBuffer(320, 180);
		}

		public void Center() => this.handler.InvokeCenter();

		public void ResizeBuffer(int width, int height) {
			this.handler.InvokeResize(width, height);

			lock (this.BufferLocker) {
				for (var i = 0; i < this.Buffers.Length; i++) {
					if (this.Buffers[i] == null)
						this.Buffers[i] = new SurfaceManager(width, height);
					else
						this.Buffers[i].Resize(width, height);

					this.Buffers[i].Push();
				}
			}
			this.NextBuffer();
		}

		public void UpdateTitle(string title) => this.handler.InvokeTitle(title);

		private void NextBuffer() {
			lock (this.BufferLocker)
				this.CurrentBuffer = this.Buffers[this.BufferCursor][0];

			this.BufferCursor = (this.BufferCursor + 1) % this.Buffers.Length;

			this.Buffers[this.BufferCursor].Clear(1);
			// 잔여 Surface 정리
			this.Graphics.Clear(Color.Black);
		}

		public void Update() {
			//var cur = this.Buffers[this.BufferCursor];
			//while (cur.Count > 1)
			//	cur.Pop().Flush(this.Graphics);

			//this.NextBuffer();
		}

		public void EnterSurface() => this.Buffers[this.BufferCursor].Push();
		public void FlushSurface(float opacity) => this.Buffers[this.BufferCursor].Pop().Flush(this.Graphics, opacity);

		public void Run() {
			this.VMThread = new Thread(() => {
				this.lua = new Lua();
				this.lua.State.Encoding = Encoding.UTF8;
#if DEBUG
				this.lua.UseTraceback = true;
#endif

				lua["Bridge"] = new Bridge(this);
				lua["import"] = new Func<string, object[]>(filename => {
					var script = File.ReadAllText(Path.Combine("..", "..", "VNData", "lua", filename + ".lua"));
					return lua.DoString(script, filename);
				});
				var output = lua.DoString("return import(\"script\")");

				this.VMThread = null;
			});
			this.VMThread.Start();
		}

		public void Destroy() {
			this.VMThread?.Abort();
			this.VMThread?.Join();

			this.lua?.Dispose();
			this.lua = null;
		}

		/// <summary>
		/// 마우스 상태를 입력
		/// </summary>
		/// <param name="X">마우스 X</param>
		/// <param name="Y">마우스 Y</param>
		/// <param name="State">마우스 상태 (0: 없음, 1: 좌클릭, 2: 우클릭)</param>
		public void MouseInput(int X, int Y, int State) {
			this.Mouse.X = X;
			this.Mouse.Y = Y;
			this.Mouse.State = State;
		}

		/// <summary>
		/// 마우스 클릭을 입력
		/// </summary>
		/// <param name="X">마우스 X</param>
		/// <param name="Y">마우스 Y</param>
		public void MouseClick(int X, int Y) => this.ClickQueue.Enqueue(new Point(X, Y));

		internal void DrawStrokedString(Graphics g, string Text, Rectangle layoutRect) {
			var family = Game.Font.FontFamily; // 서체

			using var path = new GraphicsPath();
			using var brush = new SolidBrush(Game.FontColor); // 텍스트 내용 색상
			using var pen = new Pen(Game.FontStrokeColor, Game.FontStrokeWidth); // 텍스트 테두리 색상

			path.AddString(Text, family, (int)Game.FontStyle, Game.FontSize, layoutRect, StringFormat.GenericDefault);
			g.DrawPath(pen, path);
			g.FillPath(brush, path);
		}
	}
}
