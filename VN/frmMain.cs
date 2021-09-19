using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VN {
	public partial class frmMain : Form {
		private bool Running = false;
		private Thread RenderThread { get; }

		public frmMain() {
			InitializeComponent();

			var gameHandler = new Game.Game.Handler();
			gameHandler.OnCenterRequest += () => this.AutoInvoke(() => this.CenterToScreen());
			gameHandler.OnTitleRequest += (v) => this.AutoInvoke(() => this.Text = v);
			gameHandler.OnResizableRequest += (v) => this.AutoInvoke(() => {
				this.FormBorderStyle = v
					? FormBorderStyle.Sizable
					: FormBorderStyle.FixedSingle;
			}); ;
			gameHandler.OnResizeRequest += (w, h) => this.AutoInvoke(() => this.ClientSize = new Size((int)w, (int)h));

			this.Running = true;
			this.RenderThread = new Thread(() => {
				var MaxFPS = 60;
				var PrevTick = 0L;

				while (this.Running) {
					this.AutoInvoke(() => this.Invalidate(false));

					var time = DateTime.UtcNow.Ticks;
					var elapsed = (time - PrevTick) / TimeSpan.TicksPerMillisecond;
					var wait = (int)Math.Max(0, (1000 / MaxFPS) - elapsed);
					PrevTick = time;
					// Thread.Sleep(wait);
				}
			});

			Game.Game.Instance.Initialize(gameHandler);
			Game.Game.Instance.Run();
			this.RenderThread.Start();
		}

		protected override void OnPaint(PaintEventArgs e) {
			var instance = Game.Game.Instance;

			lock (instance.BufferLocker) {
				if (instance.CurrentBuffer != null)
					instance.CurrentBuffer.Flush(e.Graphics);
			}
		}

		protected override void OnPaintBackground(PaintEventArgs e) {
			// 배경을 그리면서 화면이 깜빡이기 때문에 방지하기 위해서 배경 칠하기를 무시
		}

		/// <summary>
		/// 외부 스레드에서 UI스레드를 접근하려고 하면 Invoke하고 아니라면 직접 실행
		/// </summary>
		/// <param name="act">실행할 함수</param>
		private void AutoInvoke(Action act) {
			if (this.InvokeRequired)
				this.Invoke(act);
			else
				act();
		}

		private void frmMain_FormClosing(object sender, FormClosingEventArgs e) {
			this.Running = false;
			Game.Game.Instance.Destroy();
		}

		private void frmMain_Mouse(object sender, MouseEventArgs e) {
			var game = Game.Game.Instance;

			var buttons = 0;
			if (e.Button.HasFlag(MouseButtons.Left)) buttons |= 1;
			if (e.Button.HasFlag(MouseButtons.Right)) buttons |= 2;
			game.MouseInput(e.X, e.Y, buttons);
		}

		private void frmMain_MouseClick(object sender, MouseEventArgs e) {
			Game.Game.Instance.MouseClick(e.X, e.Y);
		}

		private void frmMain_MouseDoubleClick(object sender, MouseEventArgs e) {
			// 더블 클릭 이벤트 무시
			this.frmMain_MouseClick(sender, e);
		}
	}
}
