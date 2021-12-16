local scene = Scene.Create()
local nextscene = nil
childs = {}

local bgm = Audio.Load("BGM/title_first.mp3", true)
bgm:Volume(0.5)
bgm:Play()

local bg = Image.Load("BG/BG_Title")
bg.width = Game.width
bg.height = Game.height
Transition.One(scene, 2, function(scene)
    scene:Add(bg, "bg") --
end)

local logo = Image.Load("IMG/logo")
logo.x = 1200
logo.y = 40
logo.centerx = 1
Transition.One(scene, 1, function(scene)
    scene:Adds({logo = logo, bgm = bgm}) --
end)

local buttons = {
    btn_start = Sprite.Load("IMG/title", "btn_start"),
    btn_load = Sprite.Load("IMG/title", "btn_load"),
    btn_collection = Sprite.Load("IMG/title", "btn_collection"),
    btn_option = Sprite.Load("IMG/title", "btn_option")
}
Object.foreach(buttons, function(btn, k) btn.x = 50 end)
buttons.btn_start.y = 240
buttons.btn_load.y = 360
buttons.btn_collection.y = 480
buttons.btn_option.y = 600
Transition.One(scene, 2, function(scene) scene:Adds(buttons) end)

local oldUpdate = scene.Update
function scene:Update()
    oldUpdate(self)
    if self.alive == false then return end

    local click = nil
    if #Mouse.Clicks > 0 then click = Array.peekqueue(Mouse.Clicks) end

    -- 버튼 호버 테스트
    Object.foreach(buttons, function(btn, k)
        if Rect.contain(Mouse.X, Mouse.Y, btn) then
            if btn.key == k then
                btn:Anim({
                    {key = k .. "_hover1", duration = 0.6},
                    {key = k .. "_hover2", duration = 0.6},
                    {key = k .. "_hover3", duration = 0.6},
                    {key = k .. "_hover4", duration = 0.6}
                })
            end

            -- 버튼 클릭 테스트
            if click ~= nil and Rect.contain(click.X, click.Y, btn) then
                Mouse.Clicks = {} -- 버튼을 클릭, 이후 입력은 무시

                btn:Set(k)

                if k == "btn_start" then
                    -- 게임 시작
                    scene.alive = false
                    nextscene = "scene/game"
                elseif k == "btn_load" then
                    -- 불러오기
                    import("scene/load")
                elseif k == "btn_collection" then
                    -- 컬렉션 룸
                    bgm:FadeOut(1)
                    Transition.Run(scene, nil, 1)

                    import("scene/collection")

					local c = global.eax
                    local sid = "TitleChild" .. Time.now()
                    c.child_id = sid
                    Array.push(childs, c)
                    scene:Add(c, sid)
                elseif k == "btn_option" then
                    -- 옵션
                    import("scene/option")
                end
            end
        else
            btn:Set(k)
        end
    end)
end

while scene.alive do
    Input:Update()

    scene:Update()
    Array.foreach(childs, function(child)
        if not child.alive then
            Transition.Run(scene, nil, 1)

            Array.remove(childs, child)
            scene:Remove(child.child_id)

            if global.bgm == true then
                global.bgm = false
                bgm:FadeIn(1)
            end
            Transition.Run(nil, scene, 1)
        end
    end)

    scene:Draw()

    Game:Update()

    Array.dequeue(Mouse.Clicks)
end

bgm:FadeOut(1)
Transition.Run(scene, nil, 1)

scene:Destroy()

if nextscene ~= nil then import(nextscene) end
