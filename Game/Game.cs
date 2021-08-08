using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing.Drawing2D;
using VN.VNScript;

namespace VN.Game {
	public class Game {
		public class Handler {
			public delegate void TitleHandler(string title);
			public delegate void ResizableHandler(bool resizable);
			public delegate void ResizeHandler(double width, double height);

			public event TitleHandler OnTitleRequest;
			public event ResizableHandler OnResizableRequest;
			public event ResizeHandler OnResizeRequest;

			internal void InvokeTitle(string title) => this.OnTitleRequest.Invoke(title);
			internal void InvokeResizable(bool resizable) => this.OnResizableRequest.Invoke(resizable);
			internal void InvokeResize(double width, double height) => this.OnResizeRequest.Invoke(width, height);
		}

		// 싱글톤 패턴
		internal static Game Instance { get; } = new Game();


		private VNInterpreter Script { get; set; }

		private Handler handler { get; set; }

		private Size canvasSize { get; set; }

		private DateTime currentTime; //대사 출력 기준시간

		public bool Clickcheck; //클릭 이벤트 체크

		public bool hideUI;     // 마우스 오른쪽 버튼(혹은 UI숨김) 눌렀을 경우 true
								// 그리고 이 때 마우스 왼쪽 버튼을 누르면 false

		public int textSpeed;	// Render 함수에서 텍스트 출력하기 위한 시간에 나눠서 사용함.

		// private로 해야 new로 생성하는 것을 방지할 수 있음
		private Game() { }

		public void Initialize(Handler handler) {
			this.handler = handler;

			this.Script = new VNInterpreter();
			var s = this.Script;

			s.VariableChanged += (name, value) => {
				if (name == "Game.Title")
					this.handler.InvokeTitle(value.AsString);
				else if (name == "Game.Width" || name == "Game.Height") {
					var width = this.Script.GetValue("Game.Width");
					var height = this.Script.GetValue("Game.Height");
					if (width != null && height != null) {
						this.canvasSize = new Size((int)width.AsNumber, (int)height.AsNumber);
						this.handler.InvokeResize(
							width.AsNumber,
							height.AsNumber
						);
					}
				}
				else if (name == "Game.Resizable")
					this.handler.InvokeResizable(this.Script.GetValue("Game.Resizable").AsBool);
			};

			s.SelectionRequest += (sel) => {
				// TODO


				/*
				 * 선택 후 다음 명령으로 선택 번호 지정 (번호는 1부터 시작)
				 * s.SetValue("SEL", new VNValue(VNType.Number, 번호));
				 * s.Unblock();
				 */
			};

			s.TextLog += (text) => {
				// TODO : 로그 추가
				currentTime = DateTime.Now;
				Clickcheck = false;
			};
			s.SayLog += (teller, text) => {
				// TODO : 로그 추가
			};

			s.FreezeRequest += () => {
				// TODO : 화면 고정
			};
			s.TransitionRequest += (r) => {
				// TODO : 화면 전환
			};

			s.HandleFX += (n, p) => {
				// TODO : FX 처리
			};

			s.SetValue("Game", new VNValue(VNType.String, "init"));
			s.SetValue("Game.Title", new VNValue(VNType.String, "VN"));
			s.SetValue("Game.Width", new VNValue(VNType.Number, 800.0));
			s.SetValue("Game.Height", new VNValue(VNType.Number, 450.0));
			s.SetValue("Game.Resizable", new VNValue(VNType.Boolean, true));
			s.SetValue("Game.MarginType", new VNValue(VNType.Symbol, MarginType.LetterBox.ToString()));

			this.Script.Run("init");
		}

		public void Run() {
			var entry = this.Script.GetValue("Game").AsString;
			this.Script.Run(entry);
		}

		public void Destroy() {
			this.Script?.Destroy();
		}

		/// <summary>
		/// 대사, 서사에서 Block된 상태를 해제 (다음 스크립트로 진행)
		/// </summary>
		public void Unblock() {
			this.Script?.Unblock();
		}

		/// <summary>
		/// 렌더러 본문
		/// </summary>
		/// <param name="g"><see cref="Graphics"/> 객체</param>
		public void Render(Graphics g) {
			if (this.Script == null) return;

		
			if (this.Script.CurrentBG != null)
				g.DrawImage(this.Script.CurrentBG, 0, 0, canvasSize.Width, canvasSize.Height);

			{
				var SCGs = this.Script.CurrentSCG.Values;
				var areaWidth = canvasSize.Width / 3;

				foreach (var currentSCG in SCGs) {
					var img = currentSCG.Image;
					var x = (areaWidth / 2) - (img.Width / 2);
					var y = (int)(canvasSize.Height * 0.8) - img.Height; // 전체 높이의 80% 위치에서 "서있게"

					switch (currentSCG.Position) {
						case VNPosition.Left:
							x += 0; // 좌측 영역의 중앙
							break;
						case VNPosition.Center:
							x += areaWidth; // 가운데 영역의 중앙
							break;
						case VNPosition.Right:
							x += areaWidth * 2; // 우측 영역의 중앙
							break;
					}
					g.DrawImage(img, x, y);
				}
			}

			// 만약 마우스 오른쪽 버튼(혹은 UI숨김 버튼)을 누르지 않으면 UI, 대사 출력
			if (!hideUI)
			{
				Font tellerFont = new Font("나눔스퀘어라운드 Bold", 20);    // 화자의 폰트
				if (this.Script.CurrentTeller != null)
				{
					g.DrawString(this.Script.CurrentTeller, tellerFont, Brushes.White, (canvasSize.Width / 4) * 3, canvasSize.Height / 12 * 7);
					tellerFont.Dispose();
				}


				if (this.Script.CurrentText != null)
				{
					FontFamily currentTextfont = new FontFamily("나눔스퀘어라운드 Bold"); // 폰트 패밀리로 수정 08-07
					TimeSpan interval = DateTime.Now - currentTime;             // 대사를 읽기 시작한 시간과 현재 시간의 차이
					int textLen = interval.Seconds;                             // 출력할 대사의 길이
					string currentText = this.Script.CurrentText.Substring(0);  // 반복문에서 자른 대본을 저장할 변수
					Point currentTextpoint = new Point(canvasSize.Width / 15, canvasSize.Height / 3 * 2); // 대사 출력 위치 08-07

					for (int i = 0; i < this.Script.CurrentText.Length; ++i)
					{
						using (Pen pen = new Pen(Brushes.Black, 4)) // 테두리 색 지정, 굵기 지정
						{
							using (GraphicsPath graphicsPath = new GraphicsPath())
							{
								using (Brush fillBrush = new SolidBrush(Color.White)) // 내부 색 지정, color로 지정 요망
								{
									// UI, 텍스트를 숨긴 후 오랜 시간 지나고 다시 시작하면, interval.Seconds의 값이 길이를 넘어가버려 에러가 생김
									// 그래서 이를 막기 위해 조건문 if를 이용해 interval.Seconds가 대본 길이를 넘어가지 못하게 막음

									interval = DateTime.Now - currentTime;
									textLen = ((interval.Seconds * 1000 + interval.Milliseconds) / 20) / textSpeed;

									if (textLen < this.Script.CurrentText.Length)
										currentText = this.Script.CurrentText.Substring(0, textLen);
									else
										currentText = this.Script.CurrentText;

									graphicsPath.AddString(currentText, currentTextfont, 1, 20, currentTextpoint, StringFormat.GenericTypographic);
									g.DrawPath(pen, graphicsPath);
									g.FillPath(fillBrush, graphicsPath);

									if (Clickcheck)
									{
										graphicsPath.AddString(this.Script.CurrentText, currentTextfont, 1, 20, currentTextpoint, StringFormat.GenericTypographic);
										g.DrawPath(pen, graphicsPath);
										g.FillPath(fillBrush, graphicsPath);
									}
								}
							}
						}
					}

					currentTextfont.Dispose();
				}
			}
		
		}
	}
}
