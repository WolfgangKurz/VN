import style from "./style.module.scss";

const Scene_Base: FunctionalComponent<JSX.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
	return <div class={ style.Scene } { ...props }>
		{ children }
	</div>;
};
export default Scene_Base;
