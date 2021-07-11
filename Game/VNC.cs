using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VN.Game {
	internal class VNC {
		internal static VNC Instance { get; } = new VNC();

		private VNC() {
			// new 할당 방지
		}

		internal void Start(Game game) {
			// C# 컴파일러 객체 생성
			var codeDom = CodeDomProvider.CreateProvider("CSharp");

			// 컴파일러 파라미터 옵션: 메모리에 어셈블리 생성
			var cparams = new CompilerParameters();
			cparams.GenerateInMemory = true;
			cparams.ReferencedAssemblies.Add(Helper.Self);
			// cparams.ReferencedAssemblies.Add("lib.dll");

			// 소스코드를 컴파일해서 어셈블리 생성
			var results = codeDom.CompileAssemblyFromFile(cparams, Path.Combine(Helper.DirName, "VNData", "info.vnc"));

			// 컴파일 에러 있는 경우 표시
			if (results.Errors.Count > 0) {
				// foreach (var err in results.Errors)
				//	Console.WriteLine(err.ToString());
				MessageBox.Show(
					"VNC 컴파일 중 다음과 같은 오류가 발생했습니다.\n\n" +
					string.Join(
						"\n----------------------------------------------\n",
						results.Errors.OfType<CompilerError>()
							.Select(x => $" * {x.ToString()}")
					),
					"VN"
				);
				return;
			}

			// 어셈블리 로딩
			var initializerType = results.CompiledAssembly.GetType("VN.Game.Initializer");
			object initializer = Activator.CreateInstance(initializerType);

			// 동적 클래스의 메서드 호출
			var mi = initializer.GetType().GetMethod("Setup");
			mi.Invoke(initializer, new object[] { game });
		}
	}
}
