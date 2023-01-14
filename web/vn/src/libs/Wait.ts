export interface WaitData {
	flush (): void;
	cancel (): void;
	isDone (): boolean;
}

export default function Wait (msec: number, cb: () => void): WaitData {
	let done = false;
	const timeoutId = window.setTimeout(() => {
		done = true;
		cb();
	}, msec);

	return {
		flush () {
			if (done) return;
			this.cancel();
			cb();
		},
		cancel () {
			if (done) return;
			window.clearTimeout(timeoutId);
			done = true;
		},
		isDone () {
			return done;
		},
	};
}
