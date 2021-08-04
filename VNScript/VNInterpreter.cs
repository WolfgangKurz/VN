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
		public delegate void BlockedEvent();
		public delegate void VariableChangedEvent(string name, VNValue value);

		public delegate void TextLogEvent(string text);
		public delegate void SayLogEvent(string teller, string text);

		public delegate void SelectionRequestEvent(string[] selections);
		public delegate void FreezeRequestEvent();
		public delegate void TransitionRequestEvent(string reference);

		/// <summary>
		/// 다음 스크립트 구문으로 진행하지 않는 상태가 되었을 경우에 호출됩니다.
		/// </summary>
		public event BlockedEvent Blocked;

		/// <summary>
		/// 엔진 내 또는 스크립트에서 변수의 값이 변경되면 호출됩니다.
		/// </summary>
		public event VariableChangedEvent VariableChanged;

		/// <summary>
		/// 화자가 없는 대사가 표현되면 호출됩니다.
		/// </summary>
		public event TextLogEvent TextLog;


		/// <summary>
		/// 화자가 있는 대사가 표현되면 호출됩니다.
		/// </summary>
		public event SayLogEvent SayLog;

		/// <summary>
		/// 선택지를 표현해야할 때 호출됩니다.
		/// </summary>
		public event SelectionRequestEvent SelectionRequest;

		/// <summary>
		/// 화면을 고정해야할 때 호출됩니다.
		/// </summary>
		public event FreezeRequestEvent FreezeRequest;

		/// <summary>
		/// 화면 고정을 해제하고 전환해야할 때 호출됩니다.
		/// reference 값은 null일 수 있으며, null인 경우 Fade 효과가 사용됩니다.
		/// </summary>
		public event TransitionRequestEvent TransitionRequest;

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
		public Dictionary<int, VNSCG> CurrentSCG { get; private set; }

		public bool Running { get; private set; }

		public bool Blocking { get; private set; }

		public VNInterpreter() {
			this.Variables = new Dictionary<string, VNValue>();
			this.UnlockedNames = new List<string>();
			this.RunningStack = new ConcurrentStack<VNStatus>();

			this.CurrentSCG = new Dictionary<int, VNSCG>();
		}

		~VNInterpreter() {
			if(this.InterpreterThread != null && this.InterpreterThread.IsAlive) {
				this.InterpreterThread.Abort();
				this.InterpreterThread.Join();
				this.InterpreterThread = null;
			}

			foreach (var scg in this.CurrentSCG)
				scg.Value.Dispose();

			this.CurrentBG.Dispose();
			this.CurrentBGM.Dispose();
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
							throw VNException.ParamVarNotFoundException(key);
						}
						return p;
					})
					.ToArray();

				switch (inst.Type) {
					case VNCodeType.SCRIPT:
						if (param.Length != 1)
							throw VNException.ParamLenException("SCRIPT", 1, param.Length);
						if (!param[0].isString)
							throw VNException.ParamTypeException("SCRIPT", 1, "String", param[0].type.ToString());

						this.Run(param[0].AsString);
						break;

					case VNCodeType.SET:
						if (param.Length != 2)
							throw VNException.ParamLenException("SET", 2, param.Length);
						if (!param[0].isSymbol)
							throw VNException.ParamTypeException("SET", 1, "Symbol", param[0].type.ToString());

						this.SetValue(param[0].AsSymbol, param[1]);
						break;

					case VNCodeType.ADD:
					case VNCodeType.SUB:
					case VNCodeType.MUL:
					case VNCodeType.DIV:
					case VNCodeType.MOD:
						if (param.Length != 2)
							throw VNException.ParamLenException(inst.Type.ToString(), 2, param.Length);
						if (!param[0].isSymbol)
							throw VNException.ParamTypeException(inst.Type.ToString(), 1, "Symbol", param[0].type.ToString());
						if (!param[1].isNumber)
							throw VNException.ParamTypeException(inst.Type.ToString(), 2, "Number", param[1].type.ToString());

						; {
							var name = param[0].AsSymbol;
							var var = this.GetValue(name);
							if (var == null)
								throw VNException.ParamVarNotFoundException(name);
							if (!var.isNumber)
								throw VNException.VarTypeException(name, "Number", param[1].type.ToString());

							switch (inst.Type) {
								case VNCodeType.ADD:
									this.SetValue(name, new VNValue(VNType.Number, var.AsNumber + param[1].AsNumber));
									break;
								case VNCodeType.SUB:
									this.SetValue(name, new VNValue(VNType.Number, var.AsNumber - param[1].AsNumber));
									break;
								case VNCodeType.MUL:
									this.SetValue(name, new VNValue(VNType.Number, var.AsNumber * param[1].AsNumber));
									break;
								case VNCodeType.DIV:
									this.SetValue(name, new VNValue(VNType.Number, var.AsNumber / param[1].AsNumber));
									break;
								case VNCodeType.MOD:
									this.SetValue(name, new VNValue(VNType.Number, var.AsNumber % param[1].AsNumber));
									break;
							}
						}
						break;

					case VNCodeType.STRING:
						if (param.Length != 1)
							throw VNException.ParamLenException("STRING", 1, param.Length);
						if (!param[0].isSymbol)
							throw VNException.ParamTypeException("STRING", 1, "Symbol", param[0].type.ToString());

						; {
							var name = param[0].AsSymbol;
							var var = this.GetValue(name);
							var value = "";

							switch(var.type) {
								case VNType.Null:
									value = "null";
									break;
								case VNType.Symbol:
									value = var.AsSymbol;
									break;
								case VNType.String:
									value = var.AsString;
									break;
								case VNType.Number:
									value = var.AsNumber.ToString();
									break;
								case VNType.Boolean:
									value = var.AsBool.ToString();
									break;
							}
							this.SetValue(name, new VNValue(VNType.String, value));
						}
						break;

					case VNCodeType.FLOOR:
					case VNCodeType.ROUND:
					case VNCodeType.CEIL:
						if (param.Length != 1)
							throw VNException.ParamLenException(inst.Type.ToString(), 1, param.Length);
						if (!param[0].isSymbol)
							throw VNException.ParamTypeException(inst.Type.ToString(), 1, "Symbol", param[0].type.ToString());

						; {
							var name = param[0].AsSymbol;
							var var = this.GetValue(name);
							if(!var.isNumber)
								throw VNException.VarTypeException(name, "Number", param[1].type.ToString());

							switch (inst.Type) {
								case VNCodeType.FLOOR:
									this.SetValue(name, new VNValue(VNType.Number, Math.Floor(var.AsNumber)));
									break;
								case VNCodeType.ROUND:
									this.SetValue(name, new VNValue(VNType.Number, Math.Round(var.AsNumber)));
									break;
								case VNCodeType.CEIL:
									this.SetValue(name, new VNValue(VNType.Number, Math.Ceiling(var.AsNumber)));
									break;
							}
						}
						break;

					case VNCodeType.IF:
						if (param.Length != 3)
							throw VNException.ParamLenException("IF", 3, param.Length);
						if (!param[1].isSymbol)
							throw VNException.ParamTypeException("IF", 2, "Symbol", param[1].type.ToString());

						; {
							var match = false;
							var oper = param[1].AsSymbol;
							switch(oper) {
								case "==":
									if (param[0] == param[2]) match = true;
									break;
								case "!=":
									if (param[0] != param[2]) match = true;
									break;
								case ">":
									if (param[0] > param[2]) match = true;
									break;
								case "<":
									if (param[0] < param[2]) match = true;
									break;
								case ">=":
									if (param[0] >= param[2]) match = true;
									break;
								case "<=":
									if (param[0] <= param[2]) match = true;
									break;
								default:
									throw VNException.ParamListException("IF", 2, new string[] { "==", "!=", ">", "<", ">=", "<=" }, oper);
							}

							if (match) break;

							var depth = 1;
							while(!current.EOF) {
								var _inst = current.Next();
								switch (_inst.Type) {
									case VNCodeType.IF:
										depth++;
										break;
									case VNCodeType.END:
										depth--;
										break;
								}
								if (depth == 0) break;
							}
							if (depth > 0)
								throw VNException.IFENDNotFound();
						}
						break;
					case VNCodeType.END:
						break; // 무시

					case VNCodeType.LABEL:
						break; // 무시

					case VNCodeType.GOTO:
						if (param.Length != 1)
							throw VNException.ParamLenException("GOTO", 1, param.Length);
						if (!param[0].isSymbol)
							throw VNException.ParamTypeException("GOTO", 1, "Symbol", param[0].type.ToString());

						; {
							var label = param[0].AsSymbol;
							if (current.Labels.ContainsKey(label))
								current.Seek(current.Labels[label]);
							else
								throw VNException.LabelNotFound(label);
						}
						break;

					case VNCodeType.UNLOCK:
						if (param.Length != 2)
							throw VNException.ParamLenException("UNLOCK", 2, param.Length);
						if (!param[0].isSymbol)
							throw VNException.ParamTypeException("UNLOCK", 1, "Symbol", param[0].type.ToString());
						if (!param[1].isString)
							throw VNException.ParamTypeException("UNLOCK", 2, "String", param[1].type.ToString());

						switch (param[0].AsSymbol) {
							case "name":
								if (!this.UnlockedNames.Contains(param[1].AsString))
									this.UnlockedNames.Add(param[1].AsString);
								break;
						}
						break;

					case VNCodeType.TEXT:
						if (param.Length != 1)
							throw VNException.ParamLenException("TEXT", 1, param.Length);
						if (!param[0].isString)
							throw VNException.ParamTypeException("TEXT", 1, "String", param[0].type.ToString());

						this.CurrentText = param[0].AsString;
						this.TextLog?.Invoke(this.CurrentText);
						this.Block();
						break;

					case VNCodeType.SAY:
						if (param.Length != 2)
							throw VNException.ParamLenException("TEXT", 1, param.Length);
						if (!param[0].isString)
							throw VNException.ParamTypeException("TEXT", 1, "String", param[0].type.ToString());
						if (!param[1].isString)
							throw VNException.ParamTypeException("TEXT", 2, "String", param[1].type.ToString());

						this.CurrentTeller = param[0].AsString;
						this.CurrentText = param[1].AsString;
						this.SayLog?.Invoke(this.CurrentTeller, this.CurrentText);
						this.Block();
						break;

					case VNCodeType.SEL:
						if (param.Length == 0)
							throw VNException.ParamLenMinException("SEL", 1, 0);

						this.Block();
						this.SelectionRequest?.Invoke(
							param
								.Select((x, i) => {
									if (!x.isString)
										throw VNException.ParamTypeException("SEL", i + 1, "String", x.type.ToString());

									return x.AsString;
								}).ToArray()
						);
						break;

					case VNCodeType.BGM:
						if (param.Length != 1)
							throw VNException.ParamLenException("BGM", 1, param.Length);
						if (!param[0].isString && !param[0].isNull)
							throw VNException.ParamTypeException("BGM", 1, "String or Null", param[0].type.ToString());

						try {
							var bgm = param[0];
							if (bgm.isNull) {
								this.CurrentBGM.Stop();
								this.CurrentBGM.Unload();
							}
							else {
								var path = Path.Combine("VNData", "BGM", bgm.AsString + ".mp3");
								if (path != this.CurrentBGM.Path) {
									this.CurrentBGM.Load(path, true);

									if (this.GetValue("BGM") != bgm)
										this.SetValue("BGM", bgm, false);
								}
								this.CurrentBGM.Play();
							}
						}
						catch {
							throw VNException.BGMFileNotFound(param[0].AsString);
						}
						break;

					case VNCodeType.BG:
						if (param.Length != 1)
							throw VNException.ParamLenException("BG", 1, param.Length);
						if (!param[0].isString && !param[0].isNull)
							throw VNException.ParamTypeException("BG", 1, "String or Null", param[0].type.ToString());

						try {
							var bg = param[0];
							if (this.GetValue("BG") != bg) {
								if (this.CurrentBG != null) {
									this.CurrentBG.Dispose();
									this.CurrentBG = null;
								}

								if (!bg.isNull)
									this.CurrentBG = Image.FromFile(Path.Combine("VNData", "BG", bg.AsString + ".png"));
								this.SetValue("BG", bg, false);
							}
						}
						catch {
							throw VNException.BGFileNotFound(param[0].AsString);
						}
						break;

					case VNCodeType.SCG:
						if (param.Length < 2) throw VNException.ParamLenMinException("SCG", 2, param.Length);
						if (param.Length > 3) throw VNException.ParamLenMaxException("SCG", 3, param.Length);

						if (!param[0].isNumber)
							throw VNException.ParamTypeException("SCG", 1, "Number", param[0].type.ToString());

						if (param.Length == 3) {
							if (!param[1].isString)
								throw VNException.ParamTypeException("SCG", 2, "String", param[1].type.ToString());
							if (!param[2].isSymbol)
								throw VNException.ParamTypeException("SCG", 3, "Symbol", param[2].type.ToString());

							var id = param[0].AsNumber;
							if (!VNHelper.IsInteger(id)) throw VNException.ParamIntegerException("SCG", 1);
							if (id < 1 || id > 3) throw VNException.ParamRangeException("SCG", 1, 1, 3, id);

							var pos = param[2].AsSymbol;
							var list = new string[] { "left", "center", "right" };
							if (!list.Any(x => x == pos.ToLower()))
								throw VNException.ParamListException("SCG", 3, list, pos);

							try {
								var iid = (int)id;

								if (this.CurrentSCG.ContainsKey(iid)) { // 이미 있었다면 해제
									this.CurrentSCG[iid].Dispose();
									this.CurrentSCG.Remove(iid);
								}

								this.CurrentSCG[iid] = new VNSCG(
									Image.FromFile(Path.Combine("VNData", "SCG", param[1].AsString + ".png")),
									VNHelper.AsPosition(pos)
								);
							}
							catch {
								throw VNException.SCGFileNotFound(param[1].AsString);
							}
						}
						else {
							var id = param[0].AsNumber;
							if (!VNHelper.IsInteger(id)) throw VNException.ParamIntegerException("SCG", 1);

							var iid = (int)id;
							if (param[1].isNull) {
								if (this.CurrentSCG.ContainsKey(iid)) {
									this.CurrentSCG[iid].Dispose();
									this.CurrentSCG.Remove(iid);
								}
							}
							else {
								string pos;
								if (!this.CurrentSCG.ContainsKey(iid)) {
									if (!param[2].isSymbol)
										throw VNException.ParamTypeException("SCG", 3, "Symbol", param[2].type.ToString());

									pos = param[2].AsSymbol;
								}
								else {
									pos = this.CurrentSCG[iid].Position.ToString();

									this.CurrentSCG[iid].Dispose();
									this.CurrentSCG.Remove(iid);
								}

								this.CurrentSCG[iid] = new VNSCG(
									Image.FromFile(Path.Combine("VNData", "SCG", param[1].AsString + ".png")),
									VNHelper.AsPosition(pos)
								);
							}
						}
						break;

					case VNCodeType.FX:
						// TODO
						break;

					case VNCodeType.FREEZE:
						if (param.Length > 0) throw VNException.ParamLenMaxException("FREEZE", 0, param.Length);

						this.FreezeRequest?.Invoke();
						break;

					case VNCodeType.TRANSITION:
						if (param.Length < 1) throw VNException.ParamLenMinException("TRANSITION", 1, param.Length);
						if (param.Length > 2) throw VNException.ParamLenMaxException("TRANSITION", 2, param.Length);

						if (!param[0].isNumber)
							throw VNException.ParamTypeException("TRANSITION", 1, "Number", param[0].type.ToString());

						if (param.Length == 2) {
							if (!param[1].isString)
								throw VNException.ParamTypeException("TRANSITION", 2, "String", param[0].type.ToString());

							this.TransitionRequest?.Invoke(param[1].AsString);
						}
						else
							this.TransitionRequest?.Invoke(null);
						break;

					default:
						throw VNException.UnknownCommand(inst.Type.ToString());
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
			this.VariableChanged?.Invoke(name, value);
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

		protected void Block() {
			this.Blocking = true;
			this.Blocked?.Invoke();
		}
	}
}
