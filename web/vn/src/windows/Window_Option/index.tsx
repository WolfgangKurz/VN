import { useEffect, useState } from "preact/hooks";

import config from "@/config";
import { static_PlayUISE } from "@/static";

import Wait from "@/libs/Wait";
import { BuildClass } from "@/libs/ClassName";
import Preloader from "@/libs/Preloader";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";
import SpriteSlide from "@/components/SpriteSlide";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

interface WindowOptionProps extends WindowBaseProps { }

const Window_Option: FunctionalComponent<WindowOptionProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	useEffect(() => {
		Promise.all([
			Preloader.image("/BG/BG_Option.png"),
			SpriteImage.load("Option/sprite.png"),
		]).then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	return <Window_Base
		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src="/BG/BG_Option.png" />

		<SpriteButton
			class={ style.BackButton }
			src="Option/sprite.png"
			idle="btn_back.png"

			onClick={ e => {
				e.preventDefault();

				static_PlayUISE("stop");
				setDisplay(false);
				Wait(500, () => { // window fadeout 0.5s
					if (props.onClose) props.onClose();
				});
			} }
		/>

		<div class={ BuildClass(style.VolumeText, style.VolumeSFX) }>{ config.volume_SFX.value }</div>
		<SpriteSlide
			class={ BuildClass(style.Slider, style.SliderSFX) }

			src="Option/sprite.png"
			bar="bar.png"
			track="bar_active.png"
			thumb="bar_thumb.png"

			value={ config.volume_SFX.value }
			onChange={ v => config.volume_SFX.value = Math.floor(v) }
		/>

		<div class={ BuildClass(style.VolumeText, style.VolumeBGM) }>{ config.volume_BGM.value }</div>
		<SpriteSlide
			class={ BuildClass(style.Slider, style.SliderBGM) }

			src="Option/sprite.png"
			bar="bar.png"
			track="bar_active.png"
			thumb="bar_thumb.png"

			value={ config.volume_BGM.value }
			onChange={ v => config.volume_BGM.value = Math.floor(v) }
		/>

		<SpriteImage
			class={ BuildClass(style.SpeedButton, [style.Slow, style.Regular, style.Fast][config.text_Speed.value]) }
			src="Option/sprite.png"
			sprite="btn_selected.png"
		/>

		<SpriteButton
			class={ BuildClass(style.SpeedButton, style.Slow) }
			src="Option/sprite.png"
			idle="btn_slow.png"

			onClick={ e => {
				e.preventDefault();
				if (config.text_Speed.peek() !== 0) {
					static_PlayUISE("dialog");
					config.text_Speed.value = 0;
				}
			} }
		/>
		<SpriteButton
			class={ BuildClass(style.SpeedButton, style.Regular) }
			src="Option/sprite.png"
			idle="btn_regular.png"

			onClick={ e => {
				e.preventDefault();
				if (config.text_Speed.peek() !== 1) {
					static_PlayUISE("dialog");
					config.text_Speed.value = 1;
				}
			} }
		/>
		<SpriteButton
			class={ BuildClass(style.SpeedButton, style.Fast) }
			src="Option/sprite.png"
			idle="btn_fast.png"

			onClick={ e => {
				e.preventDefault();
				if (config.text_Speed.peek() !== 2) {
					static_PlayUISE("dialog");
					config.text_Speed.value = 2;
				}
			} }
		/>
	</Window_Base>;
};
export default Window_Option;
