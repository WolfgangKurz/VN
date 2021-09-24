local scene = Scene.Create()

local bgm = Audio.Load("BGM/title_first.mp3", true)
bgm:Volume(0.5)
bgm:Play()

local bg = Image.Load("BG/BG_Title")
bg.width = Game.width
bg.height = Game.height
Transition.One(scene, 2, function(scene) scene:Add(bg) end)

local logo = Image.Load("IMG/logo")
logo.x = 1200
logo.y = 40
logo.centerx = 1
Transition.One(scene, 1, function(scene) scene:Adds({logo, bgm}) end)

local buttons = {
    btn_start = Sprite.Load("IMG/title"),
    btn_load = Sprite.Load("IMG/title"),
    btn_collection = Sprite.Load("IMG/title"),
    btn_option = Sprite.Load("IMG/title")
}
Array.foreach(buttons, function(btn, k)
    btn.x = 50
    btn:Set(k)
end)
buttons.btn_start.y = 240
buttons.btn_load.y = 360
buttons.btn_collection.y = 480
buttons.btn_option.y = 600
Transition.One(scene, 2, function(scene)
    scene:Add(buttons.btn_start)
    scene:Add(buttons.btn_load)
    scene:Add(buttons.btn_collection)
    scene:Add(buttons.btn_option)
end)

local nextscene = nil

local oldUpdate = scene.Update
function scene:Update()
    oldUpdate(self)

    -- 버튼 호버 테스트
    Array.foreach(buttons, function(btn, k)
        if Rect.contain(Mouse.X, Mouse.Y, btn) then
            if btn.key == k then
                btn:Anim({
                    {key = k .. "_hover1", duration = 0.6},
                    {key = k .. "_hover2", duration = 0.6},
                    {key = k .. "_hover3", duration = 0.6},
                    {key = k .. "_hover4", duration = 0.6}
                })
            end
        else
            btn:Set(k)
        end
    end)

    -- 버튼 클릭 테스트
    while #Mouse.Clicks > 0 do
        local click = Array.dequeue(Mouse.Clicks)
        Array.foreach(buttons, function(btn, k)
            if Rect.contain(click.X, click.Y, btn) then
                Mouse.Clicks = {} -- 버튼을 클릭, 이후 입력은 무시

                btn:Set(k)
                scene.Update = oldUpdate

                if k == "btn_start" then
                    -- 게임 시작
                    scene.alive = false
                    nextscene = "scene/game"
                elseif k == "btn_load" then
                    -- 불러오기
                    import("scene/load")
                elseif k == "btn_collection" then
                    -- 컬렉션 룸
                    import("scene/collection")
                elseif k == "btn_option" then
                    -- 옵션
                    import("scene/option")
                end
            end
        end)
    end
end

while scene.alive do
    Input:Update()

    scene:Update()
    scene:Draw()

    Game:Update()
end

bgm:FadeOut(1)
Transition.Run(scene, nil, 1)

scene:Destroy()

if nextscene ~= nil then import(nextscene) end
