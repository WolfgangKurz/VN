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

		// 싱글톤 패턴
		internal static Game Instance { get; } = new Game();

		private long CurrentFrame = 0;

		private VNSPack Pack { get; set; }
		private VM VM { get; set; }
		private ConcurrentQueue<string> LoadQueue { get; } = new ConcurrentQueue<string>();

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
		/// UI 상태
		/// </summary>
		internal UIState UIState { get; set; }
		public bool UIDisplaying { get; set; }

		private Sprite UISprite { get; set; }

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

			this.UISprite = new Sprite(
				Image.FromFile(Path.Combine("VNData", "IMG", "UI.png")),
				new Sprite.SpriteInfo[] {
					new Sprite.SpriteInfo("in_history_1_1", 1486, 579, 84, 26),
					new Sprite.SpriteInfo("in_history_1_2", 1658, 242, 20, 22),
					new Sprite.SpriteInfo("in_history_1_3", 0, 0, 747, 666),
					new Sprite.SpriteInfo("in_icon_1_1", 1557, 530, 129, 43),
					new Sprite.SpriteInfo("in_icon_1_2", 1269, 335, 129, 44),
					new Sprite.SpriteInfo("in_icon_1_3", 1398, 335, 129, 44),
					new Sprite.SpriteInfo("in_icon_1_4", 1527, 335, 129, 44),
					new Sprite.SpriteInfo("in_icon_1_5", 747, 579, 129, 43),
					new Sprite.SpriteInfo("in_icon_2_1", 876, 579, 129, 43),
					new Sprite.SpriteInfo("in_icon_2_2", 1557, 393, 129, 44),
					new Sprite.SpriteInfo("in_icon_2_3", 1557, 437, 129, 44),
					new Sprite.SpriteInfo("in_icon_2_4", 1557, 486, 129, 44),
					new Sprite.SpriteInfo("in_icon_2_5", 1005, 579, 129, 43),
					new Sprite.SpriteInfo("in_icon_3_1", 1134, 579, 69, 43),
					new Sprite.SpriteInfo("in_icon_3_2", 1203, 579, 69, 43),
					new Sprite.SpriteInfo("in_icon_4_1", 1272, 579, 69, 43),
					new Sprite.SpriteInfo("in_icon_4_2", 1341, 579, 69, 43),
					new Sprite.SpriteInfo("in_pause_1_0", 747, 242, 371, 151),
					new Sprite.SpriteInfo("in_pause_1_1", 1118, 242, 270, 93),
					new Sprite.SpriteInfo("in_pause_1_2", 1388, 242, 270, 93),
					new Sprite.SpriteInfo("in_pause_1_3", 747, 393, 270, 93),
					new Sprite.SpriteInfo("in_pause_1_4", 1017, 393, 270, 93),
					new Sprite.SpriteInfo("in_pause_1_5", 1287, 393, 270, 93),
					new Sprite.SpriteInfo("in_pause_2_1", 747, 486, 270, 93),
					new Sprite.SpriteInfo("in_pause_2_2", 1017, 486, 270, 93),
					new Sprite.SpriteInfo("in_pause_2_3", 1287, 486, 270, 93),
					new Sprite.SpriteInfo("in_pause_2_4", 0, 666, 270, 93),
					new Sprite.SpriteInfo("in_pause_2_5", 270, 666, 270, 93),
					new Sprite.SpriteInfo("in_text_1_0", 747, 0, 947, 242),
					new Sprite.SpriteInfo("in_text_1_1", 1118, 335, 151, 51),
					new Sprite.SpriteInfo("in_text_1_2", 1410, 579, 76, 38),
				}
			);

			this.Pack = new VNSPack(File.ReadAllBytes(Path.Combine("VNData", "script.vnc")));
			this.VM = new VM();

			this.VM.Storage.Set(-1, "$mouse_x", VMValue.Number(0));
			this.VM.Storage.Set(-1, "$mouse_y", VMValue.Number(0));
			this.VM.Storage.Set(-1, "$mouse_state", VMValue.Number(0));

			this.VM.Register("GameTitle", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - GameTitle의 인자는 1개여야합니다.");
				this.handler.InvokeTitle(args[0].AsString(storage));
				return VMValue.Null();
			});
			this.VM.Register("GameSize", (args, storage) => {
				if (args.Length != 2) throw new Exception("VN RuntimeError - GameSize의 인자는 2개여야합니다.");

				var width = args[0].AsNumber(storage);
				var height = args[1].AsNumber(storage);

				this.VM.Storage.Set(-1, "$game_width", VMValue.Number(width));
				this.VM.Storage.Set(-1, "$game_height", VMValue.Number(height));

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

			this.VM.Register("Load", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - Load의 인자는 1개여야합니다.");

				var script = args[0].AsString(storage);
				this.VM.Load(this.Pack.Codes.First(x => x.CodeName == script));

				return VMValue.String(script);
			});
			this.VM.Register("Script", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - Script의 인자는 1개여야합니다.");

				var script = args[0].AsString(storage);
				this.LoadQueue.Enqueue(script);

				return VMValue.String(script);
			});

			this.VM.Register("UI", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - UI의 인자는 1개여야합니다.");

				var value = args[0].AsBoolean(storage);
				if(value)
					this.UIState |= UIState.Ready;
				else
					this.UIState &= ~UIState.Ready;

				return VMValue.Null();
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

					var targetFile = Path.Combine("VNData", "BG", bg + ".png");
					if (targetFile != this.CurrentState.BGID) { // 파일이 다른 경우에만 불러옴
						lock (this.Sync) {
							this.CurrentState.BG?.Dispose();

							this.CurrentState.BGID = targetFile;
							this.CurrentState.BG = Image.FromFile(this.CurrentState.BGID);
						}
					}
				}
				return VMValue.Null();
			});
			this.VM.Register("IMG", (args, storage) => {
				if (args.Length < 2 || args.Length > 6) throw new Exception("VN RuntimeError - IMG의 인자는 2개 이상 6개 이하여야합니다.");

				var key = args[0].AsString(storage);
				var file = args[1].AsString(storage);

				var x = 0.5;
				var y = 0.5;
				var centerX = 0.5;
				var centerY = 0.5;

				if (args.Length >= 3) {
					x = args[2].AsNumber(storage);
					if (args[2].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								x = this.CurrentState.Images[key].X;
							else
								x = 0.5;
						}
					}
					else if (args[2].Type == VMValueType.Keyword) {
						var val = storage.Get(args[2].Data as string)?.Value;
						if (val == null)
							x = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									x = this.CurrentState.Images[key].X;
								else
									x = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							x = this.CurrentState.Images[key].X;
					}
				}

				if (args.Length >= 4) {
					y = args[3].AsNumber(storage);
					if (args[3].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								y = this.CurrentState.Images[key].Y;
							else
								y = 0.5;
						}
					}
					else if (args[3].Type == VMValueType.Keyword) {
						var val = storage.Get(args[3].Data as string)?.Value;
						if (val == null)
							y = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									y = this.CurrentState.Images[key].Y;
								else
									y = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							y = this.CurrentState.Images[key].Y;
					}
				}

				if (args.Length >= 5) {
					centerX = args[4].AsNumber(storage);
					if (args[4].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								centerX = this.CurrentState.Images[key].CenterX;
							else
								centerX = 0.5;
						}
					}
					else if (args[4].Type == VMValueType.Keyword) {
						var val = storage.Get(args[4].Data as string)?.Value;
						if (val == null)
							centerX = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									centerX = this.CurrentState.Images[key].CenterX;
								else
									centerX = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							centerX = this.CurrentState.Images[key].CenterX;
					}
				}

				if (args.Length >= 6) {
					centerY = args[5].AsNumber(storage);
					if (args[5].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								centerY = this.CurrentState.Images[key].CenterY;
							else
								centerY = 0.5;
						}
					}
					else if (args[5].Type == VMValueType.Keyword) {
						var val = storage.Get(args[5].Data as string)?.Value;
						if (val == null)
							centerY = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									centerY = this.CurrentState.Images[key].CenterY;
								else
									centerY = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							centerY = this.CurrentState.Images[key].CenterY;
					}
				}

				// 해제하는 경우
				if (file == null) {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key)) {
							this.CurrentState.Images[key].Dispose();
							this.CurrentState.Images.Remove(key);
						}
					}
				} else {
					var targetFile = Path.Combine("VNData", "IMG", file + ".png");
					lock (this.Sync) {
						if (!this.CurrentState.Images.ContainsKey(key) || targetFile != this.CurrentState.Images[key].ID) {
							if (this.CurrentState.Images.ContainsKey(key)) {
								this.CurrentState.Images[key].Dispose();
								this.CurrentState.Images.Remove(key);
							}

							// 파일명이 null인 경우, 새로 불러오지않고 해제만
							if (args[1].Type != VMValueType.Null) {
								this.CurrentState.Images[key] = new GameImage(
									Image.FromFile(targetFile),
									targetFile,
									x, y, centerX, centerY
								);
							}
						}
						else {
							this.CurrentState.Images[key].X = x;
							this.CurrentState.Images[key].Y = y;
							this.CurrentState.Images[key].CenterX = centerX;
							this.CurrentState.Images[key].CenterY = centerY;
						}
					}
				}
				return VMValue.Null();
			});
			this.VM.Register("SPRITE", (args, storage) => {
				if (args.Length < 2 || args.Length > 7) throw new Exception("VN RuntimeError - SPRITE의 인자는 3개 이상 7개 이하여야합니다.");

				var key = args[0].AsString(storage);
				var file = args[1].AsString(storage);
				var sprite = args[2].AsString(storage);

				var x = 0.5;
				var y = 0.5;
				var centerX = 0.5;
				var centerY = 0.5;

				if (args.Length >= 4) {
					x = args[3].AsNumber(storage);
					if (args[3].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								x = this.CurrentState.Images[key].X;
							else
								x = 0.5;
						}
					}
					else if (args[3].Type == VMValueType.Keyword) {
						var val = storage.Get(args[3].Data as string)?.Value;
						if (val == null)
							x = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									x = this.CurrentState.Images[key].X;
								else
									x = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							x = this.CurrentState.Images[key].X;
					}
				}

				if (args.Length >= 5) {
					y = args[4].AsNumber(storage);
					if (args[4].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								y = this.CurrentState.Images[key].Y;
							else
								y = 0.5;
						}
					}
					else if (args[4].Type == VMValueType.Keyword) {
						var val = storage.Get(args[4].Data as string)?.Value;
						if (val == null)
							y = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									y = this.CurrentState.Images[key].Y;
								else
									y = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							y = this.CurrentState.Images[key].Y;
					}
				}

				if (args.Length >= 6) {
					centerX = args[5].AsNumber(storage);
					if (args[5].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								centerX = this.CurrentState.Images[key].CenterX;
							else
								centerX = 0.5;
						}
					}
					else if (args[5].Type == VMValueType.Keyword) {
						var val = storage.Get(args[5].Data as string)?.Value;
						if (val == null)
							centerX = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									centerX = this.CurrentState.Images[key].CenterX;
								else
									centerX = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							centerX = this.CurrentState.Images[key].CenterX;
					}
				}

				if (args.Length >= 7) {
					centerY = args[6].AsNumber(storage);
					if (args[6].Type == VMValueType.Null) {
						lock (this.Sync) {
							if (this.CurrentState.Images.ContainsKey(key))
								centerY = this.CurrentState.Images[key].CenterY;
							else
								centerY = 0.5;
						}
					}
					else if (args[6].Type == VMValueType.Keyword) {
						var val = storage.Get(args[6].Data as string)?.Value;
						if (val == null)
							centerY = 0.5;
						else if (val.Type == VMValueType.Null) {
							lock (this.Sync) {
								if (this.CurrentState.Images.ContainsKey(key))
									centerY = this.CurrentState.Images[key].CenterY;
								else
									centerY = 0.5;
							}
						}
					}
				}
				else {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key))
							centerY = this.CurrentState.Images[key].CenterY;
					}
				}

				// 해제하는 경우
				if (file == null) {
					lock (this.Sync) {
						if (this.CurrentState.Images.ContainsKey(key)) {
							this.CurrentState.Images[key].Dispose();
							this.CurrentState.Images.Remove(key);
						}
					}
				}
				else {
					var targetFile = Path.Combine("VNData", "IMG", file + ".sprite.png");
					lock (this.Sync) {
						var usingKey = this.CurrentState.Images.ContainsKey(key);
						var sameKey = (key != null) && usingKey && (targetFile == this.CurrentState.Images[key].ID);
						var wasSprite = usingKey && typeof(GameSprite).IsInstanceOfType(this.CurrentState.Images[key]);

						var disposeRequired = usingKey && (!sameKey || !wasSprite);
						var allocRequired = (!usingKey || !sameKey || !wasSprite) && (args[1].Type != VMValueType.Null);
						// 파일명이 null인 경우, 새로 불러오지않고 해제만

						if (disposeRequired) {
							this.CurrentState.Images[key].Dispose();
							this.CurrentState.Images.Remove(key);
						}

						if (allocRequired) {
							var Infos = File.ReadAllLines(Path.Combine("VNData", "IMG", file + ".sprite.txt"))
								.Where(x => !string.IsNullOrEmpty(x))
								.Select(x => x.Split('\t'))
								.Select(x => new Sprite.SpriteInfo(
									x[0],
									int.Parse(x[1]), int.Parse(x[2]), int.Parse(x[3]), int.Parse(x[4])
								))
								.ToArray();

							var sp = new GameSprite(
								new Sprite(Image.FromFile(targetFile), Infos),
								targetFile,
								x, y, centerX, centerY
							);
							sp.Update(sprite);
							this.CurrentState.Images[key] =sp;
						}
						else if(!disposeRequired) {
							var sp = this.CurrentState.Images[key] as GameSprite;
							sp.Update(sprite);
							sp.X = x;
							sp.Y = y;
							sp.CenterX = centerX;
							sp.CenterY = centerY;
						}
					}
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
				while (freezed) {
					lock (this.Sync)
						freezed = this.FreezedState != null;
				}

				return VMValue.Null();
			});
			this.VM.Register("Wait", (args, storage) => {
				if (args.Length != 1) throw new Exception("VN RuntimeError - Wait의 인자는 1개여야합니다.");

				var dur = args[0].AsNumber(storage) * TimeSpan.TicksPerSecond;
				var start = DateTime.UtcNow.Ticks;

				var freezed = true;
				while (freezed) freezed = (DateTime.UtcNow.Ticks - start) < dur;

				return VMValue.Null();
			});

			this.VM.Register("Sync", (args, storage) => {
				var frame = this.CurrentFrame;

				while (frame == this.CurrentFrame)
					Thread.Sleep(10);

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

				while (this.Pack != null) {
					this.VM.Run();
					Thread.Sleep(100);

					while (this.LoadQueue.Count > 0) {
						string script;
						if (!this.LoadQueue.TryDequeue(out script)) break;

						this.VM.Load(this.Pack.Codes.First(x => x.CodeName == script));
					}
				}

				this.VMThread = null;
			});
			this.VMThread.Start();
		}

		public void Destroy() {
			lock (this.Sync) {
				if (this.FreezedState != null) {
					this.FreezedState.Dispose();
					this.FreezedState = null;
				}
				this.CurrentState.Dispose();

				this.BGM.Dispose();

				this.Pack = null;
				this.VMThread?.Abort();
				this.VMThread?.Join();

				this.VM = null;

				this.UISprite?.Dispose();
				this.UISprite = null;
			}
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
		/// 마우스 상태를 입력
		/// </summary>
		/// <param name="X">마우스 X</param>
		/// <param name="Y">마우스 Y</param>
		/// <param name="State">마우스 상태 (0: 없음, 1: 좌클릭, 2: 우클릭)</param>
		public void Mouse(int X, int  Y, int State) {
			this.VM.Storage.Set(-1, "$mouse_x", VMValue.Number(X));
			this.VM.Storage.Set(-1, "$mouse_y", VMValue.Number(Y));
			this.VM.Storage.Set(-1, "$mouse_state", VMValue.Number(State));
		}

		/// <summary>
		/// 마우스 클릭을 전달
		/// </summary>
		/// <param name="X">마우스 X</param>
		/// <param name="Y">마우스 Y</param>
		/// <param name="Type">마우스 버튼 (1: 좌클릭, 2: 우클릭)</param>
		public void MouseClick(int X, int  Y, int Type) {
		}

		/// <summary>
		/// 화면에 그리기 위한 렌더 사이클 본문 (매 프레임 Clear된 상태로 호출됨)
		/// </summary>
		/// <param name="g"><see cref="Graphics"/> 객체</param>
		public void Render(Graphics g) {
			if (this.VM == null) return;

			this.CurrentFrame++;
			this.VM.Storage.Set(-1, "$globalFrame", VMValue.Number(this.CurrentFrame));

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

			var debug = $"{this.VM.Storage.Get("$mouse_x")?.Value.AsNumber(this.VM.Storage)} x {this.VM.Storage.Get("$mouse_y")?.Value.AsNumber(this.VM.Storage)}\n" +
				$"{this.VM.Storage.Get("$globalFrame")?.Value.AsNumber(this.VM.Storage)}";
			this.DrawStrokedString(g, debug, new Rectangle(0, 0, 1280, 200));
		}

		/// <summary>
		/// 실제 버퍼에 화면을 그리는 작업을 하는 함수, <see cref="GameState"/> 상태 기준으로 그림
		/// </summary>
		/// <param name="g"><see cref="Graphics"/> 객체</param>
		/// <param name="state">화면을 그릴 때 사용될 <see cref="GameState"/> 객체</param>
		private void Render(Graphics g, GameState state) {
			var textboxLayout = new Rectangle(
				(this.canvasSize.Width / 12 * 1),
				(this.canvasSize.Height / 12 * 9),
				(this.canvasSize.Width / 12 * 10),
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
					if (img == null) continue;

					var rect = new Rectangle(
						(int)(image.X - (img.Width * image.CenterX)), // 전체 가로에서 X% 위치로
						(int)(image.Y - (img.Height *image.CenterY)), // 전체 높이에서 Y% 위치로
						img.Width,
						img.Height
					);

					g.DrawImage(img, rect, new Rectangle(0, 0, img.Width, img.Height), GraphicsUnit.Pixel);
				}
			}

			// 만약 마우스 오른쪽 버튼(혹은 UI숨김 버튼)을 누르지 않으면 UI, 대사 출력
			if (this.UIState == UIState.All) {
				g.DrawImageUnscaled(
					this.UISprite["in_text_1_0"],
					new Point(120, 458)
				);

				if (state.TellerName != null) {
					string name;

					lock (this.Sync) {
						name = this.Tellers.Contains(state.TellerName)
							? state.TellerName
							: "???";
					}

					this.DrawStrokedString(g, name, new Rectangle(
						textboxLayout.Left,
						textboxLayout.Top - (int)Game.FontSize - 10,
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
	}
}
