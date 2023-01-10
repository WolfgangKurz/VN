import { useEffect, useState } from "preact/hooks";

import Wait from "@/libs/Wait";
import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";
import SpriteSlide from "@/components/SpriteSlide";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";
import config from "@/config";

interface WindowOptionProps extends WindowBaseProps { }

const Window_Option: FunctionalComponent<WindowOptionProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	useEffect(() => {
		SpriteImage.load("/IMG/Option/sprite.png")
			.then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	return <Window_Base
		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 1280 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src="/BG/BG_Option.png" />

		<SpriteButton
			class={ style.BackButton }
			src="/IMG/Option/sprite.png"
			idle="btn_back.png"

			onClick={ e => {
				e.preventDefault();

				setDisplay(false);
				Wait(500).then(() => {
					if (props.onClose) props.onClose();
				});
			} }
		/>

		<div class={ BuildClass(style.VolumeText, style.VolumeSFX) }>{ config.volume_SFX.value }</div>
		<SpriteSlide
			class={ BuildClass(style.Slider, style.SliderSFX) }

			src="/IMG/Option/sprite.png"
			bar="bar.png"
			track="bar_active.png"
			thumb="bar_thumb.png"

			value={ config.volume_SFX.value }
			onChange={ v => config.volume_SFX.value = Math.floor(v) }
		/>

		<div class={ BuildClass(style.VolumeText, style.VolumeBGM) }>{ config.volume_BGM.value }</div>
		<SpriteSlide
			class={ BuildClass(style.Slider, style.SliderBGM) }

			src="/IMG/Option/sprite.png"
			bar="bar.png"
			track="bar_active.png"
			thumb="bar_thumb.png"

			value={ config.volume_BGM.value }
			onChange={ v => config.volume_BGM.value = Math.floor(v) }
		/>

		<SpriteImage
			class={ BuildClass(style.SpeedButton, [style.Slow, style.Regular, style.Fast][config.text_Speed.value]) }
			src="/IMG/Option/sprite.png"
			sprite="btn_selected.png"
		/>

		<SpriteButton
			class={ BuildClass(style.SpeedButton, style.Slow) }
			src="/IMG/Option/sprite.png"
			idle="btn_slow.png"

			onClick={ e => {
				e.preventDefault();
				config.text_Speed.value = 0;
			} }
		/>
		<SpriteButton
			class={ BuildClass(style.SpeedButton, style.Regular) }
			src="/IMG/Option/sprite.png"
			idle="btn_regular.png"

			onClick={ e => {
				e.preventDefault();
				config.text_Speed.value = 1;
			} }
		/>
		<SpriteButton
			class={ BuildClass(style.SpeedButton, style.Fast) }
			src="/IMG/Option/sprite.png"
			idle="btn_fast.png"

			onClick={ e => {
				e.preventDefault();
				config.text_Speed.value = 2;
			} }
		/>
	</Window_Base>;
};
export default Window_Option;
