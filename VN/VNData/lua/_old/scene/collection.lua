local scene = Scene.Create()

-- local bgm = global.bgm
local bgm = Audio.Load("BGM/Daily.mp3", true)
Bridge.Debug(bgm)
bgm:Volume(0.5)
bgm:Play()

local bg = Image.Load("BG/BG_Collection")
bg.x = Game.width / 2
bg.y = Game.height / 2
bg.centerx = 0.5
bg.centery = 0.5

local buttons = {
    btn_music = Sprite.Load("IMG/collection", "btn_music"),
    btn_event = Sprite.Load("IMG/collection", "btn_event"),
    btn_illust = Sprite.Load("IMG/collection", "btn_illust")
}
Object.foreach(buttons, function(btn, k) btn.x = 50 end)
buttons.btn_music.y = 240
buttons.btn_event.y = 360
buttons.btn_illust.y = 480

local btn_back = Sprite.Load("IMG/collection", "btn_back")
btn_back.x = bg.x + (bg.width / 2) - 20
btn_back.y = bg.y - (bg.height / 2) + 10
btn_back.centerx = 1

Transition.One(scene, 2, function(scene)
    scene:Add(bg, "bg")
    scene:Add(bgm, "bgm")
    scene:Add(btn_back)
    scene:Adds(buttons)
end)

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

                if k == "btn_music" then
                    -- 뮤직 룸
                    import("scene/collection/music")
                elseif k == "btn_event" then
                    -- 이벤트 룸
                    import("scene/collection/event")
                elseif k == "btn_illust" then
                    -- 일러스트 룸
                    import("scene/collection/illust")
                end
            end
        else
            btn:Set(k)
        end
    end)

    -- 돌아가기 버튼 호버 테스트
    if Rect.contain(Mouse.X, Mouse.Y, btn_back) then
        if click ~= nil and Rect.contain(click.X, click.Y, btn_back) then
            -- 타이틀로 돌아가기
            self.alive = false
            bgm:FadeOut(1)
            global.bgm = true
        end
    end
end

global.eax = scene
