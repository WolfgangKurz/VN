import { BuildClass } from "@/libs/ClassName";

import style from "./style.module.scss";

export interface WindowBaseProps {
	class?: string;

	left?: number;
	top?: number;
	width?: number;
	height?: number;

	display?: boolean;

	/** in msec, `1000` default */
	transitionTime?: number;

	onClose?: () => void;
}

const Window_Base: FunctionalComponent<WindowBaseProps> = (props) => {
	return <div
		class={ BuildClass(style.Window, props.display && style.Display, props.class) }
		style={ {
			left: props.left !== undefined ? `${props.left}px` : undefined,
			top: props.top !== undefined ? `${props.top}px` : undefined,
			width: props.width !== undefined ? `${props.width}px` : undefined,
			height: props.height !== undefined ? `${props.height}px` : undefined,
			"--transition-duration": `${props.transitionTime || 1000}ms`,
		} }
	>
		<div class={ style.Content }>
			{ props.children }
		</div>
	</div>;
};
export default Window_Base;
