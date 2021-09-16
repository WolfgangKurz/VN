using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class GameState : IDisposable {
		/// <summary>
		/// 말하고 있는 화자.
		/// <see langword="null" />이라면 화자 없는 서사
		/// </summary>
		public string TellerName { get; set; }

		/// <summary>
		/// 표시되고 있는 서사/대사
		/// </summary>
		public string Message { get; set; }

		/// <summary>
		/// 화면의 배경
		/// </summary>
		public Image BG { get; set; }
		/// <summary>
		/// 화면의 배경 파일명
		/// </summary>
		public string BGID { get; set; }

		/// <summary>
		/// 화면에 표시되는 추가 이미지 목록
		/// </summary>
		public Dictionary<string, GameImage> Images { get; } = new Dictionary<string, GameImage>();

		public GameState Clone() {
			var clone = new GameState();

			clone.TellerName = this.TellerName;
			clone.Message = this.Message;
			clone.BG = this.BG?.Clone() as Image;

			foreach (var entity in this.Images)
				clone.Images[entity.Key] = new GameImage(
					entity.Value.Image.Clone() as Image,
					entity.Value.ID,
					entity.Value.X, entity.Value.Y,
					entity.Value.CenterX, entity.Value.CenterY
				);

			return clone;
		}

		public void Dispose() {
			this.BG?.Dispose();

			var imgs = this.Images.Values.ToArray();
			foreach (var img in imgs) img.Dispose();
			this.Images.Clear();
		}
	}
}
