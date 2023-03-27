import { useEffect, useState } from "preact/hooks";

import config from "@/config";

import { BuildClass } from "@/libs/ClassName";
import Wait from "@/libs/Wait";

import Scene_Base from "../Scene_Base";

import style from "./style.module.scss";

const Scene_Logo: FunctionalComponent = () => {
	const animTimes = [0.5, 1, 2, 1];

	const [step, setStep] = useState(0);

	useEffect(() => {
		switch (step) {
			case 0:
			case 1:
			case 2:
			case 3:
				Wait(animTimes[step] * 1000, () => {
					setStep(step + 1);
				});
				break;
			case 4:
				Wait(1000, () => (config.volatile_Scene.value = "Scene_Title"));
				break;
		}
	}, [step]);

	return <Scene_Base class={ BuildClass(style.Scene_Logo, style[`step-${step}`]) }>
		<svg viewBox="0 0 1280 720">
			<symbol id="content">
				<text x="50%" y="50%">팀 뽈따구</text>
				<text x="50%" y="58%" fontSize="40">presents</text>
			</symbol>

			<g>
				{ new Array(5).fill(
					<use class={ BuildClass(style.layer, style[`layer-a-${step}`]) } xlinkHref="#content" />
				) }
			</g>
		</svg>
	</Scene_Base>;
};
export default Scene_Logo;
