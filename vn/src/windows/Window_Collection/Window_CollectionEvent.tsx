import NodePATH from "node:path";

import { useCallback, useEffect, useState } from "preact/hooks";

import { static_PlayUISE } from "@/static";

import { __dirname } from "@/libs/Const";
import { Wait } from "@/libs/Blockable";
import Preloader from "@/libs/Preloader";
import { Lists as CollectionLists } from "@/libs/Collection";
import GlobalStorage from "@/libs/GlobalStorage";
import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

const path: typeof NodePATH = window.nw.require("path");

interface WindowCollectionProps extends WindowBaseProps { }

const Window_CollectionEvent: FunctionalComponent<WindowCollectionProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	const [events] = useState<string[]>(CollectionLists.events);
	const [page, setPage] = useState(0);

	const [selected, setSelected] = useState<string | null>(null);
	const [lastSelected, setLastSelected] = useState("");

	useEffect(() => {
		Promise.all([
			Preloader.image("/BG/BG_CollectionEvent.png"),
			SpriteImage.load("Collection_Event/sprite.png"),
		]).then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	useEffect(() => {
		if (selected)
			setLastSelected(selected);
	}, [selected]);

	const selectedCb = useCallback((e: KeyboardEvent) => {
		if (!selected) return;

		if (e.key === "Escape")
			setSelected(null);
	}, [selected]);
	useEffect(() => { // Global effect register
		const fn = selectedCb;
		window.addEventListener("keydown", fn);
		return () => {
			window.removeEventListener("keydown", fn);
		};
	}, [selectedCb]);


	function isSeen (filename: string): boolean {
		const list = GlobalStorage.Instance.seen.pic;
		return list.includes(path.basename(filename, path.extname(filename)));
	}

	const maxPage = Math.max(0, Math.ceil(events.length / 6) - 1);
	const displayLeftCursor = page > 0;
	const displayRightCursor = page < maxPage;

	return <Window_Base
		class={ BuildClass(style.CollectionWindow, style.CollectionEvent) }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src="/BG/BG_CollectionEvent.png" />

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

		{ displayLeftCursor && <SpriteButton
			class={ style.CursorLeft }
			src="Collection_Event/sprite.png"
			idle="tb_left_1.png"
			active="tb_left_2.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page - 1);
			} }
		/> }
		{ displayRightCursor && <SpriteButton
			class={ style.CursorRight }
			src="Collection_Event/sprite.png"
			idle="tb_right_1.png"
			active="tb_right_2.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page + 1);
			} }
		/> }

		<div class={ style.Events }>
			{ events.slice(page * 6, (page + 1) * 6).map((r, i) => {
				return <div
					class={ BuildClass(style.Item, !isSeen(r) && style.NotSeen) }
					onClick={ e => {
						e.preventDefault();

						if (!isSeen(r)) {
							static_PlayUISE("arrow_disabled");
							return;
						}

						static_PlayUISE("arrow");
						setSelected(r);
					} }
				>
					<SpriteImage
						class={ style.Hover }
						src="Collection_Event/sprite.png"
						sprite="even_pi.png"
					/>

					{ isSeen(r)
						? <img
							key={ `collection-event-${page * 6 + i + 1}` }
							class={ style.Entity }
							src={ `/IMG/CUT/${r}` }
						/>
						: <SpriteImage
							class={ style.Entity }
							src="Collection_Event/sprite.png"
							sprite="event_lock.png"
						/>
					}

					<SpriteImage
						class={ style.Cover }
						src="Collection_Event/sprite.png"
						sprite="even_d.png"
					/>
				</div>;
			}) }
		</div>

		<img
			class={ BuildClass(style.EventSelected, selected && style.Display) }
			src={ `/IMG/CUT/${lastSelected}` }
			onClick={ e => {
				e.preventDefault();
				setSelected(null);
			} }
			onDragStart={ e => { // ignore drag
				e.preventDefault();
				e.stopPropagation();
			} }
		/>
	</Window_Base>;
};
export default Window_CollectionEvent;
