import NodePATH from "node:path";

import { useEffect, useState } from "preact/hooks";

import config from "@/config";
import { static_PlayUISE } from "@/static";

import { __dirname } from "@/libs/Const";
import Wait from "@/libs/Wait";
import Preloader from "@/libs/Preloader";
import { BuildClass } from "@/libs/ClassName";
import ManagedAudio from "@/libs/ManagedAudio";
import { BGMNames, Lists as CollectionLists } from "@/libs/Collection";
import GlobalStorage from "@/libs/GlobalStorage";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

interface WindowCollectionProps extends WindowBaseProps { }

const Window_CollectionMusic: FunctionalComponent<WindowCollectionProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	const [musics] = useState<string[]>(CollectionLists.bgm);
	const [page, setPage] = useState(0);

	const [selected, setSelected] = useState<string | null>(null);

	useEffect(() => {
		config.volatile_TitleBGMPause.value = true;

		Promise.all([
			Preloader.image("/BG/BG_CollectionMusic.png"),
			Preloader.image("/IMG/FX/rain.apng"),
			SpriteImage.load("Collection_Music/sprite.png"),
		]).then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	useEffect(() => {
		if (!selected) return;

		const bgm = new ManagedAudio(true);
		bgm.load(`/BGM/${selected}.mp3`);
		bgm.play();

		return () => {
			bgm.destroy();
		};
	}, [selected]);

	function isSeen (filename: string): boolean {
		const list = GlobalStorage.Instance.seen.bgm;
		return list.includes(filename);
	}

	const maxPage = Math.max(0, Math.ceil(musics.length / 7) - 1);
	const displayLeftPage = page > 0;
	const displayRightPage = page < maxPage;

	return <Window_Base
		class={ BuildClass(style.CollectionWindow, style.CollectionMusic) }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src="/BG/BG_CollectionMusic.png" />
		<img
			class={ style.FX }
			src="/IMG/FX/rain.apng"
		/>

		<SpriteButton
			class={ style.BackButton }
			src="Collection/sprite.png"
			idle="btn_back.png"

			onClick={ e => {
				e.preventDefault();

				config.volatile_TitleBGMPause.value = false;

				static_PlayUISE("stop");
				setDisplay(false);
				Wait(500, () => { // window fadeout 0.5s
					if (props.onClose) props.onClose();
				});
			} }
		/>
		<SpriteImage
			class={ style.MusicBox }
			src="Collection_Music/sprite.png"
			sprite="music_b.png"
		/>

		{ selected && <div class={ style.PlayingTitle }>
			{ BGMNames[selected] || selected }
		</div> }

		<SpriteButton
			class={ style.MusicSprite }
			src="Collection_Music/sprite.png"
			idle={ ["music_wf1.png", "music_wf2.png", "music_wf3.png"] }
			timePerFrame={ 500 }
		/>

		<div class={ style.PageDisplay }>
			{ page + 1 } / { maxPage + 1 }
		</div>

		{ displayLeftPage && <SpriteButton
			class={ style.PageLeft }
			src="Collection_Music/sprite.png"
			idle="music_p1.png"
			active="music_p2.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page - 1);
			} }
		/> }
		{ displayRightPage && <SpriteButton
			class={ style.PageRight }
			src="Collection_Music/sprite.png"
			idle="music_n1.png"
			active="music_n2.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page + 1);
			} }
		/> }

		<div class={ style.Musics }>
			{ musics.slice(page * 7, (page + 1) * 7).map(r => {
				return <div
					class={ BuildClass(style.Item, !isSeen(r) && style.NotSeen) }
					onClick={ e => {
						e.preventDefault();

						if (!isSeen(r)) {
							static_PlayUISE("arrow_disabled");
							return;
						}
						setSelected(r);
					} }
				>
					{ selected === r && <SpriteImage
						class={ style.Selected }
						src="Collection_Music/sprite.png"
						sprite="music_b_b3.png"
					/> }

					<SpriteImage
						src="Collection_Music/sprite.png"
						sprite="music_b_b.png"
					/>
					<SpriteImage
						class={ style.Active }
						src="Collection_Music/sprite.png"
						sprite="music_b_b2.png"
					/>

					<div class={ style.BGMName }>
						{ !isSeen(r)
							? "???"
							: BGMNames[r] || r
						}
					</div>
				</div>;
			}) }
		</div>
	</Window_Base>;
};
export default Window_CollectionMusic;
