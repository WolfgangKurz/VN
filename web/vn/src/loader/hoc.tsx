import { Component, ComponentType, RenderableProps } from "preact";

export default function withToClassComponent<T> (WithComponent: ComponentType<T>) {
	return class WrapperComponent extends Component<T> {
		render (props: RenderableProps<T>) {
			return <WithComponent { ...props } />;
		}
	};
}
