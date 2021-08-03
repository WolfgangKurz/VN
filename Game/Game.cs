﻿using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
						this.handler.InvokeResize(
							this.Script.GetValue("Game.Width").AsNumber,
							this.Script.GetValue("Game.Height").AsNumber
						);
					}
				}
				else if (name == "Game.Resizable")
					this.handler.InvokeResizable(this.Script.GetValue("Game.Resizable").AsBool);
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
				g.DrawImage(this.Script.CurrentBG, 10, 10);

			if (this.Script.CurrentSCG != null)
			{
				var currentSCGs = this.Script.CurrentSCG.ToList();

				for (int i = 0; i < this.Script.CurrentSCG.Count; ++i)
				{
					// SCG 출력하는데 Left, Center, Right 위치에 따라 임의로 위치를 주었음.
					if (currentSCGs[i].Value.Position.ToString() == "Left")
						g.DrawImage(currentSCGs[i].Value.Image, 10, 100);
					else if (currentSCGs[i].Value.Position.ToString() == "Center")
						g.DrawImage(currentSCGs[i].Value.Image, 200, 100);
					else if (currentSCGs[i].Value.Position.ToString() == "Right")
						g.DrawImage(currentSCGs[i].Value.Image, 500, 100);
				}
			}

			if (this.Script.CurrentTeller != null)
				g.DrawString(this.Script.CurrentTeller, SystemFonts.DefaultFont, Brushes.White, 10, 10);

			if (this.Script.CurrentText != null)
				g.DrawString(this.Script.CurrentText, SystemFonts.DefaultFont, Brushes.White, 10, 30);
			// 잘 되면 남아있는거
		}
	}
}
