import { FunctionalComponent, Ref, RenderableProps } from "preact";
import { useLayoutEffect, useState } from "preact/hooks";
import { forwardRef } from "preact/compat";

import RECT from "@/types/RECT";

import { TRANSPARENT } from "@/libs/Const";

type SpriteJson = Record<string, RECT>;

const SpriteLoading: Record<string, VoidFunction[]> = {};
const SpriteCache: Record<string, Record<string, string>> = {};
// Record< spriteUrl , Record< spriteName , blobUrl >>

interface SpriteImageProps {
	src: string;
	sprite: string;
}

type ForwardRefType<R, P = {}> = (props: Omit<RenderableProps<P>, "ref">, ref: Ref<R>) => ReturnType<FunctionalComponent>;

const fn: ForwardRefType<HTMLImageElement, JSX.HTMLAttributes<HTMLImageElement> & SpriteImageProps> = ({ src, sprite, ...props }, ref) => {
	const [image, setImage] = useState("");

	useLayoutEffect(() => {
		SpriteImage.load(src)
			.then(() => {
				if (sprite in SpriteCache[src])
					setImage(SpriteCache[src][sprite]);
				else {
					console.warn(`[SpriteImage] Spritesheet loaded but sprite "${sprite}" not found`);
					setImage("");
				}
			});
	}, [src, sprite]);

	return <img
		{ ...props }
		src={ image || TRANSPARENT }
		onLoad={ function (e) {
			if (e.currentTarget.src === TRANSPARENT) return;
			if (props.onLoad) props.onLoad.call(this, e);
		} }
		ref={ ref }
	/>;
};
const SpriteImage = Object.assign(
	forwardRef(fn),
	{
		load (src: string): Promise<void> {
			return new Promise<void>(resolve => {
				if (src in SpriteCache) return resolve(); // in cache

				// not in cache
				if (src in SpriteLoading) { // loading
					SpriteLoading[src].push(() => resolve());

				} else { // start loading
					SpriteLoading[src] = [];

					const jsonName = src.substring(0, src.lastIndexOf(".")) + ".json";
					const jsonUrl = `/IMG/Sprites/${jsonName}`;
					console.log(src, jsonUrl);
					fetch(jsonUrl).then(r => r.json())
						.then(async (json: SpriteJson) => { // loaded
							const ret: Record<string, string> = {};

							const img = await new Promise<HTMLImageElement>((resolve, reject) => {
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
								image.src = `/IMG/Sprites/${src}`;
							});

							const cv = document.createElement("canvas");
							const ctx = cv.getContext("2d");
							if (!ctx) throw new Error("Failed to get canvas 2d context"); // :(

							const frames = Object.keys(json);
							for (const name of frames) {

								const frame = json[name];
								cv.width = frame.w;
								cv.height = frame.h;

								ctx.clearRect(0, 0, cv.width, cv.height);
								ctx.drawImage(
									img,
									frame.x, frame.y, frame.w, frame.h,
									0, 0, frame.w, frame.h,
								);

								ret[name] = await new Promise<string>((resolve, reject) => {
									cv.toBlob(b => {
										if (!b) return reject(new Error("Failed to convert canvas into blob"));
										resolve(URL.createObjectURL(b));
									}, "image/png");
								});
							}

							SpriteCache[src] = ret;
							resolve();
						})
						.catch(e => {
							console.error("[SpriteImage] Failed to load sprite image");
							console.error(e);
						})
						.finally(() => {
							SpriteLoading[src].forEach(cb => cb());
							delete SpriteLoading[src];
						});
				}
			});
		},
	},
);
export default SpriteImage;
