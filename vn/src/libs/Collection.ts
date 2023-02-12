interface CollectionLists {
	events: string[];
	chars: string[];
	bgm: string[];
}

const lists: CollectionLists = {
	events: [],
	chars: [],
	bgm: [
		"Aurora",
		"Cave",
		"Daily",
		"Drinking",
		"Ending",
		"HeartbeatOME",
		"HeartbeatShort",
		"LoverLover",
		"Moment",
		"Mystic",
		"Nervous1",
		"Nervous2",
		"Starlight",
		"Title1",
		"Title2",
		"WithYou",
		"Battle_03",
		"Battle_04",
		"Battle_05",
		"Christmas_02",
		"Forest_of_Elves",
		"Marriage_01",
		"Marriage_02",
		"Summer_01",
		"Summer_02",
		"Talk_05",
		"Talk_06",
		"Talk_07",
	],
};

export function PrepareCollections (): Promise<void> {
	return new Promise<void>((resolve) => {
		Promise.all([
			fetch("/IMG/CUT/list.json")
				.then(r => r.json())
				.then(r => (lists.events = r)),
			fetch("/IMG/SCG/list.json")
				.then(r => r.json())
				.then(r => (lists.chars = r)),
		]).then(() => resolve());
	});
}
export const Lists = lists;

export const CharTypeNames = {
	STD_01: "일상복",
	STD_02V1: "동복(모자)",
	"STD_02V1-2": "동복(모자+짐)",
	"STD_02V1-3": "동복(모자+짐+음식)",
	STD_02V2: "동복",
	"STD_02V2-2": "동복(짐)",
	"STD_02V2-3": "동복(짐+음식)",
	"STD_03@": "샤워",
	STD_03: "내복",
	STD_04: "작업복",
	STD_04V2: "작업복(가방)",
};
Object.freeze(CharTypeNames);

export const FaceTypeNames: Record<number, string> = {
	1: "기본",
	2: "웃음",
	3: "쓴웃음",
	4: "웃음+눈물",
	5: "울음",
	6: "울먹울먹",
	7: "버럭",
	8: "놀람",
	9: "폭소",
	10: "측은",
	11: "의문",
	12: "연한 미소",
	13: "멍한 표정",
	14: "흥",
	15: "한숨",
	16: "멍한 표정 2",
	17: "당황",
	18: "짖궂은 웃음",
	19: "기진맥진",
	20: "빙글빙글",
	21: "홍조",
	22: "공포",
	23: "고통",
	24: "아랫입술",
	25: "눈 감음",
	26: "정색",
	27: "분노",
	28: "웃음+홍조",
	29: "웃음+땀",
};
Object.freeze(FaceTypeNames);

export const BGMNames: Record<string, string> = {
	HeartbeatOME: "두근☆두근 반짝★반짝 inst. ver",
	Moment: "잠시 inst. ver",
	Statlight: "외로운 별의 노래 inst. ver",
	Daily: "숲속에서의 일상",
	Drinking: "술잔에 마음을 담아",
	Aurora: "가버려, 가지마",
	Nervous1: "너를 찾아서",
	Nervous2: "추격",
	Cave: "마지막 약속",
	Ending: "기시감",
	Title1: "남십자성이 보이는 하늘 아래, 혼자",
	Title2: "남십자성이 보이는 하늘 아래, 함께",

	Battle_03: "Battle 03",
	Battle_04: "Battle 04",
	Battle_05: "Battle 05",
	Christmas_02: "Christmast 02",
	Forest_of_Elves: "Forest of Elves",
	Marriage_01: "Marriage 01",
	Marriage_02: "Marriage 02",
	Summer_01: "Summer 01",
	Summer_02: "Summer 02",
	Talk_05: "Talk 05",
	Talk_06: "Talk 06",
	Talk_07: "Talk 07",
};
Object.freeze(BGMNames);
