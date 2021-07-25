using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VN {
	public partial class frmMain : Form {
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
			});

			Game.Game.Instance.Initialize(gameHandler);
		}

		private void AutoInvoke(Action act) {
			if (this.InvokeRequired)
				this.Invoke(act);
			else
				act();
		}

		private void btnStart_Click(object sender, EventArgs e) {
			Game.Game.Instance.Run();
		}
	}
}
