import { ComponentType } from "preact";
import { useEffect, useState } from "preact/hooks";

type ES<T> = { default: T; };

export interface LoaderProps {
	component: Promise<ComponentType | ES<ComponentType>>;
	loading?: preact.ComponentChildren;
}

const Loader: FunctionalComponent<LoaderProps> = ({ component, loading, ...props }) => {
	const [content, setContent] = useState<preact.VNode | undefined>(undefined);

	useEffect(() => {
		setContent(undefined);

		component.then(r => {
			const Component = "default" in r
				? r.default
				: r;

			setContent(<Component { ...props } />);
		});
	}, [component]);

	if (content) return <>{ content }</>;
	return <>loading</>;
};
export default Loader;
