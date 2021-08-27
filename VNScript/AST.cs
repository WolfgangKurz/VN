using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.AST {
	public enum Type {
		Keyword,
		Literal,

		Program,
		Block,

		Call,
		List,
		KeywordList,

		If,
		While,
		For,
		Func,
		Return,

		Assign,
		AssignAddition,
		AssignSubtraction,
		AssignMultiplication,
		AssignDivision,
		AssignRemainder,
		AssignPower,
		AssignBitwiseLeftShift,
		AssignBitwiseRightShift,
		AssignBitwiseAnd,
		AssignBitwiseXor,
		AssignBitwiseOr,

		LogicalOr,
		LogicalAnd,
		BitwiseOr,
		BitwiseXor,
		BitwiseAnd,

		Equal,
		NotEqual,
		Lesser,
		LesserEqual,
		Greater,
		GreaterEqual,

		BitwiseLeftShift,
		BitwiseRightShift,

		Addition,
		Subtraction,
		Concatenate,

		Multiplication,
		Division,
		Remainder,
		Power,

		Increment,
		Decrement,

		UnaryPositive,
		UnaryNegative,
		LogicalNot,
		BitwiseNot,
	}

	public abstract class Node {
		public abstract Type Type();
	}

	public class Program : Node {
		public override Type Type() => AST.Type.Program;

		public Node[] Body { get; }

		public Program(Node[] Body) {
			this.Body = Body;
		}
	}

	public class Block : Node {
		public override Type Type() => AST.Type.Block;

		public Node[] Body { get; }

		public Block(Node[] Body) {
			this.Body = Body;
		}
	}

	public class If : Node {
		public override Type Type() => AST.Type.If;

		public Node Condition { get; }
		public Node Body { get; }

		public If(Node Condition, Node Body) {
			this.Condition = Condition;
			this.Body = Body;
		}
	}
	public class While : Node {
		public override Type Type() => AST.Type.While;

		public Node Condition { get; }
		public Node Body { get; }

		public While(Node Condition, Node Body) {
			this.Condition = Condition;
			this.Body = Body;
		}
	}
	public class For : Node {
		public override Type Type() => AST.Type.For;

		public Node Initialize { get; }
		public Node Condition { get; }
		public Node Loop { get; }
		public Node Body { get; }

		public For(Node Initialize, Node Condition, Node Loop, Node Body) {
			this.Initialize = Initialize;
			this.Condition = Condition;
			this.Loop = Loop;
			this.Body = Body;
		}
	}
	public class Func : Node {
		public override Type Type() => AST.Type.Func;

		public Keyword Name { get; }
		public KeywordList Arguments { get; }
		public Node Body { get; }

		public Func(Keyword Name, KeywordList Arguments, Node Body) {
			this.Name = Name;
			this.Arguments = Arguments;
			this.Body = Body;
		}
	}
	public class Return : Node {
		public override Type Type() => AST.Type.Return;

		public Node Value { get; }

		public Return(Node Value) {
			this.Value = Value;
		}
	}

	public class Assign : Node {
		public override Type Type() => AST.Type.Assign;

		public Keyword Target { get; }
		public Node Value { get; }

		public Assign(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignAddition : Node {
		public override Type Type() => AST.Type.AssignAddition;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignAddition(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignSubtraction : Node {
		public override Type Type() => AST.Type.AssignSubtraction;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignSubtraction(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignMultiplication : Node {
		public override Type Type() => AST.Type.AssignMultiplication;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignMultiplication(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignDivision : Node {
		public override Type Type() => AST.Type.AssignDivision;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignDivision(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignRemainder : Node {
		public override Type Type() => AST.Type.AssignRemainder;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignRemainder(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignPower : Node {
		public override Type Type() => AST.Type.AssignPower;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignPower(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignBitwiseLeftShift : Node {
		public override Type Type() => AST.Type.AssignBitwiseLeftShift;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignBitwiseLeftShift(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignBitwiseRightShift : Node {
		public override Type Type() => AST.Type.AssignBitwiseRightShift;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignBitwiseRightShift(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignBitwiseAnd : Node {
		public override Type Type() => AST.Type.AssignBitwiseAnd;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignBitwiseAnd(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignBitwiseXor : Node {
		public override Type Type() => AST.Type.AssignBitwiseXor;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignBitwiseXor(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}
	public class AssignBitwiseOr : Node {
		public override Type Type() => AST.Type.AssignBitwiseOr;

		public Keyword Target { get; }
		public Node Value { get; }

		public AssignBitwiseOr(Keyword Target, Node Value) {
			this.Target = Target;
			this.Value = Value;
		}
	}

	public class LogicalOr : Node {
		public override Type Type() => AST.Type.LogicalOr;

		public Node Left { get; }
		public Node Right { get; }

		public LogicalOr(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class LogicalAnd : Node {
		public override Type Type() => AST.Type.LogicalAnd;

		public Node Left { get; }
		public Node Right { get; }

		public LogicalAnd(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class BitwiseOr : Node {
		public override Type Type() => AST.Type.BitwiseOr;

		public Node Left { get; }
		public Node Right { get; }

		public BitwiseOr(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class BitwiseXor : Node {
		public override Type Type() => AST.Type.BitwiseXor;

		public Node Left { get; }
		public Node Right { get; }

		public BitwiseXor(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class BitwiseAnd : Node {
		public override Type Type() => AST.Type.BitwiseAnd;

		public Node Left { get; }
		public Node Right { get; }

		public BitwiseAnd(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class Equal : Node {
		public override Type Type() => AST.Type.Equal;

		public Node Left { get; }
		public Node Right { get; }

		public Equal(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class NotEqual : Node {
		public override Type Type() => AST.Type.NotEqual;

		public Node Left { get; }
		public Node Right { get; }

		public NotEqual(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class Lesser : Node {
		public override Type Type() => AST.Type.Lesser;

		public Node Left { get; }
		public Node Right { get; }

		public Lesser(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class LesserEqual : Node {
		public override Type Type() => AST.Type.LesserEqual;

		public Node Left { get; }
		public Node Right { get; }

		public LesserEqual(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class Greater : Node {
		public override Type Type() => AST.Type.Greater;

		public Node Left { get; }
		public Node Right { get; }

		public Greater(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class GreaterEqual : Node {
		public override Type Type() => AST.Type.GreaterEqual;

		public Node Left { get; }
		public Node Right { get; }

		public GreaterEqual(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class BitwiseLeftShift : Node {
		public override Type Type() => AST.Type.BitwiseLeftShift;

		public Node Left { get; }
		public Node Right { get; }

		public BitwiseLeftShift(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class BitwiseRightShift : Node {
		public override Type Type() => AST.Type.BitwiseRightShift;

		public Node Left { get; }
		public Node Right { get; }

		public BitwiseRightShift(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class Addition : Node {
		public override Type Type() => AST.Type.Addition;

		public Node Left { get; }
		public Node Right { get; }

		public Addition(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class Subtraction : Node {
		public override Type Type() => AST.Type.Subtraction;

		public Node Left { get; }
		public Node Right { get; }

		public Subtraction(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class Concatenate : Node {
		public override Type Type() => AST.Type.Concatenate;

		public Node Left { get; }
		public Node Right { get; }

		public Concatenate(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class Multiplication : Node {
		public override Type Type() => AST.Type.Multiplication;

		public Node Left { get; }
		public Node Right { get; }

		public Multiplication(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class Division : Node {
		public override Type Type() => AST.Type.Division;

		public Node Left { get; }
		public Node Right { get; }

		public Division(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class Remainder : Node {
		public override Type Type() => AST.Type.Remainder;

		public Node Left { get; }
		public Node Right { get; }

		public Remainder(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}
	public class Power : Node {
		public override Type Type() => AST.Type.Power;

		public Node Left { get; }
		public Node Right { get; }

		public Power(Node Left, Node Right) {
			this.Left = Left;
			this.Right = Right;
		}
	}

	public class Increment : Node {
		public override Type Type() => AST.Type.Increment;

		public Keyword Target { get; }
		public bool PrefixMode { get; }

		public Increment(Keyword Target, bool ReturnChangedValue = false) {
			this.Target = Target;
			this.PrefixMode = ReturnChangedValue;
		}
	}
	public class Decrement : Node {
		public override Type Type() => AST.Type.Decrement;

		public Keyword Target { get; }
		public bool PrefixMode { get; }

		public Decrement(Keyword Target, bool RetFirst = false) {
			this.Target = Target;
			this.PrefixMode = RetFirst;
		}
	}
	public class UnaryPositive : Node {
		public override Type Type() => AST.Type.UnaryPositive;

		public Node Target { get; }

		public UnaryPositive(Node Target) {
			this.Target = Target;
		}
	}
	public class UnaryNegative : Node {
		public override Type Type() => AST.Type.UnaryNegative;

		public Node Target { get; }

		public UnaryNegative(Node Target) {
			this.Target = Target;
		}
	}
	public class BitwiseNot : Node {
		public override Type Type() => AST.Type.BitwiseNot;

		public Node Target { get; }

		public BitwiseNot(Node Target) {
			this.Target = Target;
		}
	}
	public class LogicalNot : Node {
		public override Type Type() => AST.Type.LogicalNot;

		public Node Target { get; }

		public LogicalNot(Node Target) {
			this.Target = Target;
		}
	}

	public class Keyword : Node {
		public override Type Type() => AST.Type.Keyword;

		public Lexer.Token Value { get; }

		public Keyword(Lexer.Token Value) {
			this.Value = Value;
		}
	}
	public class Literal : Node {
		public override Type Type() => AST.Type.Literal;

		public Lexer.Token Value { get; }

		public Literal(Lexer.Token Value) {
			this.Value = Value;
		}
	}

	public class Call : Node {
		public override Type Type() => AST.Type.Call;

		public Keyword Callee { get; }
		public Node[] Arguments { get; }

		public Call(Keyword Callee, Node[] Arguments) {
			this.Callee = Callee;
			this.Arguments = Arguments;
		}
	}
	public class List : Node {
		public override Type Type() => AST.Type.List;

		public Node[] Nodes { get; }

		public List(Node[] nodes) {
			this.Nodes = nodes;
		}
	}
	public class KeywordList : Node {
		public override Type Type() => AST.Type.KeywordList;

		public Keyword[] Keywords { get; }

		public KeywordList(Keyword[] keywords) {
			this.Keywords = keywords;
		}
	}
}
