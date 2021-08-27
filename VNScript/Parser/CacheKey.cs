using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Parser {
	internal class CacheKey {
		private int hash { get; }
		private int location { get; }
		private string ruleName { get; }
		private int stateKey { get; }

		public CacheKey(string ruleName, int stateKey, int location) {
			this.ruleName = ruleName;
			this.stateKey = stateKey;
			this.location = location;

			unchecked {
				var hash = 0x3EFB6AC0;
				hash = (hash * -0x13228765) + (this.ruleName == null ? 0 : this.ruleName.GetHashCode());
				hash = (hash * -0x13228765) + this.stateKey;
				hash = (hash * -0x13228765) + this.location;
				this.hash = hash;
			}
		}

		public override bool Equals(object obj) {
			if (object.ReferenceEquals(this, obj)) return true;

			var other = obj as CacheKey;
			if (!(other is null))
				return this.location == other.location && this.stateKey == other.stateKey && this.ruleName == other.ruleName;
			return false;
		}

		public override int GetHashCode() => this.hash;
	}

}
