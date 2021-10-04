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
			gameHandler.OnCenter += () => this.CenterToScreen();
			gameHandler.OnTitle += (v, mem) => {
				if (mem) this.CurrentTitle = v;
				this.Text = v;
			};
			gameHandler.OnResizable += (v) =>
				this.FormBorderStyle = v
					? FormBorderStyle.Sizable
					: FormBorderStyle.FixedSingle;
			gameHandler.OnResize += (w, h) => this.ClientSize = new Size(w, h);
			gameHandler.OnMessage += (msg) => MessageBox.Show(msg, this.CurrentTitle);
			gameHandler.OnUpdate += () => Application.DoEvents();
			gameHandler.OnQuit += () => this.Close();

			Game.Game.Instance.Initialize(gameHandler);
		}

		protected override void OnShown(EventArgs e) {
			base.OnShown(e);
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

		private void frmMain_FormClosing(object sender, FormClosingEventArgs e) {
			if (Game.Game.Instance.Running) {
				e.Cancel = true;
				this.Hide();
				new Thread(() => {
					Game.Game.Instance.Stop();

					try { 
						this.Invoke(new Action(() => this.Close()));
					}
					catch { }
				}).Start();
			}
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
