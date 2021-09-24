local scene = Scene.Create()
local inst = {
    bgm = nil,
    bg = nil,
    teller = nil,
    text = nil,
    block = false,
    queue = {}
}

local function Block()
    inst.block = true

    while inst.block do
        Input:Update()

        scene:Update()
        scene:Draw()

        Game:Update()
    end
end

BGM = {}
function BGM.r(name)
    if inst.bgm ~= nil then
        inst.bgm:Stop()
        inst.bgm:Unload()
        scene:Remove(inst.bgm)
        inst.bgm = nil
    end

    if name ~= nil then
        inst.bgm = Audio.Load("BGM/" .. name .. ".mp3", true)
        inst.bgm:Volume(0.25)
        inst.bgm:Play()
        scene:Add(inst.bgm)
    end
end
function BGM.fadeOut(dur)
    if inst.bgm == nil then return end

    if dur == nil then
        inst.bgm:FadeOut(1)
    else
        inst.bgm:FadeOut(dur)
    end
end

function BG(name)
    if inst.bg ~= nil then
        inst.bg:Unload()
        scene:Remove(inst.bg)
        inst.bg = nil
    end

    if name ~= nil then
        inst.bg = Image.Load("BG/" .. name)
        inst.bg.width = Game.width
        inst.bg.height = Game.height
        scene:Add(inst.bg)
    end
end

function t(text)
    inst.teller = nil
    inst.text = text

    if text ~= nil then Block() end
end

function s(teller, text)
    inst.teller = teller
    inst.text = text
    Block()
end

function wait(dur, skippable)
    local start = Time.now()
    while Time.now() < start + dur do
        if skippable == true then
            Input:Update()
            if #Mouse.Clicks > 0 then
                Mouse.Clicks = {}
                break
            end
        end

        scene:Update()
        Game.Update()
    end
end

function tl(cb, dur)
    if dur == nil then
        Transition.One(scene, 1, cb)
    else
        Transition.One(scene, dur, cb)
    end
end

function next(script) Array.enqueue(inst.queue, script) end

local oldUpdate = scene.Update
function scene:Update()
    oldUpdate(self)

    if inst.block and #Mouse.Clicks > 0 then
        Mouse.Clicks = {}
        inst.block = false
    end

    -- TODO : text 순차 표시
end

local font = Font.Create("맑은 고딕", 14)
-- font.color = 0x80FFDDBB
scene:Add(font)

local oldDraw = scene.Draw
function scene:Draw()
    oldDraw(self)

    -- TODO : text 그리기
    if inst.text ~= nil then
        if inst.teller ~= nil then font:Draw(inst.teller, 1000, 360 + 90) end

        local x, y, stroke = 10, 200, 2
        local i, j = 0, 0

        -- 테두리
        font.color = 0xFF000000
        for i = -stroke, stroke do
            for j = -stroke, stroke do
                font:Draw(inst.text, x + i, y + j)
            end
        end

        -- 본 글자
        font.color = 0xFFFFFFFF
        font:Draw(inst.text, x, y)
    end
end

Array.enqueue(inst.queue, "0")
while #inst.queue > 0 do
    local script = Array.dequeue(inst.queue)
    import("script/" .. script)
end

scene:Destroy()

import("scene/title")
