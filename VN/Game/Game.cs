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
			public delegate void EmptyHandler();
			public delegate void TitleHandler(string title, bool memorize);
			public delegate void ResizableHandler(bool resizable);
			public delegate void ResizeHandler(int width, int height);
			public delegate void MessageHandler(string message);

			public event EmptyHandler OnCenter;
			public event TitleHandler OnTitle;
			public event ResizableHandler OnResizable;
			public event ResizeHandler OnResize;
			public event MessageHandler OnMessage;
			public event EmptyHandler OnUpdate;
			public event EmptyHandler OnQuit;

			internal void InvokeCenter() => this.OnCenter?.Invoke();
			internal void InvokeTitle(string title, bool memorize = false) => this.OnTitle?.Invoke(title, memorize);
			internal void InvokeResizable(bool resizable) => this.OnResizable?.Invoke(resizable);
			internal void InvokeResize(int width, int height) => this.OnResize?.Invoke(width, height);
			internal void InvokeMessage(string message) => this.OnMessage?.Invoke(message);
			internal void InvokeUpdate() => this.OnUpdate?.Invoke();
			internal void InvokeQuit() => this.OnQuit?.Invoke();
		}

		// 싱글톤 패턴
		internal static Game Instance { get; } = new Game();

		public GL.GL gl { get; set; }
		private Lua lua { get; set; }
		public bool Running { get; private set; } = false;

		private Handler handler { get; set; }
		private event Handler.ResizeHandler ResizeHandler;

		internal MouseInfo Mouse { get; } = new MouseInfo();
		internal Queue<Point> ClickQueue { get; } = new Queue<Point>();

		internal Dictionary<int, GL.Image> ImageDict { get; } = new Dictionary<int, GL.Image>();
		internal Dictionary<int, GL.Font> FontDict { get; } = new Dictionary<int, GL.Font>();
		internal Dictionary<int, Audio> AudioDict { get; } = new Dictionary<int, Audio>();

		// private로 해야 new로 생성하는 것을 방지할 수 있음
		private Game() { }

		public void Initialize(Handler handler) {
			this.handler = handler;
			this.ResizeBuffer(640, 480);
		}
		public void Destroy() {
			foreach (var item in this.ImageDict) item.Value?.Dispose();
			this.ImageDict.Clear();

			foreach (var item in this.AudioDict) item.Value?.Dispose();
			this.AudioDict.Clear();

			this.lua?.Close();
			this.lua?.Dispose();
			this.lua = null;

			this.gl?.Dispose();
			this.gl = null;
		}

		public void Center() => this.handler.InvokeCenter();

		public void ResizeWindow(int width, int height) {
			this.ResizeHandler?.Invoke(width, height);
		}

		public void ResizeBuffer(int width, int height) {
			this.handler.InvokeResize(width, height);
			this.gl?.Resize(width, height).Flush().Clear();
		}

		public void UpdateTitle(string title, bool memory = false) => this.handler.InvokeTitle(title, memory);

		public void Update() {
			this.gl?.Flush().Render().Clear();
			this.handler.InvokeUpdate();
		}

		public void Fill(uint color) => this.gl.Fill(color);
		public void EnterSurface() => this.gl.Enter();
		public uint FlushSurface() => this.gl.Exit();

		public void Stop() {
			if (!this.Running) return;

			this.Running = false;

			if (this.lua != null) {
				this.lua.DebugHook += (sender, e) => {
					if (!this.Running)
						((Lua)sender).State.Error("");
				};
			}
		}

		public void Run(IntPtr hWnd) {
			this.gl = new GL.GL(hWnd);
			this.gl.Flush().Clear();
			this.ResizeHandler += (width, height) => {
				// this.gl?.Resize(width, height);
			};

			this.Running = true;

			this.lua = new Lua();
			this.lua.State.Encoding = Encoding.UTF8;

			var lastSource = "";
			this.lua.SetDebugHook(KeraLua.LuaHookMask.Line, 0);
			this.lua.DebugHook += (sender, e) => lastSource = e.LuaDebug.Source; // last source
#if DEBUG
			this.lua.UseTraceback = true;

			//var scriptDict = new Dictionary<string, string>();
			//this.lua.DebugHook += (sender, e) => {
			//	var filename = e.LuaDebug.Source;
			//	if (!scriptDict.ContainsKey(filename)) return;

			//	var lines = scriptDict[filename].Split(new char[] { '\n' });
			//	var code = lines[e.LuaDebug.CurrentLine - 1];
			//	System.Diagnostics.Debug.WriteLine(code);
			//};
#endif

			{ // LuaHelper.Register(this.lua, "import", ...)
				var state = this.lua.State;
				state.PushCFunction(pState => {
					var state = KeraLua.Lua.FromIntPtr(pState);
					var chunkName = lastSource;

					var filename = state.CheckString(1);
					var basedir = chunkName.Contains('/') ? Path.GetDirectoryName(chunkName) : "";
					var chunkPath = string.IsNullOrEmpty(basedir) ? filename : basedir + "/" + filename;
					var path = Path.Combine("..", "..", "VNData", "lua", chunkPath.Replace('/', '\\') + ".lua");
					if (!File.Exists(path)) {
						chunkPath += "/_";
						path = Path.Combine("..", "..", "VNData", "lua", chunkPath.Replace('/', '\\') + ".lua");
						if (!File.Exists(path))
							return state.Error($"Script \"{chunkPath}\" not found.");
					}

					var script = File.ReadAllText(path);
#if DEBUG
					//scriptDict[filename] = script;
#endif

					if (state.LoadString(script, chunkPath.Replace('\\', '/')) == KeraLua.LuaStatus.OK) {
						state.Call(0, -1);
						return 0;
					}
					else
						return state.Error($"Script \"{chunkPath}\" cannot be loaded.");
				});
				state.SetGlobal("import");
			}
			LuaHelper.Register(this.lua, "Bridge", new Bridge(this));

			try {
				this.lua.DoString("return import(\"script\")", "");
			}
			catch (ThreadAbortException) { }
			catch (Exception e) {
				if (this.Running)
					this.handler.InvokeMessage(e.Message);
			}
			finally {
				this.Destroy();
				this.handler.InvokeQuit();
			}
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
