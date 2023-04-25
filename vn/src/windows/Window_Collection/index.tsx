import { useEffect, useLayoutEffect, useState } from "preact/hooks";

import { static_PlayUISE } from "@/static";

import { __dirname } from "@/libs/Const";
import { Wait } from "@/libs/Blockable";
import Preloader from "@/libs/Preloader";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";
import Window_CollectionEvent from "./Window_CollectionEvent";
import Window_CollectionIllust from "./Window_CollectionIllust";
import Window_CollectionMusic from "./Window_CollectionMusic";

import style from "./style.module.scss";

interface WindowCollectionProps extends WindowBaseProps { }

const Window_Collection: FunctionalComponent<WindowCollectionProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	const [sd_id, setSDID] = useState(0);
	const [subwindow, setSubwindow] = useState<preact.VNode | undefined>(undefined);

	useLayoutEffect(() => {
		setSDID(Math.floor(Math.random() * 8) + 1);
	}, []);

	useEffect(() => {
		if (!sd_id) return;

		Promise.all([
			Preloader.image("/BG/BG_Collection.png"),
			Preloader.image(`/IMG/collect_sd_${sd_id}.png`),
			SpriteImage.load("Collection/sprite.png"),
		]).then(() => setLoaded(true));
	}, [sd_id]);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	return <Window_Base
		class={ style.CollectionWindow }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src="/BG/BG_Collection.png" />

		<SpriteButton
			class={ style.BackButton }
			src="Collection/sprite.png"
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

		<img
			class={ style.SD }
			src={ `/IMG/collect_sd_${sd_id}.png` }
		/>

		<div class={ style.Buttons }>
			<SpriteButton
				class={ style.Button }
				src="Collection/sprite.png"
				idle="btn_event.png"
				hover={ [
					"btn_event_hover1.png",
					"btn_event_hover2.png",
					"btn_event_hover3.png",
					"btn_event_hover4.png",
				] }

				onPointerEnter={ e => {
					static_PlayUISE("hover");
				} }
				onClick={ e => {
					e.preventDefault();

					static_PlayUISE("click");
					setSubwindow(<Window_CollectionEvent
						onClose={ () => setSubwindow(undefined) }
					/>);
				} }
			/>

			<SpriteButton
				class={ style.Button }
				src="Collection/sprite.png"
				idle="btn_illust.png"
				hover={ [
					"btn_illust_hover1.png",
					"btn_illust_hover2.png",
					"btn_illust_hover3.png",
					"btn_illust_hover4.png",
				] }

				onPointerEnter={ e => {
					static_PlayUISE("hover");
				} }
				onClick={ e => {
					e.preventDefault();

					static_PlayUISE("click");
					setSubwindow(<Window_CollectionIllust
						onClose={ () => setSubwindow(undefined) }
					/>);
				} }
			/>

			<SpriteButton
				class={ style.Button }
				src="Collection/sprite.png"
				idle="btn_music.png"
				hover={ [
					"btn_music_hover1.png",
					"btn_music_hover2.png",
					"btn_music_hover3.png",
					"btn_music_hover4.png",
				] }

				onPointerEnter={ e => {
					static_PlayUISE("hover");
				} }
				onClick={ e => {
					e.preventDefault();

					static_PlayUISE("click");
					setSubwindow(<Window_CollectionMusic
						onClose={ () => setSubwindow(undefined) }
					/>);
				} }
			/>
		</div>

		{ subwindow }
	</Window_Base>;
};
export default Window_Collection;
