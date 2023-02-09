import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";

import style from "./style.module.scss";

interface SpriteButtonProps {
	/** times per sprite frame in msec, default `200` */
	timePerFrame?: number;

	src: string;

	disabled?: boolean;

	idle: string | string[];
	hover?: string | string[];
	active?: string | string[];
}

const SpriteButton: FunctionalComponent<JSX.HTMLAttributes<HTMLDivElement> & SpriteButtonProps> = ({ class: className, timePerFrame, src, disabled, idle, hover, active, ...props }) => {
	const [state, setState] = useState(0); // 0: idle, 1: hover, 2: active
	const [frame, setFrame] = useState(0); // frame number

	const buttonRef = useRef<HTMLDivElement>(null);

	const sprites = [...new Set([idle, hover || [], active || []].flat())];
	const sprite = (() => {
		const _idle = Array.isArray(idle) ? idle[frame] : idle;

		if (disabled || state === 0) {
			return _idle;
		} else if (state === 1) {
			if (hover !== undefined) {
				if (Array.isArray(hover))
					return hover[frame];
				else
					return hover;
			} else
				return _idle;
		} else if (state === 2) {
			if (active !== undefined) {
				if (Array.isArray(active))
					return active[frame];
				else
					return active;
			} else
				return _idle;
		}
		return "";
	})();

	useLayoutEffect(() => {
		setFrame(0);

		const target = [idle, hover, active][disabled ? 0 : state] || undefined;
		const interval = target !== undefined && Array.isArray(target)
			? window.setInterval(() => setFrame(frame => (frame + 1) % target.length), timePerFrame || 200)
			: undefined;

		return () => {
			if (interval !== undefined)
				window.clearInterval(interval);
		};
	}, [state, timePerFrame, disabled, idle, hover, active]);

	function proxy<T extends "onPointerEnter" | "onPointerDown" | "onPointerUp" | "onPointerLeave"> (this: any, ev: T, fn: JSX.PointerEventHandler<HTMLDivElement>) {
		return (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
			fn.call(this as never, e);

			if (props[ev])
				props[ev]!.call(this as never, e);
		};
	}

	return <div
		class={ BuildClass("sprite-button", style.SpriteButton, className) }
		{ ...props }

		onPointerEnter={ proxy("onPointerEnter", e => {
			setState(1);
		}) }
		onPointerDown={ proxy("onPointerDown", e => {
			e.preventDefault();

			if (!buttonRef.current) return;
			buttonRef.current.setPointerCapture(e.pointerId);

			setState(2);
		}) }
		onPointerUp={ proxy("onPointerUp", e => {
			if (!buttonRef.current) return;
			buttonRef.current.releasePointerCapture(e.pointerId);

			setState(1);
		}) }
		onPointerLeave={ proxy("onPointerLeave", e => {
			setState(0);
		}) }
		ref={ buttonRef }
	>
		{ src
			? sprites.map(s => <SpriteImage
				class={ BuildClass(style.Sprite, sprite === s && style.Active) }
				src={ src }
				sprite={ s }
			/>)
			: <></>
		}
	</div>;
};
export default SpriteButton;
