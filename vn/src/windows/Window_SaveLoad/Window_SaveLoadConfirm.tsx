import { useEffect, useState } from "preact/hooks";

import { static_PlayUISE } from "@/static";

import { __dirname } from "@/libs/Const";
import { BuildClass } from "@/libs/ClassName";
import { Wait } from "@/libs/Blockable";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

interface WindowSaveLoadConfirmProps extends WindowBaseProps {
	isSave: boolean;

	onConfirm?: () => void;
}

const Window_SaveLoadConfirm: FunctionalComponent<WindowSaveLoadConfirmProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	useEffect(() => {
		Promise.all([
			SpriteImage.load("SaveLoad_Confirm/sprite.png"),
		]).then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	return <Window_Base
		class={ BuildClass(style.ConfirmWindow) }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<div class={ style.ConfirmWindow }>
			<SpriteImage
				src="SaveLoad_Confirm/sprite.png"
				sprite={ `window_${props.isSave ? "save" : "load"}.png` }
			/>

			<SpriteButton
				class={ style.YesButton }
				src="SaveLoad_Confirm/sprite.png"
				idle="btn_confirm_yes.png"
				active="btn_confirm_yes_down.png"

				onClick={ e => {
					e.preventDefault();

					static_PlayUISE("stop");
					if (props.onConfirm) props.onConfirm();

					if (props.isSave) {
						setDisplay(false);
						Wait(500, () => { // window fadeout 0.5s
							if (props.onClose) props.onClose();
						});
					}
				} }
			/>
			<SpriteButton
				class={ style.NoButton }
				src="SaveLoad_Confirm/sprite.png"
				idle="btn_confirm_no.png"
				active="btn_confirm_no_down.png"

				onClick={ e => {
					e.preventDefault();

					static_PlayUISE("stop");
					setDisplay(false);
					Wait(500, () => { // window fadeout 0.5s
						if (props.onClose) props.onClose();
					});
				} }
			/>
		</div>
	</Window_Base>;
};
export default Window_SaveLoadConfirm;
