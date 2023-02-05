import("core")

-- 게임 기본 정보
--  타이틀(제목), 크기, 위치
Game.Title("남십자성이 보이는 하늘 아래")
Game.Resize(1280, 720)
Game.Center()

import("scenes")
SceneManager:Run(Scene_Title)
