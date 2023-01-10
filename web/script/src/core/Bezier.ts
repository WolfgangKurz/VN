type Point = [number, number];
type Points = Point[];

export default class Bezier {
	public static readonly Linear = new Bezier([[0, 0], [1, 1]]);
	public static readonly Ease = new Bezier([[0.25, 0.1], [0.25, 1.0]]);
	public static readonly EaseIn = new Bezier([[0.42, 0], [1.0, 1.0]]);
	public static readonly EaseOut = new Bezier([[0, 0], [0.58, 1.0]]);
	public static readonly EaseInOut = new Bezier([[0.42, 0], [0.58, 1.0]]);

	public static readonly SmoothOut = new Bezier([[0, 0.8], [0.2, 1.0]]);

	private _points: Points;

	public get Points () { return this._points; }

	constructor (points: Points) {
		this._points = [[0, 0], ...points, [1, 1]];
	}

	protected calcPoint (t: number, arr: Points): Point {
		if (arr.length === 1) return arr[0];

		const ret: Points = [];
		for (let i = 0; i < arr.length - 1; i++) {
			const x = arr[i][0] + (arr[i + 1][0] - arr[i][0]) * t;
			const y = arr[i][1] + (arr[i + 1][1] - arr[i][1]) * t;
			ret.push([x, y]);
		}

		return this.calcPoint(t, ret);
	}

	public getY (t: number): number {
		return this.calcPoint(t, this._points)[1];
	}
}
