﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing.Drawing2D;
using System.IO;
using System.Threading;
using System.Drawing.Imaging;

namespace VN.Game {
	using VNSPack = VNScript.Compiler.VNSP.VNSPack;
	using VM = VNScript.VM.VM;
	using VMValue = VNScript.VM.VMValue;
	using VMValueType = VNScript.VM.VMValueType;

	public class Game {
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
		/// 한 글자당 몇 msec으로 그려지는지에 대한 시간
		/// </summary>
		private static int TextSpeed { get; } = 100;

		/// <summary>
		/// 엔진을 사용하는 창에서 제어할 핸들러
		/// </summary>
		public class Handler {
			public delegate void TitleHandler(string title);
			public delegate void ResizableHandler(bool resizable);
			public delegate void ResizeHandler(double width, double height);
			public delegate void MarginTypeHandler(MarginType margin);

			public event TitleHandler OnTitleRequest;
			public event ResizableHandler OnResizableRequest;
			public event ResizeHandler OnResizeRequest;
			public event MarginTypeHandler OnMarginTypeRequest;

			internal void InvokeTitle(string title) => this.OnTitleRequest?.Invoke(title);
			internal void InvokeResizable(bool resizable) => this.OnResizableRequest?.Invoke(resizable);
			internal void InvokeResize(double width, double height) => this.OnResizeRequest?.Invoke(width, height);
			internal void InvokeMarginType(MarginType margin) => this.OnMarginTypeRequest?.Invoke(margin);
        }

		public Image nameBox = Image.FromFile(Path.Combine("VNData", "UI", "nameBox.png"));
		class UIImages {
		
			public Image dialogueBox = Image.FromFile(Path.Combine("VNData", "UI", "dialogueBox.png"));
			public Image historyIcon = Image.FromFile(Path.Combine("VNData", "UI", "historyIcon.png"));
			public Image autoIcon = Image.FromFile(Path.Combine("VNData", "UI", "autoIcon.png"));
			public Image saveIcon = Image.FromFile(Path.Combine("VNData", "UI", "saveIcon.png"));
			public Image loadIcon = Image.FromFile(Path.Combine("VNData", "UI", "loadIcon.png"));
			public Image uiIcon = Image.FromFile(Path.Combine("VNData", "UI", "uiIcon.png"));
			public Image stopIcon = Image.FromFile(Path.Combine("VNData", "UI", "stopIcon.png"));
			public Image settingIcon = Image.FromFile(Path.Combine("VNData", "UI", "settingIcon.png"));
			public Image nextIcon = Image.FromFile(Path.Combine("VNData", "UI", "nextIcon.png"));
		}

		// 싱글톤 패턴
		internal static Game Instance { get; } = new Game();

		private VNSPack Pack { get; set; }
		private VM VM { get; set; }

		private Handler handler { get; set; }

		/// <summary>
		/// <see langword="lock" /> 객체
		/// </summary>
		private object Sync { get; } = new object();

		/// <summary>
		/// 화면 캔버스 크기 (원본 크기)
		/// </summary>
		private Size canvasSize { get; set; }

		private Thread VMThread { get; set; }

		/// <summary>
		/// 현재 스크립트가 진행되지 않고 있는지 여부
		/// </summary>
		public bool Blocked { get; private set; }

		private long textStartTime { get; set; } // 대사 출력 기준 시간

		/// <summary>
		/// UI를 감출지 여부
		/// </summary>
		public bool UIHide { get; set; }

		/// <summary>
		/// 해금된 화자 이름 목록
		/// </summary>
		private List<string> Tellers { get; } = new List<string>();

		private Audio BGM { get; } = new Audio();

		private GameState CurrentState { get; } = new GameState();
		private GameState FreezedState { get; set; }
		private GameTransition Transition { get; set; }

		public bool UnblockReady {
			get {
				if (this.CurrentState.Message == null) return true;

				var elapsed = DateTime.Now.Ticks - this.textStartTime; // 대사가 시작되고 지난 시간

				// 대사 전체를 표시할 때 걸리는 시간 (Ticks)
				var totalTime = this.CurrentState.Message.Length * Game.TextSpeed * TimeSpan.TicksPerMillisecond;

				return elapsed >= totalTime;
			}
		}

		// private로 해야 new로 생성하는 것을 방지할 수 있음
		private Game() { }

		public void Initialize(Handler handler) {
			this.handler = handler;

			var compiled = Path.Combine("VNData", "script.vnc");
			this.Pack = new VNSPack(File.ReadAllBytes(compiled));
			this.VM = new VM();

			this.VM.Register("GameTitle", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - GameTitle의 인자는 1개여야합니다.");
				this.handler.InvokeTitle(args[0].AsString(storage));
				return VMValue.Null();
			});
			this.VM.Register("GameSize", (args, storage) => {
				if (args.Length != 2) throw new Exception("VN RuntimeError - GameSize의 인자는 2개여야합니다.");

				var width = args[0].AsNumber(storage);
				var height = args[1].AsNumber(storage);

				this.canvasSize = new Size((int)width, (int)height);
				this.handler.InvokeResize(width,height );
				return VMValue.Null();
			});
			this.VM.Register("GameResizable", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - GameResizable의 인자는 2개여야합니다.");
				this.handler.InvokeResizable(args[0].AsBoolean(storage));
				return VMValue.Null();
			});
			this.VM.Register("GameMargin", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - GameMargin의 인자는 1개여야합니다.");

				var type = args[0].AsString(storage);
				MarginType marginType;
				if (!Enum.TryParse<MarginType>(type, out marginType))
					throw new Exception("VN RuntimeError - GameMargin의 인자는 MarginType 중 하나여야합니다.");

				this.handler.InvokeMarginType(marginType);
				return VMValue.Null();
			});

			this.VM.Register("Script", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - Script의 인자는 1개여야합니다.");

				var script = args[0].AsString(storage);
				this.VM.Load(this.Pack.Codes.First(x => x.CodeName == script));

				return VMValue.String(script);
			});

			this.VM.Register("UnlockName", (args, storage) => {
				lock (this.Sync) {
					foreach (var arg in args.Select(x => x.AsString(storage))) {
						if (this.Tellers.Contains(arg)) continue;
						this.Tellers.Add(arg);
					}
				}

				return VMValue.Null();
			});

			this.VM.Register("Selection", (args, storage) => {
				var sels = args.Select(x => x.AsString(storage));
				// TODO

				this.Blocked = true;
				while (this.Blocked)
					Thread.Sleep(100);

				return VMValue.Number(0);
			});
			this.VM.Register("Text", (args, storage) => {
				if (args.Length <= 0) throw new Exception("VN RuntimeError - Text의 인자는 1개 이상이어야합니다.");
				var text = string.Join("\n", args.Select(x => x.AsString(storage)));

				this.textStartTime = DateTime.Now.Ticks;
				this.CurrentState.TellerName = null;
				this.CurrentState.Message = text;

				this.Blocked = true;
				while (this.Blocked) Thread.Sleep(10);

				return VMValue.Null();
			});
			this.VM.Register("Say", (args, storage) => {
				if (args.Length <= 1) throw new Exception("VN RuntimeError - Say의 인자는 2개 이상이어야합니다.");
				var teller = args[0].AsString(storage);
				var text = string.Join("\n", args.Skip(1).Select(x => x.AsString(storage)));

				this.textStartTime = DateTime.Now.Ticks;
				this.CurrentState.TellerName = teller;
				this.CurrentState.Message = text;

				this.Blocked = true;
				while (this.Blocked) Thread.Sleep(10);

				return VMValue.Null();
			});
			this.VM.Register("Untext", (args, storage) => {
				if (args.Length != 0) throw new Exception("VN RuntimeError - Transition의 인자는 0개여야합니다.");

				this.CurrentState.TellerName = null;
				this.CurrentState.Message = null;

				return VMValue.Null();
			});

			this.VM.Register("BGM", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - BGM의 인자는 1개여야합니다.");
				var bgm = args[0].AsString(storage);

				lock (this.Sync) {
					this.BGM.Load(
						Path.Combine("VNData", "BGM", bgm + ".mp3"),
						true
					);
					this.BGM.Play();
				}
				return VMValue.Null();
			});
			this.VM.Register("BG", (args, storage) => {
				if(args.Length != 1) throw new Exception("VN RuntimeError - BG의 인자는 1개여야합니다.");

				var arg = args[0];
				if(arg.Type == VMValueType.Null) {
					lock (this.Sync) {
						this.CurrentState.BG?.Dispose();
						this.CurrentState.BG = null;
					}
				}else {
					var bg = arg.AsString(storage);
					lock(this.Sync) {
						this.CurrentState.BG?.Dispose();
						this.CurrentState.BG = Image.FromFile(
							Path.Combine("VNData", "BG", bg + ".png")
						);
					}
				}
				return VMValue.Null();
			});
			this.VM.Register("SCG", (args, storage) => {
				if (args.Length < 2 || args.Length > 3) throw new Exception("VN RuntimeError - SCG의 인자는 2개 또는 3개여야합니다.");

				var idx = args[0].AsInteger(storage);
				var file = args[1].AsString(storage);
				var pos = args.Length == 2
					? 0.5
					: args[2].AsNumber(storage);

				lock (this.Sync) {
					if (this.CurrentState.Images.ContainsKey(idx)) {
						this.CurrentState.Images[idx]?.Dispose();
						this.CurrentState.Images.Remove(idx);
					}
					this.CurrentState.Images[idx] = new GameImage(
						Image.FromFile(
							Path.Combine("VNData", "SCG", file + ".png")
						),
						pos
					);
				}
				return VMValue.Null();
			});

			this.VM.Register("Freeze", (args, storage) => {
				if (args.Length != 0) throw new Exception("VN RuntimeError - Transition의 인자는 0개여야합니다.");
				if (this.FreezedState != null) throw new Exception("VN RuntimeError - 이미 얼어있습니다.");

				lock (this.Sync)
					this.FreezedState = this.CurrentState.Clone();

				return VMValue.Null();
			});
			this.VM.Register("Transition", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - Transition의 인자는 1개여야합니다.");

				var dur = args[0].AsNumber(storage);
				lock (this.Sync)
					this.Transition = new GameTransition(dur);

				var freezed = true;
				do {
					lock (this.Sync)
						freezed = this.FreezedState != null;
				} while (freezed);

				return VMValue.Null();
			});

			FX.Register(this.VM);

			this.VM.Storage.Set(-1, "$Startup", VMValue.String("Game"));

			this.VM.Load(this.Pack.Codes.First(x => x.CodeName == "init"));
			this.VM.Run();
		}

		public void Run() {
			this.VMThread = new Thread(() => {
				this.VM.Load(
					this.Pack.Codes
						.First(x => x.CodeName == this.VM.Storage
							.Get("$Startup").Value
							.AsString(this.VM.Storage)
						)
				);
				this.VM.Run();

				this.VMThread = null;
			});
			this.VMThread.Start();
		}

		public void Destroy() {
			if(this.FreezedState!=null) {
				this.FreezedState.Dispose();
				this.FreezedState = null;
			}
			this.CurrentState.Dispose();

			this.BGM.Dispose();

			this.VMThread?.Abort();

			this.VM = null;
			this.Pack = null;
		}

		/// <summary>
		/// 대사, 서사에서 Block된 상태를 해제 (다음 스크립트로 진행)
		/// </summary>
		public void Unblock() {
			lock(this.Sync) this.Blocked = false;
		}

		/// <summary>
		/// 표시중인 대사를 즉시 전부 표시
		/// </summary>
		public void InstantText() {
			this.textStartTime = 0;
		}

		/// <summary>
		/// 화면에 그리기 위한 렌더 사이클 본문 (매 프레임 Clear된 상태로 호출됨)
		/// </summary>
		/// <param name="g"><see cref="Graphics"/> 객체</param>
		public void Render(Graphics g) {
			if (this.VM == null) return;

			GameState current, freezed;
			lock (this.Sync) {
				current = this.CurrentState;
				freezed = this.FreezedState;
			}

			if (freezed != null) { // Freeze된 화면이 있는 경우
				this.Render(g, freezed);

				GameTransition transition;
				lock (this.Sync) transition = this.Transition;

				if (transition != null) {
					using var buffer = new Bitmap(this.canvasSize.Width, this.canvasSize.Height, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
					using var _g = Graphics.FromImage(buffer);
					_g.Clear(Color.Black);

					this.Render(_g, current);
					this.DrawImageAlpha(g, buffer, (float)transition.Progress);

					if (transition.Progress >= 1) {
						lock (this.Sync) {
							this.Transition = null;

							this.FreezedState.Dispose();
							this.FreezedState = null;
						}
					}
				}
			}
			else
				this.Render(g, current);
		}

		/// <summary>
		/// 실제 버퍼에 화면을 그리는 작업을 하는 함수, <see cref="GameState"/> 상태 기준으로 그림
		/// </summary>
		/// <param name="g"><see cref="Graphics"/> 객체</param>
		/// <param name="state">화면을 그릴 때 사용될 <see cref="GameState"/> 객체</param>
		private void Render(Graphics g, GameState state) {
			var textboxLayout = new Rectangle(
				(this.canvasSize.Width / 12 * 1),
				(this.canvasSize.Height / 12 * 8),
				(this.canvasSize.Width / 12 * 7	),
				(this.canvasSize.Height / 12 * 4)
			);
			
			// 배경 이미지 그리기
			lock (this.Sync) {
				if (state.BG != null)
					g.DrawImage(state.BG, 0, 0, canvasSize.Width, canvasSize.Height);
			}

			// 캐릭터 그리기
			{
				GameImage[] images;

				lock (this.Sync)
					images = state.Images.Values.ToArray();

				foreach (var image in images) {
					var img = image.Image;
					var rect = new Rectangle(
						(int)((canvasSize.Width * image.X) - (img.Width * image.X)), // 전체 영역에서 X% 위치로
						(int)((canvasSize.Height * 0.8) - (img.Height /* * 1.0 */)), // 전체 높이의 80% 위치에서 "서있게"
						img.Width,
						img.Height 
					);

					g.DrawImage(img, rect, new Rectangle(0, 0, img.Width, img.Height), GraphicsUnit.Pixel);
				}
			}

			// 만약 마우스 오른쪽 버튼(혹은 UI숨김 버튼)을 누르지 않으면 UI, 대사 출력
			if (!this.UIHide) {
				
				DrawUIIcons(g);		//	다양한 아이콘들 출력

				if (state.TellerName != null) {
					string name;

					lock (this.Sync) {
						name = this.Tellers.Contains(state.TellerName)
							? state.TellerName
							: "???";
					}
					
					g.DrawImage(nameBox, 537, 290, nameBox.Width * 3 / 4, nameBox.Height * 3 / 4);	// 캐릭터 이름 출력될 때 같이 출력

					// 캐릭터의 이름 출력
					this.DrawStrokedString(g, name, new Rectangle(
						textboxLayout.Left * 9,		// 대략 580
						textboxLayout.Top - (int)Game.FontSize + 14,
						textboxLayout.Width,
						(int)Game.FontSize
					));
				}
				
				if (state.Message != null) {
					var elapsed = (DateTime.Now.Ticks - this.textStartTime) / TimeSpan.TicksPerMillisecond; // 대사가 시작되고 지난 시간
					var length = (int)Math.Min(state.Message.Length, elapsed / Game.TextSpeed);
					
					var subMessage = state.Message.Substring(0, length);
					this.DrawStrokedString(g, subMessage, textboxLayout);
				}
			}
		}

		private void DrawStrokedString(Graphics g, string Text, Rectangle layoutRect) {
			var family = Game.Font.FontFamily; // 서체

			using var path = new GraphicsPath();
			using var brush = new SolidBrush(Game.FontColor); // 텍스트 내용 색상
			using var pen = new Pen(Game.FontStrokeColor, Game.FontStrokeWidth); // 텍스트 테두리 색상

			path.AddString(Text, family, (int)Game.FontStyle, Game.FontSize, layoutRect, StringFormat.GenericDefault);
			g.DrawPath(pen, path);
			g.FillPath(brush, path);
		}
		private void DrawImageAlpha(Graphics g, Image image, float alpha) {
			var matrix = new ColorMatrix();
			matrix.Matrix33 = alpha; // Alpha

			var imgAttr = new ImageAttributes();
			imgAttr.SetColorMatrix(matrix);
			g.DrawImage(
				image,
				new Rectangle(Point.Empty, image.Size),
				0, 0, image.Width, image.Height,
				GraphicsUnit.Pixel, imgAttr
			);
		}

		private void DrawUIIcons(Graphics g) {
			UIImages uis = new UIImages();
			/*
			int uiWidth = uis.historyIcon.Width * 2 / 3 = 86
			int uiHeight = uis.historyIcon.Height * 2 / 3 = 29
			*/
			g.DrawImage(uis.nextIcon, 593, 413, uis.nextIcon.Width * 3 / 4, uis.nextIcon.Height * 3 / 4);
			g.DrawImage(uis.dialogueBox, 50, 290, 600, 150);
			g.DrawImage(uis.historyIcon, 660, 290, 86, 29);
			g.DrawImage(uis.autoIcon, 660, 320, 86, 29);
			g.DrawImage(uis.saveIcon, 660, 350, 86, 29);
			g.DrawImage(uis.loadIcon, 660, 380, 86, 29);
			g.DrawImage(uis.uiIcon, 660, 410, 86, 29);

			/*
			int uiWidth2 = uis.stopIcon.Width * 2 / 3 = 46
			int uiHeight2 = uis.stopIcon.Height * 2 / 3 = 29
			*/
			g.DrawImage(uis.stopIcon, 740, 20, 46, 29);
			g.DrawImage(uis.settingIcon, 740, 55, 46, 29);
			g.DrawImage(uis.nextIcon, 593, 413, 57, 29);
		}
	}
}
