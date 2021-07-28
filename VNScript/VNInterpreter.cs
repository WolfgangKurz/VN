﻿using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace VN.VNScript {
	internal class VNInterpreter {
		public delegate void VariableChangedEvent(string name, VNValue value);
		public event VariableChangedEvent VariableChanged;

		private string ScriptPath { get; } = Path.Combine(
			Path.GetDirectoryName(Assembly.GetEntryAssembly().Location),
			"VNData"
		);

		/// <summary>
		/// 변수 저장소
		/// </summary>
		private Dictionary<string, VNValue> Variables { get; }

		private List<string> UnlockedNames { get; }

		private ConcurrentStack<VNStatus> RunningStack { get; }

		private Thread InterpreterThread { get; set; }

		public VNInterpreter() {
			this.Variables = new Dictionary<string, VNValue>();
			this.UnlockedNames = new List<string>();
			this.RunningStack = new ConcurrentStack<VNStatus>();
		}

		public void Run(string script) {
			var path = Path.Combine(ScriptPath, script + ".vns");
			if (!File.Exists(path))
				throw new Exception("VNInterpreter 실행 오류 - 스크립트 파일을 찾을 수 없습니다.");

			var code = File.ReadAllText(path);
			this.RunningStack.Push(new VNStatus(code));

			if (this.InterpreterThread == null || !this.InterpreterThread.IsAlive) {
				this.InterpreterThread = new Thread(this.Worker);
				this.InterpreterThread.Start();
			}
		}

		private Exception ParamLenException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 '{should}'개여야하지만, '{input}'개였습니다.");
		private Exception ParamTypeException(string type, int idx, string should, string input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{should}'이어야하지만, '{input}'이었습니다.");
		private Exception ParamVarNotFoundException(string key) =>
			new Exception($"VNInterpreter 실행 오류 - 변수 '{key}'를 참조하려고 했지만 존재하지 않았습니다.");

		private void Worker() {
			while (this.RunningStack.Count > 0) {
				VNStatus current;
				if (!this.RunningStack.TryPeek(out current)) { // 가져오기를 실패하면 잠시 대기하고 다시 시도
					Thread.Sleep(100);
					continue;
				}

				if (current.EOF) {
					VNStatus last;
					if (!this.RunningStack.TryPop(out last))
						Thread.Sleep(100); // 제거를 실패하면 잠시 대기하고 다시 시도

					continue;
				}

				var inst = current.Next(); // instruction
				var param = inst.Params
					.Select(p => {
						if (p.isVariable) {
							var key = p.AsVariable;
							if (this.Variables.ContainsKey(key)) return this.Variables[key];
							throw ParamVarNotFoundException(key);
						}
						return p;
					})
					.ToArray();

				switch (inst.Type) {
					case VNCodeType.NONE: // 0
						return;

					case VNCodeType.SCRIPT: // 1
						if (param.Length != 1)
							throw ParamLenException("SCRIPT", 1, param.Length);
						if (!param[0].isString)
							throw ParamTypeException("SCRIPT", 1, "String", param[0].type.ToString());

						this.Run(param[0].AsString);
						break;

					case VNCodeType.SET: // 2
						if (param.Length != 2)
							throw ParamLenException("SET", 2, param.Length);
						if (!param[0].isSymbol)
							throw ParamTypeException("SET", 1, "Symbol", param[0].type.ToString());

						this.SetValue(param[0].AsSymbol, param[1]);
						break;

					case VNCodeType.UNLOCK: // 3
						if (param.Length != 2)
							throw ParamLenException("UNLOCK", 2, param.Length);
						if (!param[0].isSymbol)
							throw ParamTypeException("UNLOCK", 1, "Symbol", param[0].type.ToString());
						if (!param[1].isString)
							throw ParamTypeException("UNLOCK", 2, "String", param[1].type.ToString());

						switch (param[0].AsSymbol) {
							case "name":
								if (!this.UnlockedNames.Contains(param[1].AsString))
									this.UnlockedNames.Add(param[1].AsString);
								break;
						}
						break;

					case VNCodeType.TEXT: // 4
					case VNCodeType.SAY: // 5

					default:
						throw new Exception($"VNInterpreter 실행 오류 - '{inst.Type}'은(는) 알 수 없는 명령어입니다.");
				}
			}
		}

		/// <summary>
		/// 변수를 설정하기 전에 올바른 값인지 검증
		/// </summary>
		/// <param name="name">변수명</param>
		/// <param name="value">값</param>
		private void AssertValue(string name, VNValue value) {
			VNType should;
			VNValue[] shouldV = null;

			switch(name) {
				case "Game.Title":
					should = VNType.String;
					break;

				case "Game.Width":
				case "Game.Height":
					should = VNType.Number;
					break;

				case "Game.Resizable":
					should = VNType.Boolean;
					break;

				case "Game.Margin":
					should = VNType.Symbol;
					shouldV = new VNValue[] {
						new VNValue(VNType.Symbol, "Stretch"),
						new VNValue(VNType.Symbol, "Resize"),
						new VNValue(VNType.Symbol, "LetterBox"),
					};
					break;

				case "Game":
					should = VNType.String;
					break;

				default:
					return;
			}

			if (should != value.type)
				throw new Exception($"VNInterpreter 실행 오류 - 변수 '{name}'은(는) '{should}'이어야하지만 '{value.type}'이었습니다.");

			if (shouldV != null && !shouldV.Contains(value))
				throw new Exception($"VNInterpreter 실행 오류 - 변수 '{name}'은(는) '{string.Join(", ", shouldV.Select(x => x.AsSerialize))}' 중 하나여야하지만 '{value.AsSerialize}'였습니다.");
		}

		/// <summary>
		///  변수를 설정
		/// </summary>
		/// <param name="name">변수명</param>
		/// <param name="value">값</param>
		public void SetValue(string name, VNValue value) {
			this.AssertValue(name, value);

			this.Variables[name] = value;
			this.VariableChanged.Invoke(name, value);
		}

		/// <summary>
		/// 설정된 변수를 가져옴. 없으면 <see langword="null"/> 반환
		/// </summary>
		/// <param name="name">가져올 변수명</param>
		/// <returns>설정된 변수 또는 <see langword="null"/></returns>
		public VNValue GetValue(string name) {
			if (this.Variables.ContainsKey(name))
				return this.Variables[name];
			return null;
		}
	}
}
