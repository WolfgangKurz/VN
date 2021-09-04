using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace VNCompiler {
	using Parser = VNScript.Parser.Parser;
	using Compiler = VNScript.Compiler.Compiler;

	class Program {
		private static string CurrentDirectory = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);

		private static void DirectoryCopy(string sourceDirName, string destDirName, bool copySubDirs) {
			var dir = new DirectoryInfo(sourceDirName);

			if (!dir.Exists)
				throw new DirectoryNotFoundException($"Source directory does not exist or could not be found: {sourceDirName}");

			var dirs = dir.GetDirectories();
			Directory.CreateDirectory(destDirName);

			var files = dir.GetFiles();
			foreach (var file in files) {
				if (file.Extension != ".vns")
					file.CopyTo(Path.Combine(destDirName, file.Name), false);
			}

			if (copySubDirs) {
				foreach (var subdir in dirs)
					DirectoryCopy(subdir.FullName, Path.Combine(destDirName, subdir.Name), copySubDirs);
			}
		}

		static void Main(string[] args) {
			VNScript.Test.Run();

			var inputDir = Path.Combine(
				CurrentDirectory, // Solution\VNCompiler\bin\Debug\
				"..", "..", "..", // Solution\
				"VN", "VNData" // Solution\VN\VNData
			);
			var outputDir = inputDir;

			var input = Directory.GetFiles(inputDir, "*.vns")
				.Where(x => Path.GetFileNameWithoutExtension(x) != "test");
			var output = Path.Combine(outputDir, "script.vnc");

			var pack = new Dictionary<string, byte[]>();
			foreach(var file in input) {
				var code = File.ReadAllText(file);
				var parsed = Parser.Parse(code);
				var compiled = Compiler.Compile(parsed);

				pack.Add(
					Path.GetFileNameWithoutExtension(file),
					compiled.ToArray()
				);
			}

			File.WriteAllBytes(
				output,
				Compiler.Pack(pack.ToArray()).ToArray()
			);

			var debugDir = Path.Combine(
				inputDir,
				"..", "bin", "Debug", "VNData"
			);

			if (Directory.Exists(debugDir))
				Directory.Delete(debugDir, true);
			DirectoryCopy(outputDir, debugDir, true);
		}
	}
}
