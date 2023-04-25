export default interface Blockable {
	/**
	 * call callback function immediately and set to done state
	 * @returns `true` when flushed, `false` when already done or not flushable
	 */
	flush (): boolean;

	/**
	 * do not call callback function and set to done state
	 * @returns `true` when canceled, `false` when already done
	 */
	cancel (): boolean;

	/**
	 * returns is this `Blockable` done
	 */
	isDone (): boolean;
}

export function Block (fn: () => boolean): Blockable {
	let done = false;
	return {
		flush: () => { // cannot be flushed, just check with parameter
			if (done) return false;

			const v = fn();
			if(v) done = true;
			return v;
		},
		cancel: () => { // only could be canceled
			if (done) return false;
			done = true;
			return true;
		},
		isDone: () => done,
	};
}
export function Wait (msec: number, cb: () => void): Blockable {
	let done = false;
	const timeoutId = window.setTimeout(() => {
		done = true;
		cb();
	}, msec);

	return {
		flush () {
			if (done) return false;
			this.cancel();
			cb();
			return true;
		},
		cancel () {
			if (done) return false;
			window.clearTimeout(timeoutId);
			done = true;
			return true;
		},
		isDone: () => done,
	};
}
