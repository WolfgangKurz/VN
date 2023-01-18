import { useEffect, useState } from "preact/hooks";

import Wait from "@/libs/Wait";
import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";
import SpriteSlide from "@/components/SpriteSlide";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";
import config from "@/config";

interface WindowSaveLoadProps extends WindowBaseProps {
	isSave: boolean;

	onModeChange?: (mode: "save" | "load") => void;
}

const Window_SaveLoad: FunctionalComponent<WindowSaveLoadProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	useEffect(() => {
		SpriteImage.load("SaveLoad/sprite.png")
			.then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	const [page, setPage] = useState(0);

	return <Window_Base
		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 1280 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src={ `/BG/BG_${props.isSave ? "Save" : "Load"}.png` } />

		<SpriteButton
			class={ style.BackButton }
			src="SaveLoad/sprite.png"
			idle="btn_back.png"

			onClick={ e => {
				e.preventDefault();

				setDisplay(false);
				Wait(500, () => { // window fadeout 0.5s
					if (props.onClose) props.onClose();
				});
			} }
		/>

		<SpriteButton
			class={ BuildClass(style.ModeButton, style.Save, props.isSave && style.Disabled) }
			src="SaveLoad/sprite.png"
			idle={ props.isSave ? "btn_save_down.png" : "btn_save.png" }
			disabled={ props.isSave }

			onClick={ e => {
				e.preventDefault();

				if (props.isSave) return;
				if (props.onModeChange)
					props.onModeChange("save");
			} }
		/>
		<SpriteButton
			class={ BuildClass(style.ModeButton, style.Load, !props.isSave && style.Disabled) }
			src="SaveLoad/sprite.png"
			idle={ !props.isSave ? "btn_load_down.png" : "btn_load.png" }
			disabled={ !props.isSave }

			onClick={ e => {
				e.preventDefault();

				if (!props.isSave) return;
				if (props.onModeChange)
					props.onModeChange("load");
			} }
		/>

		{/* Page buttons */ }
		<div class={ style.PageButtons }>
			{ new Array(10).fill(0).map((_, i) => <SpriteButton
				class={ BuildClass(style.PageButton, page === i && style.Current) }
				src="SaveLoad/sprite.png"
				idle={ `tab_p${(i + 1).toString().padStart(2, "0")}${page === i ? "_active" : ""}.png` }
				active={ `tab_p${(i + 1).toString().padStart(2, "0")}_active.png` }
				disabled={ page === i }

				onClick={ e => {
					e.preventDefault();

					if (page === i) return;
					setPage(i);
				} }
			/>) }
		</div>

		{/* Slots */ }
		<div class={ style.Slots }>
			{ new Array(6).fill(0).map((_, i) => <div class={ style.Slot }>
				{/* <SpriteImage /> */ }
			</div>) }
		</div>
	</Window_Base>;
};
export default Window_SaveLoad;
