import NodeFS from "node:fs";
import NodePATH from "node:path";

import { useEffect, useState } from "preact/hooks";
import { batch } from "@preact/signals-core";
import html2canvas from "html2canvas";

import config from "@/config";

import { __dirname } from "@/libs/Const";
import Wait from "@/libs/Wait";
import { BuildClass } from "@/libs/ClassName";
import SaveData from "@/libs/SaveData";

import SpriteImage from "@/components/SpriteImage";
import SpriteButton from "@/components/SpriteButton";

import Window_Base, { WindowBaseProps } from "../Window_Base";

import style from "./style.module.scss";

interface WindowSaveLoadProps extends WindowBaseProps {
	canSave: boolean;
	isSave: boolean;

	scriptCursor?: number;

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

	const [saveUpdator, setSaveUpdator] = useState(false);
	const [saves, setSaves] = useState<Array<SaveData | undefined>>([]);
	const [page, setPage] = useState(0);

	useEffect(() => {
		const list: SaveData[] = [];

		const fs: typeof NodeFS = window.nw.require("fs");
		const path: typeof NodePATH = window.nw.require("path");

		const reg = /^VNSave([0-9]{2})\.vnsave$/;

		const dir = path.join(__dirname, "saves");
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // 폴더 없는 경우
		fs.readdirSync(dir, "utf-8")
			.forEach(f => {
				if (!reg.test(f)) return;

				const m = reg.exec(f);
				const idx = parseInt(m![1], 10);

				const data = fs.readFileSync(path.join(dir, f));
				const saveData = new SaveData();
				if (!saveData.read(data)) return;

				list[idx] = saveData;
			});

		setSaves(r => {
			r.forEach(s => {
				if (s) s.dispose();
			});

			return list;
		});
	}, [props.isSave, saveUpdator]);

	const updateSaves = () => setSaveUpdator(!saveUpdator);

	async function doSave (idx: number) {
		const fs: typeof NodeFS = window.nw.require("fs");
		const path: typeof NodePATH = window.nw.require("path");

		const now = new Date();

		const dir = path.join(__dirname, "saves");
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // 폴더 없는 경우
		const target = path.join(dir, `VNSave${idx.toString().padStart(2, "0")}.vnsave`);

		const saveData = new SaveData();
		saveData.chapter = config.volatile_Chapter.peek();
		saveData.title = config.volatile_Title.peek();
		saveData.date = now;

		saveData.session = config.session_Data.peek().serialize();
		saveData.script = config.volatile_Script.peek();
		saveData.cursor = props.scriptCursor ?? 0;

		const screen = document.querySelector<HTMLDivElement>(".Scene_Game .Screen");
		if (screen) {
			const captured = await html2canvas(screen);
			await saveData.setImage(captured);
		}

		const buffer = await saveData.save();
		if (!buffer) return false;

		fs.writeFileSync(target, buffer);
	}

	return <Window_Base
		class={ BuildClass(props.isSave && style.SaveWindow, !props.isSave && style.LoadWindow) }

		left={ 0 }
		top={ 0 }
		width={ 1280 }
		height={ 720 }

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
			class={ BuildClass(style.ModeButton, style.Save, (!props.canSave || props.isSave) && style.Disabled) }
			src="SaveLoad/sprite.png"
			idle={ props.isSave ? "btn_save_down.png" : "btn_save.png" }
			disabled={ !props.canSave || props.isSave }

			onClick={ e => {
				e.preventDefault();

				if (!props.canSave || props.isSave) return;
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
			{ new Array(6).fill(0).map((_, i) => {
				const save = saves[i + page * 6];
				return <div
					class={ BuildClass(style.Slot, !save && style.Empty) }
					onClick={ e => {
						e.preventDefault();
						e.stopPropagation();

						if (props.isSave) {
							doSave(i + page * 6)
								.then(() => updateSaves());
						} else {
							if (!save) return;
	
							batch(() => {
								config.volatile_Scene.value = "Scene_GameReady";
								config.volatile_Script.value = save.script;
								config.volatile_ScriptCursor.value = save.cursor;

								config.session_Data.peek().deserialize(save.session);
								config.volatile_Chapter.value = save.chapter;
								config.volatile_Title.value = save.title;
							});
						}
					} }
				>
					{
						save ? <>
							<SpriteImage
								src="SaveLoad/sprite.png"
								sprite="data_box.png"
							/>

							<div class={ style.Chapter }>{ save.chapter }</div>
							<div class={ style.Title }>{ save.title }</div>
							<div class={ style.Date }>{ save.formattedDate }</div>

							{ save.imageUrl
								? <img class={ style.Thumbnail } src={ save.imageUrl } />
								: <></>
							}

							<SpriteImage
								class={ style.Down }
								src="SaveLoad/sprite.png"
								sprite="data_box_b.png"
							/>
						</>
							: <SpriteImage
								src="SaveLoad/sprite.png"
								sprite="data_empty.png"
							/>
					}
				</div>;
			}) }
		</div>
	</Window_Base>;
};
export default Window_SaveLoad;
