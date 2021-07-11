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

			var game = Game.Game.Instance;
			Game.VNC.Instance.Start(game);
			this.Text = game.Title;
			this.FormBorderStyle = game.Resizable
				? FormBorderStyle.Sizable
				: FormBorderStyle.FixedSingle;

			this.ClientSize = new Size(
				game.Width,
				game.Height
			);
		}
	}
}
