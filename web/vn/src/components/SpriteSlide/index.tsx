import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";

import style from "./style.module.scss";

interface SpriteSlideProps {
	class?: string;

	src: string;

	bar: string; // background
	thumb: string;
	track: string; // filled bar

	/** default `0` */
	min?: number;

	/** default `100` */
	max?: number;

	/** default `50` */
	value?: number;

	onChange?: (v: number) => void;
}

const SpriteSlide: FunctionalComponent<SpriteSlideProps> = (props) => {
	const [trackLoaded, setTrackLoaded] = useState(false);
	const [sliding, setSliding] = useState(false);

	const [trackClip, setTrackClip] = useState<string | undefined>(undefined);
	const [thumbLeft, setThumbLeft] = useState<number | undefined>(undefined);

	const trackRef = useRef<HTMLImageElement>(null);

	const max = props.max ?? 100;
	const min = props.min ?? 0;
	const value = props.value ?? 50;

	const p = (value - min) / (max - min);

	useLayoutEffect(() => {
		if (!trackRef.current) {
			setTrackClip(undefined);
			setThumbLeft(undefined);
			return;
		}

		const pp = p * 100;
		const w = trackRef.current.clientWidth;
		const x = w * p;

		setTrackClip(`polygon(0% 0%, ${pp}% 0%, ${pp}% 100%, 0% 100%)`);
		setThumbLeft(x);
	}, [p, trackLoaded]);

	function doSlide (x: number, y: number): void {
		if (!trackRef.current) return;

		const width = max - min;

		let ox = 0;
		{ // get "real" page left
			let cur: HTMLElement = trackRef.current;
			do {
				ox += cur.offsetLeft;

				const par = cur.offsetParent;
				if (par instanceof HTMLElement)
					cur = par;
				else
					break;
			} while (true);
		}

		const tw = trackRef.current.clientWidth; // track width
		const tx = ox - tw / 2; // track left (transform-moved)
		const bx = x - tx; // track based offset

		let value = (bx / tw) * width + min;
		if (value < min) value = min;
		if (value > max) value = max;
		if (props.onChange) props.onChange(value);
	}

	return <div
		class={ BuildClass("sprite-slide", style.SpriteSlide, trackLoaded && style.Loaded, props.class) }
		onPointerDown={ e => {
			if (e.button !== 0) return;

			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);

			setSliding(true);
			doSlide(e.pageX, e.pageY);
		} }
		onPointerMove={ e => {
			e.preventDefault();
			if (sliding) doSlide(e.pageX, e.pageY);
		} }
		onPointerUp={ e => {
			e.preventDefault();
			e.currentTarget.releasePointerCapture(e.pointerId);

			setSliding(false);
		} }
	>
		<SpriteImage
			class={ style.Bar }
			src={ props.src }
			sprite={ props.bar }
		/>

		<SpriteImage
			class={ style.Track }
			src={ props.src }
			sprite={ props.track }

			onLoad={ () => setTrackLoaded(true) }

			style={ { clipPath: trackClip } }
			ref={ trackRef }
		/>

		<SpriteImage
			class={ style.Thumb }
			src={ props.src }
			sprite={ props.thumb }

			style={ { left: thumbLeft } }
		/>
	</div>;
};
export default SpriteSlide;
