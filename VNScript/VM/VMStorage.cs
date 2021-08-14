using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.VM {
	public class VMStorage {
		protected Dictionary<string, VMStorageValue> Table { get; }

		public VMValue[] Variables => this.Table.Values
			.Select(x => x.Value)
			.ToArray();

		public int Count => this.Table.Count;

		public int CurrentLevel { get; private set; }

		public VMStorage() {
			this.Table = new Dictionary<string, VMStorageValue>();
		}

		public VMStorageValue[] GetAll(int Level) => this.Table.Values
			.Where(x => x.Level == Level)
			.ToArray();
		public VMStorageValue[] GetAll(int Level = int.MaxValue, bool IncludeDownward = true) =>
			IncludeDownward
				? this.Table.Values
					.Where(x => x.Level <= Level)
					.ToArray()
				: this.GetAll(Level);

		/// <summary>
		/// 스코프를 한 단계 상승시킵니다.
		/// </summary>
		internal void Up() => this.CurrentLevel++;
		/// <summary>
		/// 스코프를 한 단계 낮춥니다.
		/// </summary>
		internal void Down() {
			if (this.CurrentLevel == 0)
				throw new Exception("VNScript VMError - Scope is Floor");

			var targets = this.Table.Values // 현재 스코프에서 선언된 로컬 변수를 모두 삭제
				.Where(x => x.Level == this.CurrentLevel)
				.ToArray();

			foreach (var target in targets) this.Table.Remove(target.Name);

			this.CurrentLevel--;
		}

		protected void Add(string Name, VMValue Value) =>
			this.Add(this.CurrentLevel, Name, Value);
		protected void Add(int Level, string Name, VMValue Value) =>
			this.Table.Add(Name, new VMStorageValue(Level, Name, Value));

		public bool Has(string Name) => this.Table.ContainsKey(Name);

		public void Set(string Name, VMValue Value) => this.Set(this.CurrentLevel, Name, Value);
		public void Set(int Level, string Name, VMValue Value) {
			if (Value.Type == VMValueType.Null) // Delete
				this.Table.Remove(Name);
			
			else if (this.Table.ContainsKey(Name)) // Update
				this.Table[Name].Set(Value);

			else // Add
				this.Add(Level, Name, Value);
		}

		public VMStorageValue Get(string Name) => this.Has(Name) ? this.Table[Name] : null;
	}
}
