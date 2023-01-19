import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import config from "@/config";

import { BuildClass } from "@/libs/ClassName";
import Wait from "@/libs/Wait";

import SpriteImage from "@/components/SpriteImage";

import style from "./style.module.scss";

export enum TextboxPhase {
	None = 0,
	FadeIn = 1,
	SequencingText = 2,
	Done = 3,
	FadeOut = 4,
	Hide = 5,
}

interface TextboxProps {
	class?: string;

	text: string;
	teller: string;

	phase: TextboxPhase;

	onShown?: () => void;
	onHidden?: () => void;
	onTextDone?: () => void;
}

const Textbox: FunctionalComponent<TextboxProps> = (props) => {
	const [lastPhase, setLastPhase] = useState<TextboxPhase>(TextboxPhase.None);
	const [texts, setTexts] = useState<string[]>([]);

	const [teller, setTeller] = useState("");
	const [tellerSize, setTellerSize] = useState(24);

	const [cursor, setCursor] = useState(0);

	const TextEl = useRef<SVGTextElement>(null);
	const TellerEl = useRef<SVGTextElement>(null);

	const charSpeed = [50, 30, 10][config.text_Speed.value];

	useEffect(() => void (setLastPhase(props.phase)), [props.phase]);

	useLayoutEffect(() => {
		switch (props.phase) {
			case TextboxPhase.FadeIn:
				setCursor(0);
				setTexts([]);
				break;

			case TextboxPhase.SequencingText:
				setCursor(0);
				setTeller(props.teller);
				setTexts(props.text.split("").map(r => r === " " ? "\u00A0" : r)); // nbsp
				break;

			case TextboxPhase.Done:
				setCursor(texts.length);
				break;

			case TextboxPhase.Hide:
				if (props.onHidden)
					props.onHidden();
				break;
		}
	}, [props.phase]);

	useEffect(() => {
		if (props.phase !== TextboxPhase.SequencingText) return;
		if (props.phase < lastPhase) return;

		if (cursor < texts.length) {
			Wait(charSpeed, () => setCursor(c => c + 1));
		} else if (texts.length) {
			if (props.onTextDone)
				props.onTextDone();
		}
	}, [props.phase, texts, cursor]);

	useLayoutEffect(() => { // teller size update
		const { current: el } = TellerEl;
		if (!el) return;

		el.textContent = teller;

		let fs = 24;
		el.style.fontSize = `${fs}px`;

		while (el.getBBox().width > 102 - 10) {
			fs -= 0.5;
			el.style.fontSize = `${fs}px`;
		}

		setTellerSize(fs);
	}, [TextEl.current, teller]);

	const chars = (() => {
		const { current: el } = TextEl;
		if (!el) return [];

		const ret: preact.VNode[] = [];

		const bwo = 947 - 40; // box width (original)
		// bound width = (box width - box margin) - (teller width - (right margin - right offset))
		let bw = bwo - (!!props.teller ? (151 - (20 - 2)) : 0);
		let wx = 0, wy = 0;
		const h = 28; // font-size 28px

		const _t = texts.join("");
		const words = _t.split(/([\s.,?~-])/g).filter(x => x.length > 0);

		let cc = 0;
		for (const t of words) {
			const wt: Array<{ x: number, c: string; }> = [];
			let x = 0;

			const chars = t.split("");
			for (const c of chars) {
				cc++;

				el.textContent = c;
				const { width: w, height: h } = el.getBBox();

				if (wx + x + w > bw) {
					wx = 0;
					wy += h * 1.3; // line-height

					if (wy >= 51) bw = bwo; // teller box 크기 무시
				}

				if (cc <= cursor) // for word-break checking
					wt.push({ x, c });
				x += w;
			}

			ret.push(...wt.map(c => <text x={ 20 + wx + c.x } y={ 20 + wy }>
				{ c.c }
			</text>));

			if (cc > cursor) break;
			wx += x;
		}

		return ret;
	})();

	return <div
		class={ BuildClass(
			style.Textbox,
			props.phase === 1 && BuildClass(style.Fade, style.Display),
			(props.phase === 2 || props.phase === 3) && style.Display,
			props.phase === 4 && style.Fade,
			props.class,
		) }
		onTransitionEnd={ e => {
			e.preventDefault();
			if (props.phase === 1) { // fade-in
				if (props.onShown)
					props.onShown();
			} else if (props.phase === 4) { // fade-out
				if (props.onHidden)
					props.onHidden();
			}
		} }
	>
		<SpriteImage
			src="UI/sprite.png"
			sprite="text_box.png"
		/>

		<div class={ BuildClass(style.Teller, props.teller && style.Display) }>
			<SpriteImage
				src="UI/sprite.png"
				sprite="teller_box.png"
			/>

			<span style={ { fontSize: `${tellerSize}px` } }>
				{ teller }
			</span>
		</div>

		<svg class={ style.TextContainer } viewBox="0 0 947 242">
			<text class={ BuildClass(style.Calc, style.Text) } x="-100" y="-100" opacity="0" ref={ TextEl } />
			<text class={ BuildClass(style.Calc, style.Teller) } x="-100" y="-100" opacity="0" ref={ TellerEl } />
			{ chars }
		</svg>

		{ texts.length > 0 && cursor >= texts.length && props.phase === 3
			? <SpriteImage
				class={ style.NextIndicator }
				src="UI/sprite.png"
				sprite="text_next.png"
			/>
			: <></>
		}
	</div>;
};
export default Textbox;
