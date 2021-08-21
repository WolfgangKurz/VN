using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.Game {
	internal class GameTransition {
		public long Start{ get; }
		public long End { get; }

		public double Duration { get; }

		public double Progress => this.Duration == 0 ? 1 : (double)(DateTime.UtcNow.Ticks - this.Start) / (this.End - this.Start);

		public GameTransition(double duration) {
			this.Duration = duration;

			this.Start = DateTime.UtcNow.Ticks;
			this.End = this.Start + (long)(duration * TimeSpan.TicksPerSecond);
		}
	}
}
