import { FunctionalComponent, Ref, RenderableProps } from "preact";
import { useLayoutEffect, useState } from "preact/hooks";
import { forwardRef } from "preact/compat";

interface ImageProps {
	src: string;
	exts?: string[];
}

type ForwardRefType<R, P = {}> = (props: Omit<RenderableProps<P>, "ref">, ref: Ref<R>) => ReturnType<FunctionalComponent>;

const fn: ForwardRefType<HTMLImageElement, JSX.HTMLAttributes<HTMLImageElement> & ImageProps> = ({ src, exts, ...props }, ref) => {
	const [base, setBase] = useState("");
	const [ext, setExt] = useState("");

	useLayoutEffect(() => {
		const idx = src.lastIndexOf(".");
		setBase(src.substring(0, idx));

		if (exts)
			setExt(exts[0]);
		else
			setExt(src.substring(idx));
	}, [src]);

	return <img
		{ ...props }
		src={ `${base}${ext}` }
		onError={ function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (exts) {
				const idx = exts.indexOf(ext);
				if (idx >= 0 && idx < exts.length - 1) {
					setExt(exts[idx + 1]);
					return;
				}
			}

			if (props.onError)
				props.onError.call(this, e);
		} }
		ref={ ref }
	/>;
};
const Image = forwardRef(fn);
export default Image;
