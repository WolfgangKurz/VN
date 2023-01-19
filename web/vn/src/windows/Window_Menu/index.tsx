import { useEffect, useState } from "preact/hooks";

import config from "@/config";

import Wait from "@/libs/Wait";
import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

interface WindowMenuProps extends WindowBaseProps { }

const Window_Menu: FunctionalComponent<WindowMenuProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);
	const [fade, setFade] = useState(false);

	useEffect(() => {
		SpriteImage.load("Option/sprite.png")
			.then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	return <>
		<Window_Base
			class={ style.Window_Menu }

			left={ 0 }
			top={ 0 }
			width={ 1280 }
			height={ 720 }

			display={ display }

			transitionTime={ 500 }
		>
			<div class={ style.Buttons }>
				<SpriteButton
					class={ style.ContinueButton }
					src="UI/sprite.png"
					idle="btn_menu_continue.png"
					hover={ [
						"btn_menu_continue_hover1.png",
						"btn_menu_continue_hover2.png",
						"btn_menu_continue_hover3.png",
						"btn_menu_continue_hover4.png",
					] }

					onClick={ e => {
						e.preventDefault();

						setDisplay(false);
						Wait(500, () => { // window fadeout 0.5s
							if (props.onClose) props.onClose();
						});
					} }
				/>
				<SpriteButton
					class={ style.QuitButton }
					src="UI/sprite.png"
					idle="btn_menu_quit.png"
					hover={ [
						"btn_menu_quit_hover1.png",
						"btn_menu_quit_hover2.png",
						"btn_menu_quit_hover3.png",
						"btn_menu_quit_hover4.png",
					] }

					onClick={ e => {
						e.preventDefault();

						setFade(true);
						Wait(500, () => { // window fadeout 0.5s
							config.volatile_Scene.value = "Scene_Title";
						});
					} }
				/>
			</div>
		</Window_Base>
		<div class={ BuildClass(style.Fader, fade && style.Display) } />
	</>;
};
export default Window_Menu;
