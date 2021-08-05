using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VN {
	public partial class frmMain : Form {
		private Thread RenderThread { get; }
		private bool Running { get; set; } = false;

		private object LockObj { get; } = new object();
		private Bitmap[] backBuffer { get; set; } = new Bitmap[2];
		private int bufferCursor { get; set; } = -1;

		public frmMain() {
			InitializeComponent();

			var gameHandler = new Game.Game.Handler();
			gameHandler.OnTitleRequest += (v) => this.AutoInvoke(() => {
				this.Text = v;
			});
			gameHandler.OnResizableRequest += (v) => this.AutoInvoke(() => {
				this.FormBorderStyle = v
					? FormBorderStyle.Sizable
					: FormBorderStyle.FixedSingle;
			}); ;
			gameHandler.OnResizeRequest += (w, h) => this.AutoInvoke(() => {
				this.ClientSize = new Size((int)w, (int)h);

				lock (this.LockObj) {
					// 기존 백버퍼 삭제
					for (var i = 0; i < this.backBuffer.Length; i++) {
						if (this.backBuffer[i] != null) {
							this.backBuffer[i].Dispose();
							this.backBuffer[i] = null;
						}
						this.backBuffer[i] = new Bitmap((int)w, (int)h, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
					}
					this.bufferCursor = -1;
				}
			});

			Game.Game.Instance.Initialize(gameHandler);

			this.RenderThread = new Thread(() => {
				var lastTime = 0L;

				while (this.Running) {
					Bitmap buffer;

					var game = Game.Game.Instance;
					var cursor = (this.bufferCursor + 1) % this.backBuffer.Length;

					lock (this.LockObj)
						buffer = this.backBuffer[cursor];

					using (var g = Graphics.FromImage(buffer)) {
						g.Clear(Color.Black);
						game.Render(g);
					}

					lock (this.LockObj)
						this.bufferCursor = cursor;

					this.AutoInvoke(() => this.Invalidate());

					var now = DateTime.UtcNow.Ticks;
					var delay = (int)Math.Min(now - lastTime, 1000 / 60); // 최대 60프레임
					lastTime = now;
					Thread.Sleep(delay);
				}

				this.AutoInvoke(() => this.Close());
			});
		}

		protected override void OnPaint(PaintEventArgs e) {
			// base.OnPaint(e);
			if (this.bufferCursor < 0) return;

			lock (this.LockObj)
				e.Graphics.DrawImage(this.backBuffer[this.bufferCursor], 0, 0);
		}

		protected override void OnPaintBackground(PaintEventArgs e) {
			// 배경을 그리면서 화면이 깜빡이기 때문에 방지하기 위해서
			// 렌더러가 작동중이라면 배경 칠하기를 무시
			if (!this.Running)
				base.OnPaintBackground(e);
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

		private void btnStart_Click(object sender, EventArgs e) {
			// 임시
			Game.Game.Instance.Run();
			this.btnStart.Visible = false;

			this.Running = true;
			this.RenderThread.Start();
		}

		private void frmMain_FormClosing(object sender, FormClosingEventArgs e) {
			if (this.Running) {
				Game.Game.Instance.Destroy();
				this.Running = false;
				e.Cancel = true;
			}
		}

		private void frmMain_Click(object sender, EventArgs e) {
			Game.Game.Instance.Unblock();
		}

        private void frmMain_MouseDoubleClick(object sender, MouseEventArgs e)
        {
			Game.Game.Instance.doubleClickOn = true;
		}
    }
}
