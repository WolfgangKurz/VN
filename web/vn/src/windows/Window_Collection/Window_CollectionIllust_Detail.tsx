import NodePATH from "node:path";

import { useEffect, useLayoutEffect, useState } from "preact/hooks";

import { static_PlayUISE } from "@/static";

import { __dirname } from "@/libs/Const";
import Wait from "@/libs/Wait";
import Preloader from "@/libs/Preloader";
import { CharTypeNames, FaceTypeNames, Lists as CollectionLists } from "@/libs/Collection";
import GlobalStorage from "@/libs/GlobalStorage";
import { BuildClass } from "@/libs/ClassName";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

const path: typeof NodePATH = window.nw.require("path");

interface WindowCollectionDetailProps extends WindowBaseProps {
	char: string;
}

const Window_CollectionIllust_Detail: FunctionalComponent<WindowCollectionDetailProps> = (props) => {
	function parseFaceId (id: string): number {
		const reg = /_([0-9]+)\.[a-zA-Z]+$/;
		if (reg.test(id))
			return parseInt(reg.exec(id)![1]);
		return 0;
	}
	function filterChars () {
		const c = CollectionLists.chars;
		return c.filter(r => r.startsWith(props.char))
			.map(r => r.substring(props.char.length))
			.sort((a, b) => {
				const ia = parseFaceId(a);
				const ib = parseFaceId(b);
				return ia - ib;
			}); // ~~~_(...)
	}

	const [loaded, setLoaded] = useState(false);
	const [display, setDisplay] = useState(false);

	const [types, setTypes] = useState<string[]>([]);
	const [page, setPage] = useState(0);

	const [selected, setSelected] = useState<number>(1);
	const [selectedRaw, setSelectedRaw] = useState("_1.png");

	useEffect(() => {
		Promise.all([
			Preloader.image("/BG/BG_CollectionIllust_Detail.png"),
			SpriteImage.load("Collection_Illust/sprite.png"),
		]).then(() => setLoaded(true));
	}, []);

	useLayoutEffect(() => {
		setTypes(filterChars());
	}, [props.char]);

	useEffect(() => {
		if (loaded)
			setDisplay(true);
	}, [loaded]);

	function isSeen (filename: string): boolean {
		const list = GlobalStorage.Instance.seen.char;
		return list.includes(path.basename(filename, path.extname(filename)));
	}

	const maxPage = Math.max(0, Math.ceil(types.length / 12) - 1);
	const displayUpCursor = page > 0;
	const displayDownCursor = page < maxPage;

	return <Window_Base
		class={ BuildClass(style.CollectionWindow, style.CollectionIllustDetail) }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

		display={ display }

		transitionTime={ 500 }
	>
		<img src="/BG/BG_CollectionIllust_Detail.png" />

		<div class={ style.TitleText }>
			<svg xmlns="http://www.w3.org/2000/svg" width="1258" height="91" viewBox="0 0 1258 91">
				<defs>
					<filter id="shadow">
						<feDropShadow dx={ 0 } dy={ 0 } stdDeviation={ 1 } />
						<feDropShadow dx={ 0 } dy={ 0 } stdDeviation={ 0.75 } />
						<feDropShadow dx={ 0 } dy={ 0 } stdDeviation={ 0.5 } />
					</filter>
				</defs>
				<text x="32" y="47.5" alignmentBaseline="middle" filter="url(#shadow)">
					{ CharTypeNames[props.char] }
				</text>
			</svg>
		</div>

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

		{ displayUpCursor && <SpriteButton
			class={ style.CursorUp }
			src="Collection_Illust/sprite.png"
			idle="illuplus_bu_1.png"
			active="illuplus_bu_2.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page - 1);
			} }
		/> }
		{ displayDownCursor && <SpriteButton
			class={ style.CursorDown }
			src="Collection_Illust/sprite.png"
			idle="illuplus_bd_1.png"
			active="illuplus_bd_1.png"

			onClick={ e => {
				e.preventDefault();
				static_PlayUISE("arrow");
				setPage(page + 1);
			} }
		/> }

		<div class={ style.Faces }>
			{ types.slice(page * 12, (page + 1) * 12).map(r => {
				const _id = parseFaceId(r);
				return <div
					class={ BuildClass(style.Item, !isSeen(props.char + r) && style.NotSeen) }
					onClick={ e => {
						e.preventDefault();

						if (!isSeen(props.char + r)) {
							static_PlayUISE("arrow_disabled");
							return;
						}

						static_PlayUISE("arrow");
						setSelected(parseFaceId(r));
						setSelectedRaw(r);
					} }
				>
					{ selected === _id && <SpriteImage
						class={ style.Selected }
						src="Collection_Illust/sprite.png"
						sprite="illuplus_bt_pi.png"
					/> }

					<SpriteImage
						class={ style.Button }
						src="Collection_Illust/sprite.png"
						sprite="illuplus_bt_1.png"
					/>
					<SpriteImage
						class={ BuildClass(style.Button, style.Active) }
						src="Collection_Illust/sprite.png"
						sprite="illuplus_bt_2.png"
					/>
					<div class={ style.FaceName }>
						{ FaceTypeNames[parseFaceId(r)] || parseFaceId(r) }
					</div>
				</div>;
			}) }
		</div>

		<div class={ style.SCGBox }>
			<img
				class={ style.SCG }
				src={ `/IMG/SCG/${props.char + selectedRaw}` }
			/>
		</div>
	</Window_Base>;
};
export default Window_CollectionIllust_Detail;
