import * as PIXI from "pixi.js";

const loadingSpritesheets: Record<string, Array<() => void>> = {};
const cachedSpritesheets: Record<string, [PIXI.Loader, PIXI.Spritesheet]> = {};

type ResolveType = (value: PIXI.Spritesheet | PromiseLike<PIXI.Spritesheet>) => void;

export default function loadSpritesheet (path: string): Promise<PIXI.Spritesheet> {
	function doLoad (path: string, resolve: ResolveType, reject: (reason?: any) => void) {
		if (path in cachedSpritesheets) {
			resolve(cachedSpritesheets[path][1]);
			return;
		}
		if (path in loadingSpritesheets) {
			loadingSpritesheets[path].push(() => resolve(cachedSpritesheets[path][1]));
			return;
		}

		loadingSpritesheets[path] = [];

		const loader = new PIXI.Loader();
		loader.onError.add(e => reject(e));
		loader.add(path, `assets/${path}.json`, {
			name: path,
			key: path,
		})
			.load((loader, resources) => {
				cachedSpritesheets[path] = [loader, resources[path].spritesheet!];
				resolve(cachedSpritesheets[path][1]);

				loadingSpritesheets[path].forEach(cb => cb());
				delete loadingSpritesheets[path];
			});
	}

	return new Promise<PIXI.Spritesheet>((resolve, reject) => doLoad(path, resolve, reject));
}
