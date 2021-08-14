using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VNScript.Lexer {
	public enum TokenType {
		NEWLINE,

		IDENTIFIER,
		STRING,
		NUMBER,
		BOOLEAN,
		NULL,

		ASSIGN, // =
		ADDITION_ASSIGN, // +=
		SUBTRACTION_ASSIGN, // -=
		MULTIPLICATION_ASSIGN, // *=
		DIVISION_ASSIGN, // /=
		REMAINDER_ASSIGN, // %=
		POWER_ASSIGN, // **=
		OR_ASSIGN, // |=
		AND_ASSIGN, // &=
		XOR_ASSIGN, // ^=
		LSHIFT_ASSIGN, // <<=
		RSHIFT_ASSIGN, // >>=

		LOGICAL_NOT, // !
		BITWISE_NOT, // ~
		PLUS, // +
		MINUS, // -
		DOT, // .
		MULTIPLICATION, // *
		DIVISION, // /
		REMAINDER, // %
		POWER, // **

		OR, // |
		AND, // &
		XOR, // ^

		LOGICAL_OR, // ||
		LOGICAL_AND, // &&

		LPAREN, // (
		RPAREN, // )

		LPARA, // {
		RPARA, // }

		EQUAL, // ==
		NOT_EQUAL, // !=

		LESSER, // <
		LESSER_EQUAL, // <=
		GREATER, // >
		GREATER_EQUAL, // >=

		LSHIFT, // <<
		RSHIFT, // >>

		COMMA, // ,

		COMMENT, // //

		IF, // IF
		WHILE, // WHILE
	}
}
