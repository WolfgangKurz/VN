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
            this.텍스트속도업 = new System.Windows.Forms.Button();
            this.텍스트속도다운 = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // btnStart
            // 
            this.btnStart.Location = new System.Drawing.Point(14, 15);
            this.btnStart.Margin = new System.Windows.Forms.Padding(3, 4, 3, 4);
            this.btnStart.Name = "btnStart";
            this.btnStart.Size = new System.Drawing.Size(86, 29);
            this.btnStart.TabIndex = 0;
            this.btnStart.Text = "시작";
            this.btnStart.UseVisualStyleBackColor = true;
            this.btnStart.Click += new System.EventHandler(this.btnStart_Click);
            // 
            // 텍스트속도업
            // 
            this.텍스트속도업.Location = new System.Drawing.Point(486, 15);
            this.텍스트속도업.Name = "텍스트속도업";
            this.텍스트속도업.Size = new System.Drawing.Size(103, 42);
            this.텍스트속도업.TabIndex = 1;
            this.텍스트속도업.Text = "텍스트속도업";
            this.텍스트속도업.UseVisualStyleBackColor = true;
            this.텍스트속도업.MouseClick += new System.Windows.Forms.MouseEventHandler(this.텍스트속도업_MouseClick);
            // 
            // 텍스트속도다운
            // 
            this.텍스트속도다운.Location = new System.Drawing.Point(486, 63);
            this.텍스트속도다운.Name = "텍스트속도다운";
            this.텍스트속도다운.Size = new System.Drawing.Size(103, 39);
            this.텍스트속도다운.TabIndex = 2;
            this.텍스트속도다운.Text = "텍스트속도다운";
            this.텍스트속도다운.UseVisualStyleBackColor = true;
            this.텍스트속도다운.MouseClick += new System.Windows.Forms.MouseEventHandler(this.텍스트속도다운_MouseClick);
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Black;
            this.ClientSize = new System.Drawing.Size(601, 369);
            this.Controls.Add(this.텍스트속도다운);
            this.Controls.Add(this.텍스트속도업);
            this.Controls.Add(this.btnStart);
            this.Margin = new System.Windows.Forms.Padding(3, 4, 3, 4);
            this.Name = "frmMain";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "VN";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.frmMain_FormClosing);
            this.Click += new System.EventHandler(this.frmMain_Click);
            this.MouseClick += new System.Windows.Forms.MouseEventHandler(this.frmMain_MouseClick);
            this.ResumeLayout(false);

		}

		#endregion

		private System.Windows.Forms.Button btnStart;
        private System.Windows.Forms.Button 텍스트속도업;
        private System.Windows.Forms.Button 텍스트속도다운;
    }
}

