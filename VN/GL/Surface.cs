using SharpGL;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VN.GL {
	internal struct Surface {
		public uint framebuffer;
		public uint renderbuffer;
		public uint texture;

		public Surface(uint framebuffer, uint renderbuffer, uint texture) {
			this.framebuffer = framebuffer;
			this.renderbuffer = renderbuffer;
			this.texture = texture;
		}
	}
}
