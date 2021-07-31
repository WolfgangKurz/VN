using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Drawing;

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

		// 현재 표시되는 텍스트 또는 대사
		public string CurrentText { get; private set; }

		// 현재 표시되는 대사의 화자
		public string CurrentTeller { get; private set; }

		// 현재 재생중인 BGM
		private VNAudio CurrentBGM { get; } = new VNAudio();

		// 현재 표시되는 배경
		public Image CurrentBG { get; private set; }

		// 현재 표시되는 Standing CG(캐릭터) - 좌, 중앙, 우
		public Image[] CurrentSCG { get; private set; }

		public bool Running { get; private set; }

		public bool Blocking { get; private set; }

		public VNInterpreter() {
			this.Variables = new Dictionary<string, VNValue>();
			this.UnlockedNames = new List<string>();
			this.RunningStack = new ConcurrentStack<VNStatus>();

			this.CurrentSCG = new Image[3];
		}

		public void Run(string script) {
			var path = Path.Combine(ScriptPath, script + ".vns");
			if (!File.Exists(path))
				throw new Exception("VNInterpreter 실행 오류 - 스크립트 파일을 찾을 수 없습니다.");

			var code = File.ReadAllText(path);
			this.RunningStack.Push(new VNStatus(code));

			this.Running = true;
			if (this.InterpreterThread == null || !this.InterpreterThread.IsAlive) {
				this.InterpreterThread = new Thread(this.Worker);
				this.InterpreterThread.Start();
			}
		}

		public void Destroy() {
			if (this.Running)
				this.Running = false;
		}

		public void Unblock() {
			this.Blocking = false;
		}

		private Exception ParamLenException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 '{should}'개여야하지만, '{input}'개였습니다.");
		private Exception ParamLenMinException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 최소 '{should}'개여야하지만, '{input}'개였습니다.");
		private Exception ParamLenMaxException(string type, int should, int input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 인자는 최대 '{should}'개여야하지만, '{input}'개였습니다.");
		private Exception ParamTypeException(string type, int idx, string should, string input) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{should}'이어야하지만, '{input}'이었습니다.");
		private Exception ParamVarNotFoundException(string key) =>
			new Exception($"VNInterpreter 실행 오류 - 변수 '{key}'를 참조하려고 했지만 존재하지 않았습니다.");
		private Exception ParamIntegerException(string type, int idx) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 정수형이어야합니다.");
		private Exception ParamRangeException(string type, int idx, int min, int max, double value) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{min}'이상 '{max}'이하여야하지만, '{value}'였습니다.");
		private Exception ParamListException(string type, int idx, string[] list, string value) =>
			new Exception($"VNInterpreter 실행 오류 - '{type}'의 {idx}번째 인자는 '{string.Join(", ", list)}' 중 하나여야하지만 '{value}'였습니다.");

		private void Worker() {
			while (this.Running && this.RunningStack.Count > 0) {
				VNStatus current;
				if (this.Blocking) { // 대기중이라면 잠시 대기하고 다시 시도
					Thread.Sleep(10);
					continue;
				}

				if ( !this.RunningStack.TryPeek(out current)) { // 가져오기를 실패하면 잠시 대기하고 다시 시도
					Thread.Sleep(100);
					continue;
				}

				if (current.EOF) {
					VNStatus last;
					if (!this.RunningStack.TryPop(out last))
						Thread.Sleep(100); // 제거를 실패하면 잠시 대기하고 다시 시도

					continue;
				}

				this.CurrentText = "";
				this.CurrentTeller = "";

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
						if (param.Length != 1)
							throw ParamLenException("TEXT", 1, param.Length);
						if (!param[0].isString)
							throw ParamTypeException("TEXT", 1, "String", param[0].type.ToString());

						this.CurrentText = param[0].AsString;
						this.Blocking = true;
						break;

					case VNCodeType.SAY: // 5
						if (param.Length != 2)
							throw ParamLenException("TEXT", 1, param.Length);
						if (!param[0].isString)
							throw ParamTypeException("TEXT", 1, "String", param[0].type.ToString());
						if (!param[1].isString)
							throw ParamTypeException("TEXT", 2, "String", param[1].type.ToString());

						this.CurrentTeller = param[0].AsString;
						this.CurrentText = param[1].AsString;
						this.Blocking = true;
						break;

					case VNCodeType.SEL: // 6
										 // TODO
						this.Blocking = true;
						break;

					case VNCodeType.BGM: // 7
						if (param.Length != 1)
							throw ParamLenException("BGM", 1, param.Length);
						if (!param[0].isString && !param[0].isNull)
							throw ParamTypeException("BGM", 1, "String or Null", param[0].type.ToString());

						try {
							var bgm = param[0];
							if (bgm.isNull) {
								this.CurrentBGM.Stop();
								this.CurrentBGM.Unload();
							}
							else {
								var path = Path.Combine("VNData", "BGM", bgm.AsString + ".mp3");
								if (path != this.CurrentBGM.Path) {
									this.CurrentBGM.Load(path);

									if (this.GetValue("BGM") != bgm)
										this.SetValue("BGM", bgm, false);
								}
								this.CurrentBGM.Play();
							}
						}
						catch {
							throw new Exception($"VNInterpreter 실행 오류 - 배경음악 '{param[0].AsString}'을(를) 찾을 수 없습니다.");
						}
						break;

					case VNCodeType.BG: // 8
						if (param.Length != 1)
							throw ParamLenException("BG", 1, param.Length);
						if (!param[0].isString)
							throw ParamTypeException("BG", 1, "String", param[0].type.ToString());

						try {
							var bg = param[0];
							if (this.GetValue("BG") != bg) {
								this.CurrentBG = Image.FromFile(Path.Combine("VNData", "BG", bg.AsString + ".png"));
								this.SetValue("BG", bg, false);
							}
						}
						catch {
							throw new Exception($"VNInterpreter 실행 오류 - 배경 '{param[0].AsString}'을(를) 찾을 수 없습니다.");
						}
						break;

					case VNCodeType.SCG: // 9
						if (param.Length < 1) throw ParamLenMinException("SCG", 2, param.Length);
						if (param.Length > 3) throw ParamLenMaxException("SCG", 3, param.Length);

						if (!param[0].isNumber)
							throw ParamTypeException("SCG", 1, "Number", param[0].type.ToString());

						if (param.Length == 3) {
							if (!param[1].isString)
								throw ParamTypeException("SCG", 2, "String", param[1].type.ToString());
							if (!param[2].isSymbol)
								throw ParamTypeException("SCG", 3, "Symbol", param[2].type.ToString());

							var id = param[0].AsNumber;
							if (!VNHelper.IsInteger(id)) throw ParamIntegerException("SCG", 1);
							if (id < 1 || id > 3) throw ParamRangeException("SCG", 1, 1, 3, id);

							var pos = param[2].AsSymbol;
							var list = new string[] { "left", "center", "right" };
							if (!list.Any(x => x == pos.ToLower()))
								throw ParamListException("SCG", 3, list, pos);

							try {
								var iid = (int)id;
								this.CurrentSCG[iid] = Image.FromFile(Path.Combine("VNData", "SCG", param[1].AsString + ".png"));
							}
							catch {
								throw new Exception($"VNInterpreter 실행 오류 - SCG '{param[1].AsString}'을(를) 찾을 수 없습니다.");
							}
						}
						else {
							if (!param[1].isNull)
								throw ParamTypeException("SCG", 2, "Null", param[1].type.ToString());

							var id = param[0].AsNumber;
							if (!VNHelper.IsInteger(id)) throw ParamIntegerException("SCG", 1);
							if (id < 1 || id > 3) throw ParamRangeException("SCG", 1, 1, 3, id);

							var iid = (int)id;
							this.CurrentSCG[iid].Dispose();
							this.CurrentSCG[iid] = null;
						}
						break;

					case VNCodeType.FX: // 10
						// TODO
						break;

					case VNCodeType.WAIT: // 11
						// TODO
						break;

					default:
						throw new Exception($"VNInterpreter 실행 오류 - '{inst.Type}'은(는) 알 수 없는 명령어입니다.");
				}
			}
			
			this.Running = false;
			this.CurrentBGM.Unload();
		}

		/// <summary>
		/// 변수를 설정하기 전에 올바른 값인지 검증
		/// </summary>
		/// <param name="name">변수명</param>
		/// <param name="value">값</param>
		private void AssertValue(string name, VNValue value) {
			VNType should;
			VNValue[] shouldV = null;
			var ReadonlyVars = new string[] {
				"BGM",
				"BG",
			};

			switch (name) {
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
					if(ReadonlyVars.Contains(name))
						throw new Exception($"VNInterpreter 실행 오류 - 읽기 전용 변수 '{name}'을 입력하려고 했습니다.");

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
		public void SetValue(string name, VNValue value) => this.SetValue(name, value, true);

		/// <summary>
		///  변수를 설정
		/// </summary>
		/// <param name="name">변수명</param>
		/// <param name="value">값</param>
		/// <param name="assert">변수 검사 여부</param>
		protected void SetValue(string name, VNValue value, bool assert) {
			if (assert)
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
