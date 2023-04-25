import NodePATH from "node:path";

import { useEffect, useState } from "preact/hooks";

import { static_PlayUISE } from "@/static";

import { __dirname } from "@/libs/Const";
import GlobalStorage from "@/libs/GlobalStorage";
import { Wait } from "@/libs/Blockable";
import Preloader from "@/libs/Preloader";
import { BuildClass } from "@/libs/ClassName";
import { CharTypeNames, Lists as CollectionLists } from "@/libs/Collection";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";
import Window_CollectionIllust_Detail from "./Window_CollectionIllust_Detail";

import style from "./style.module.scss";

const path: typeof NodePATH = window.nw.require("path");

interface WindowCollectionProps extends WindowBaseProps { }

const Window_CollectionIllust: FunctionalComponent<WindowCollectionProps> = (props) => {
	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	const [chars] = useState<string[]>(CollectionLists.chars);
	const [page, setPage] = useState(0);

	const [subwindow, setSubwindow] = useState<preact.VNode | undefined>(undefined);

	useEffect(() => {
		Promise.all([
			Preloader.image("/BG/BG_CollectionIllust.png"),
			SpriteImage.load("Collection_Illust/sprite.png"),
		]).then(() => setLoaded(true));
	}, []);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	const [charGroup] = useState(() => {
		const reg = /^(STD_[^_]+)_.+/;
		const ret = new Set<string>();
		chars.forEach(c => {
			if (!reg.test(c)) return;

			const m = reg.exec(c);
			if (!m) return;

			ret.add(m[1]);
		});

		return [...ret].sort();
	});


	function isSeen (filename: string): boolean {
		const list = GlobalStorage.Instance.seen.char;
		const name = path.basename(filename, path.extname(filename));
		return list.some(r => r.startsWith(name));
	}

	const maxPage = Math.max(0, Math.ceil(charGroup.length / 4) - 1);
	const displayLeftCursor = page > 0;
	const displayRightCursor = page < maxPage;

	return <Window_Base
		class={ BuildClass(style.CollectionWindow, style.CollectionIllust) }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<svg xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="locked-filter">
					{/* black color */ }
					<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
				</filter>
			</defs>
		</svg>

		<img src="/BG/BG_CollectionIllust.png" />

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
			src="Collection_Illust/sprite.png"
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
			src="Collection_Illust/sprite.png"
			idle="tb_right_1.png"
			active="tb_right_2.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page + 1);
			} }
		/> }

		<div class={ style.Chars }>
			{ charGroup.slice(page * 4, (page + 1) * 4).map(r => {
				return <div
					class={ BuildClass(style.Item, !isSeen(r) && style.NotSeen) }
					onClick={ e => {
						e.preventDefault();

						if (!isSeen(r)) {
							static_PlayUISE("arrow_disabled");
							return;
						}

						static_PlayUISE("arrow");
						setSubwindow(<Window_CollectionIllust_Detail
							char={ r }
							onClose={ () => setSubwindow(undefined) }
						/>);
					} }
				>
					<SpriteImage
						src="Collection_Illust/sprite.png"
						sprite="illust_wd.png"
					/>
					<SpriteImage
						class={ style.Button }
						src="Collection_Illust/sprite.png"
						sprite="illust_wd_1.png"
					/>
					<SpriteImage
						class={ BuildClass(style.Button, style.Active) }
						src="Collection_Illust/sprite.png"
						sprite="illust_wd_2.png"
					/>

					<div class={ style.CharName }>
						{ !isSeen(r) ? "???" : CharTypeNames[r] || r }
					</div>

					<img
						key={ `collection-illust-group-${r}` }
						class={ style.SCG }
						src={ `/IMG/SCG/${r}_1.png` }
					/>
				</div>;
			}) }
		</div>

		{ subwindow }
	</Window_Base>;
};
export default Window_CollectionIllust;
