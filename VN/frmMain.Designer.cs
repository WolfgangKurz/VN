namespace VN {
	partial class frmMain {
		/// <summary>
		/// 필수 디자이너 변수입니다.
		/// </summary>
		private System.ComponentModel.IContainer components = null;

		/// <summary>
		/// 사용 중인 모든 리소스를 정리합니다.
		/// </summary>
		/// <param name="disposing">관리되는 리소스를 삭제해야 하면 true이고, 그렇지 않으면 false입니다.</param>
		protected override void Dispose(bool disposing) {
			if (disposing && (components != null)) {
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		#region Windows Form 디자이너에서 생성한 코드

		/// <summary>
		/// 디자이너 지원에 필요한 메서드입니다. 
		/// 이 메서드의 내용을 코드 편집기로 수정하지 마세요.
		/// </summary>
		private void InitializeComponent() {
            this.btnStart = new System.Windows.Forms.Button();
            this.btnHistory = new System.Windows.Forms.Button();
            this.btnAuto = new System.Windows.Forms.Button();
            this.btnSave = new System.Windows.Forms.Button();
            this.btnLoad = new System.Windows.Forms.Button();
            this.btnUI = new System.Windows.Forms.Button();
            this.btnStop = new System.Windows.Forms.Button();
            this.btnSetting = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // btnStart
            // 
            this.btnStart.Image = global::VN.Properties.Resources.main_1_1;
            this.btnStart.Location = new System.Drawing.Point(10, 74);
            this.btnStart.Name = "btnStart";
            this.btnStart.Size = new System.Drawing.Size(158, 50);
            this.btnStart.TabIndex = 0;
            this.btnStart.UseVisualStyleBackColor = true;
            this.btnStart.Click += new System.EventHandler(this.btnStart_Click);
            // 
            // btnHistory
            // 
            this.btnHistory.BackgroundImage = global::VN.Properties.Resources.btnHistory;
            this.btnHistory.Location = new System.Drawing.Point(660, 266);
            this.btnHistory.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.btnHistory.Name = "btnHistory";
            this.btnHistory.Size = new System.Drawing.Size(113, 35);
            this.btnHistory.TabIndex = 1;
            this.btnHistory.UseVisualStyleBackColor = true;
            this.btnHistory.Visible = false;
            // 
            // btnAuto
            // 
            this.btnAuto.Image = global::VN.Properties.Resources.btnAuto;
            this.btnAuto.Location = new System.Drawing.Point(660, 301);
            this.btnAuto.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.btnAuto.Name = "btnAuto";
            this.btnAuto.Size = new System.Drawing.Size(113, 35);
            this.btnAuto.TabIndex = 2;
            this.btnAuto.UseVisualStyleBackColor = true;
            this.btnAuto.Visible = false;
            // 
            // btnSave
            // 
            this.btnSave.BackgroundImage = global::VN.Properties.Resources.btnSave;
            this.btnSave.Location = new System.Drawing.Point(660, 336);
            this.btnSave.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.btnSave.Name = "btnSave";
            this.btnSave.Size = new System.Drawing.Size(113, 35);
            this.btnSave.TabIndex = 3;
            this.btnSave.UseVisualStyleBackColor = true;
            this.btnSave.Visible = false;
            // 
            // btnLoad
            // 
            this.btnLoad.BackgroundImage = global::VN.Properties.Resources.btnLoad;
            this.btnLoad.Location = new System.Drawing.Point(660, 371);
            this.btnLoad.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.btnLoad.Name = "btnLoad";
            this.btnLoad.Size = new System.Drawing.Size(113, 35);
            this.btnLoad.TabIndex = 4;
            this.btnLoad.UseVisualStyleBackColor = true;
            this.btnLoad.Visible = false;
            // 
            // btnUI
            // 
            this.btnUI.BackgroundImage = global::VN.Properties.Resources.btnUI;
            this.btnUI.Location = new System.Drawing.Point(660, 406);
            this.btnUI.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.btnUI.Name = "btnUI";
            this.btnUI.Size = new System.Drawing.Size(113, 35);
            this.btnUI.TabIndex = 5;
            this.btnUI.UseVisualStyleBackColor = true;
            this.btnUI.Visible = false;
            // 
            // btnStop
            // 
            this.btnStop.BackgroundImage = global::VN.Properties.Resources.btnStop;
            this.btnStop.Location = new System.Drawing.Point(704, 12);
            this.btnStop.Name = "btnStop";
            this.btnStop.Size = new System.Drawing.Size(69, 43);
            this.btnStop.TabIndex = 7;
            this.btnStop.UseVisualStyleBackColor = true;
            this.btnStop.Visible = false;
            // 
            // btnSetting
            // 
            this.btnSetting.Image = global::VN.Properties.Resources.btnSetting;
            this.btnSetting.Location = new System.Drawing.Point(704, 61);
            this.btnSetting.Name = "btnSetting";
            this.btnSetting.Size = new System.Drawing.Size(69, 43);
            this.btnSetting.TabIndex = 8;
            this.btnSetting.UseVisualStyleBackColor = true;
            this.btnSetting.Visible = false;
            this.btnSetting.Click += new System.EventHandler(this.button3_Click);
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Black;
            this.BackgroundImage = global::VN.Properties.Resources.title;
            this.ClientSize = new System.Drawing.Size(801, 450);
            this.Controls.Add(this.btnSetting);
            this.Controls.Add(this.btnStop);
            this.Controls.Add(this.btnUI);
            this.Controls.Add(this.btnLoad);
            this.Controls.Add(this.btnSave);
            this.Controls.Add(this.btnAuto);
            this.Controls.Add(this.btnHistory);
            this.Controls.Add(this.btnStart);
            this.Name = "frmMain";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "VN";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.frmMain_FormClosing);
            this.Click += new System.EventHandler(this.frmMain_Click);
            this.MouseClick += new System.Windows.Forms.MouseEventHandler(this.frmMain_MouseClick);
            this.MouseDoubleClick += new System.Windows.Forms.MouseEventHandler(this.frmMain_MouseDoubleClick);
            this.ResumeLayout(false);

		}

		#endregion

		private System.Windows.Forms.Button btnStart;
        private System.Windows.Forms.Button btnHistory;
        private System.Windows.Forms.Button btnAuto;
        private System.Windows.Forms.Button btnSave;
        private System.Windows.Forms.Button btnLoad;
        private System.Windows.Forms.Button btnUI;
        private System.Windows.Forms.Button btnStop;
        private System.Windows.Forms.Button btnSetting;
    }
}

