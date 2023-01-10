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

	return <div
		class={ BuildClass(style.SpriteButton, className) }
		{ ...props }

		onPointerEnter={ e => {
			setState(1);
		} }
		onPointerDown={ e => {
			e.preventDefault();

			if (!buttonRef.current) return;
			buttonRef.current.setPointerCapture(e.pointerId);

			setState(2);
		} }
		onPointerUp={ e => {
			if (!buttonRef.current) return;
			buttonRef.current.releasePointerCapture(e.pointerId);

			setState(1);
		} }
		onPointerLeave={ e => {
			setState(0);
		} }
		ref={ buttonRef }
	>
		{ src && sprite
			? <SpriteImage
				src={ src }
				sprite={ sprite }
			/>
			: <></>
		}
	</div>;
};
export default SpriteButton;
