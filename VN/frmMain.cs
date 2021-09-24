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
		private string CurrentTitle = "";


		public frmMain() {
			InitializeComponent();

			var gameHandler = new Game.Game.Handler();
			gameHandler.OnCenter += () => this.AutoInvoke(() => this.CenterToScreen());
			gameHandler.OnTitle += (v, mem) => this.AutoInvoke(() => {
				if (mem) this.CurrentTitle = v;
				this.Text = v;
			});
			gameHandler.OnResizable += (v) => this.AutoInvoke(() => {
				this.FormBorderStyle = v
					? FormBorderStyle.Sizable
					: FormBorderStyle.FixedSingle;
			}); ;
			gameHandler.OnResize += (w, h) => this.AutoInvoke(() => this.ClientSize = new Size(w, h));
			gameHandler.OnMessage += (msg) => this.AutoInvoke(() => MessageBox.Show(msg, this.CurrentTitle));
			gameHandler.OnQuit += () => this.AutoInvoke(() => this.Close());

			Game.Game.Instance.Initialize(gameHandler);
			Game.Game.Instance.Run(this.Handle);
		}

		protected override void OnPaint(PaintEventArgs e) {
			// base.OnPaint(e);
		}

		protected override void OnPaintBackground(PaintEventArgs e) {
			if (Game.Game.Instance.gl == null)
				base.OnPaintBackground(e);
		}

		protected override void OnResize(EventArgs e) {
			base.OnResize(e);

			var size = this.ClientSize;
			Game.Game.Instance.ResizeWindow(size.Width, size.Height);
		}

		/// <summary>
		/// 외부 스레드에서 UI스레드를 접근하려고 하면 Invoke하고 아니라면 직접 실행
		/// </summary>
		/// <param name="act">실행할 함수</param>
		private void AutoInvoke(Action act) {
			try {
				if (this.InvokeRequired)
					this.Invoke(act);
				else
					act();
			}
			catch { }
		}

		private void frmMain_FormClosing(object sender, FormClosingEventArgs e) {
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
