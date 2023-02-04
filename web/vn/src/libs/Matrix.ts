import { Matrix4x5Identity } from "@/types/Matrix";

export function input2matrix (input: number[]): Tuple<number, 20> {
	if (input.length === 4) {
		return [
			input[0], 0, 0, 0, 0,
			0, input[1], 0, 0, 0,
			0, 0, input[2], 0, 0,
			0, 0, 0, input[3], 0,
		];
	} else if (input.length === 20)
		return input as Tuple<number, 20>;
	return Matrix4x5Identity;
}
