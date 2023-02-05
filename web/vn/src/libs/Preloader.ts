export default class Preloader {
	public static async image (src: string): Promise<HTMLImageElement> {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();

			const errorHandler = (e: ErrorEvent) => {
				image.removeEventListener("load", loadHandler);
				image.removeEventListener("error", errorHandler);
				reject(e);
			};
			const loadHandler = () => {
				image.removeEventListener("load", loadHandler);
				image.removeEventListener("error", errorHandler);
				resolve(image);
			};

			image.addEventListener("load", loadHandler);
			image.addEventListener("error", errorHandler);
			image.src = src;
		});
	}
}
