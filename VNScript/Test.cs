using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript {
	using VMValue = VNScript.VM.VMValue;

	static class Program {
		/// <summary>
		/// 해당 애플리케이션의 주 진입점입니다.
		/// </summary>
		[STAThread]
		static void Main() {
			var code = @"@A = 10, @B = @A, @C = 3, @D = 0, @E = true, @F = false, @G = -13

$Add = @A + @B // 20
$Sub = @A - @C // 7

$Mul = @A * @B // 100
$Div = @A / @C // 3.33333...
$Rem = @A % @C // 1
$Pow = @A ** @C // 1000

$LShift = @A << @C // 80
$RShift = @A >> @C // 1

$LogAnd = @E && @F // false
$LogOr = @A || @C // true
$LogNot = !@E // false

$BitAnd = @A & @C // 2
$BitXor = @A ^ @C // 9
$BitOr = @A | @C // 11
$BitNot = ~@A // -11

$Equal = @E == @F // false
$NotEqual = @E != @F // true
$Lesser = @A < @B // false
$LesserEqual = @A <= @B // true
$Greater = @A > @C // true
$GreaterEqual = @A >= @C // true

$IfTest1 = $IfTest2 = false
if (@E != @F) $IfTest1 = true // If Test Expression
if (@E != @F) { // If Test Block
	$IfTest2 = true
}

// While Test
@a = 0, @b = 0, @c = 5
while (@a < @c) {
	@a ++
	@b += @a
}
$WhileTest = @b

$Positive = +@G // -13
$Negative = -@G // 13

$Inc = $Dec = 5

$IncPrefix = ++$Inc // 6
$IncPostfix = $Inc++ // 6
// $Inc == 7

$DecPrefix = --$Dec // 4
$DecPostfix = $Dec-- // 4
// $Dec == 3

$Func = Add(1, 2) // 3
Test $Func // Print 3

$Concat = @A .. @B // ""1010""

$AssignAdd = $AssignSub = $AssignMul = $AssignDiv = $AssignRem = $AssignPow = $AssignOr = $AssignXor = $AssignAnd = $AssignLShift = $AssignRShift = @A
$AssignAdd += @C // 13
$AssignSub -= @C // 7
$AssignMul *= @C // 30
$AssignDiv /= @C // 3.33333...
$AssignRem %= @C // 1
$AssignPow **= @C // 1000
$AssignOr |= @C // 11
$AssignXor ^= @C // 9
$AssignAnd &= @C // 2
$AssignLShift <<= @C // 80
$AssignRShift >>= @C // 1
";

			var r = VNScript.Compiler.Compiler.Compile(VNScript.Parser.Parser.Parse(code));
			var p = VNScript.Compiler.Compiler.Pack(
				new KeyValuePair<string, byte[]>("test", r)
			);
			// File.WriteAllBytes("compiled.vnc", p.ToArray());

			var vm = new VNScript.VM.VM();
			vm.Load(p.Codes[0]);
			vm.Register("Add", (args, storage) => VMValue.Number(args[0].AsNumber(storage) + args[1].AsNumber(storage)));
			vm.Register("Test", (args, storage) => {
				System.Diagnostics.Debug.WriteLine(args[0].AsString(storage));
				return VMValue.Null();
			});
			vm.Run();

			var Assert = new Action<string, object>((name, should) => {
				var was = vm.Storage.Get(name).Value.Data.ToString();
				var val = should.ToString();
				if (was != val)
					throw new Exception($"Assert Fault - {name}\nShould - {val}\nWas - {was}");
			});

			Assert("$Add", 20);
			Assert("$Sub", 7);

			Assert("$Mul", 100);
			Assert("$Div", (10.0 / 3));
			Assert("$Rem", 1);
			Assert("$Pow", 1000);

			Assert("$LShift", 80);
			Assert("$RShift", 1);

			Assert("$LogAnd", false);
			Assert("$LogOr", true);
			Assert("$LogNot", false);

			Assert("$BitAnd", 2);
			Assert("$BitXor", 9);
			Assert("$BitOr", 11);
			Assert("$BitNot", -11);

			Assert("$Equal", false);
			Assert("$NotEqual", true);
			Assert("$Lesser", false);
			Assert("$LesserEqual", true);
			Assert("$Greater", true);
			Assert("$GreaterEqual", true);

			Assert("$IfTest1", true);
			Assert("$IfTest2", true);
			Assert("$WhileTest", 15);

			Assert("$Positive", -13);
			Assert("$Negative", 13);

			Assert("$IncPrefix", 6);
			Assert("$IncPostfix", 6);
			Assert("$Inc", 7);

			Assert("$DecPrefix", 4);
			Assert("$DecPostfix", 4);
			Assert("$Dec", 3);

			Assert("$Func", 3);

			Assert("$Concat", "1010");

			Assert("$AssignAdd", 13);
			Assert("$AssignSub", 7);
			Assert("$AssignMul", 30);
			Assert("$AssignDiv", (10.0 / 3));
			Assert("$AssignRem", 1);
			Assert("$AssignPow", 1000);
			Assert("$AssignOr", 11);
			Assert("$AssignXor", 9);
			Assert("$AssignAnd", 2);
			Assert("$AssignLShift", 80);
			Assert("$AssignRShift", 1);
		}
	}
}
