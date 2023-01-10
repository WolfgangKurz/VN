export default function Wait (msec: number): Promise<void> {
	return new Promise<void>(resolve => {
		setTimeout(() => resolve(), msec);
	});
}
