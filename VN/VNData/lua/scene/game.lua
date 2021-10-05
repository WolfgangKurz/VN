local CHAR_DISP_TIME = 0.05 -- 한 글자당 표시되는데 소요되는 시간 (초)
local AUTO_NEXT_TIME = 1 -- 대사가 끝난 후 다음 문장으로 넘어가기 전 대기할 시간 (초)

local inst = {
    teller = nil,
    text = nil,
    textLen = 0,
    textTime = 0, -- 텍스트가 표시되기 시작한 시간
    textTimeTo = 0, -- 텍스트가 전부 표기되기 위한 전체 시간
    block = false,
    hidden = false, -- UI 감춤 여부

    auto = false, -- 자동 진행 여부
    autoTime = 0,

    nextFrame = 0, -- 다음 대화로 표시자 프레임 시작 시간

    scriptName = "", -- 진행중인 스크립트 파일
    scriptIndex = 0, -- 스크립트 진행 위치
    queue = {}
}

local scene = Scene.Create()
scene.scg = {} -- SCG 목록

-- 초기화
local function init()
    local textbox = Sprite.Load("IMG/UI")
    textbox:Set("in_text_1_0")
    textbox.x, textbox.y, textbox.visible = 120, 458, false
    scene:Add(textbox, "textbox")

    local tellerbox = Sprite.Load("IMG/UI")
    tellerbox:Set("in_text_1_1")
    tellerbox.x, tellerbox.y = textbox.x + 947 - 151 - 2, textbox.y + 2
    scene:Add(tellerbox, "tellerbox")

    local text_end = Sprite.Load("IMG/UI")
    text_end:Set("in_text_1_2")
    text_end.x, text_end.y = textbox.x + 947 - 76 - 2, textbox.y + 242 - 38 - 2
    scene:Add(text_end, "text_end")

    local btn = Sprite.Load("IMG/UI")
    btn.key_normal = "in_icon_1_1"
    btn.key_hover = "in_icon_2_1"
    btn:Set(btn.key_normal)
    btn.x, btn.y = 1067 + 2, 458 + (43 + 2) * 0 -- 1067 = textbox.x + textbox.width
    scene:Add(btn, "btn_history")

    btn = Sprite.Load("IMG/UI")
    btn.key_normal = "in_icon_1_2"
    btn.key_hover = "in_icon_2_2"
    btn:Set(btn.key_normal)
    btn.x, btn.y = 1067 + 2, 458 + (43 + 2) * 1
    scene:Add(btn, "btn_auto")

    btn = Sprite.Load("IMG/UI")
    btn.key_normal = "in_icon_1_3"
    btn.key_hover = "in_icon_2_3"
    btn:Set(btn.key_normal)
    btn.x, btn.y = 1067 + 2, 458 + (43 + 2) * 2
    scene:Add(btn, "btn_save")

    btn = Sprite.Load("IMG/UI")
    btn.key_normal = "in_icon_1_4"
    btn.key_hover = "in_icon_2_4"
    btn:Set(btn.key_normal)
    btn.x, btn.y = 1067 + 2, 458 + (43 + 2) * 3
    scene:Add(btn, "btn_load")

    btn = Sprite.Load("IMG/UI")
    btn.key_normal = "in_icon_1_5"
    btn.key_hover = "in_icon_2_5"
    btn:Set(btn.key_normal)
    btn.x, btn.y = 1067 + 2, 458 + (43 + 2) * 4
    scene:Add(btn, "btn_ui")
end
init()
init = nil

-- 스크립트 진행 위치를 1 증가
local function step() inst.scriptIndex = inst.scriptIndex + 1 end

-- 입력 대기 함수
local function Block()
    inst.block = true

    while inst.block do
        Input:Update()

        scene:Update()
        scene:Draw()

        Game:Update()
    end
end

-- 여기서부터 스크립트에서 사용하는 함수
BGM = {}
function BGM.r(name)
    local bgm = scene:Find("BGM")
    if bgm ~= nil then
        bgm:Stop()
        bgm:Unload()
        scene:Remove("BGM")
    end

    if name ~= nil then
        bgm = Audio.Load("BGM/" .. name .. ".mp3", true)
        bgm:Volume(0.25)
        bgm:Play()
        scene:Add(bgm, "BGM")
    end

    step()
end
function BGM.fadeIn(dur)
    local bgm = scene:Find("BGM")
    if bgm == nil then return end

    bgm:FadeIn(fallback(dur, 1))
    step()
end
function BGM.fadeOut(dur)
    local bgm = scene:Find("BGM")
    if bgm == nil then return end

    bgm:FadeOut(fallback(dur, 1))
    step()
end

function BG(name)
    local bg = scene:Find("BG")
    if bg ~= nil then scene:Remove("BG") end

    if name ~= nil then
        bg = Image.Load("BG/" .. name)
        bg.width = Game.width
        bg.height = Game.height
        scene:Add(bg, "BG")
    end

    step()
end

SCG = {}
function SCG.r(id, name, x, y, cx, cy)
    local cgid = "SCG:" .. id
    local scg = scene:Find(cgid)

    if scg ~= nil then
        scene:Remove(cgid)
        scene.scg = Array.filter(scene.scg, function(v) return v ~= cgid end)
    end

    if name ~= nil then
        scg = Image.Load("IMG/" .. name)

        scg.x = fallback(x, Game.width * 0.5)
        scg.y = fallback(y, Game.height)
        scg.centerx = fallback(cx, 0.5)
        scg.centery = fallback(cy, 1)

        scene:Add(scg, cgid)
        Array.push(scene.scg, cgid)
    end

    step()
end
function SCG.on(id)
    local cgid = "SCG:" .. id
    local scg = scene:Find(cgid)

    if scg ~= nil then scg.color = 0xffffffff end
end
function SCG.off(id)
    local cgid = "SCG:" .. id
    local scg = scene:Find(cgid)

    if scg ~= nil then scg.color = 0xff404040 end
end
IMG = SCG

local function tBase(teller, text)
    local textbox = scene:Find("textbox")

    if inst.text == nil then
        tl(function() -- 텍스트 박스 표시
            textbox.visible = true
        end, 0.5)
    end

    inst.teller = teller
    inst.text = text

    if inst.text ~= nil then
        inst.textTime = Time.now()
        inst.textLen = UTF8.len(inst.text)
        inst.textTimeTo = inst.textLen * CHAR_DISP_TIME
    end

    if text == nil then
        tl(function() -- 텍스트 박스 숨김
            textbox.visible = false
        end, 0.5)
    end

    if text ~= nil then Block() end
end
function t(text)
    tBase(nil, text)
    step()
end
function s(teller, text)
    tBase(teller, text)
    step()
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
        scene:Draw()
        Game.Update()
    end

    Mouse.Clicks = {} -- 기록된 입력 전부 무시
    step()
end

function tl(cb, dur)
    local before = scene:Clone(function(s)
        s.Update = scene.Update
        s.Draw = scene.Draw
        s.scg = Array.map(scene.scg, function(v) return v end)
    end)
    if type(cb) == "function" then cb(scene) end

    Transition.Run(before, scene, fallback(dur, 1))
    before:Destroy()
    step()
end

function next(script) Array.enqueue(inst.queue, script) end

local oldUpdate = scene.Update
function scene:Update()
    oldUpdate(self)

    if inst.block == true and inst.auto == true then
        if inst.autoTime > 0 then -- 자동 진행 시간이 진행중이라면
            local diff = Time.now() - inst.autoTime
            if diff > AUTO_NEXT_TIME then
                inst.block = false
                inst.autoTime = 0
            end -- 시간이 지났다면 block 해제
        elseif inst.textTime == 0 or Time.now() - inst.textTime >=
            inst.textTimeTo then -- 대사가 전부 출력되었다면

            inst.autoTime = Time.now() -- 자동 진행 시간을 세팅
        end
    end

    local inBtn = false
    if inst.hidden == true then
        if #Mouse.Clicks > 0 then
            inst.hidden = false
            Mouse.Clicks = {}
            return
        end
    elseif inst.hidden == false and self:Find("textbox").visible then
        local buttons = {
            "btn_history", "btn_auto", "btn_save", "btn_load", "btn_ui"
        }

        -- 버튼 호버 테스트
        Array.foreach(buttons, function(k)
            local btn = self:Find(k)

            if Rect.contain(Mouse.X, Mouse.Y, btn) then
                inBtn = true

                btn:Set(btn.key_hover)

                -- 버튼 클릭 테스트
                if #Mouse.Clicks > 0 then
                    Mouse.Clicks = {} -- 버튼을 클릭, 이후 입력은 무시

                    btn:Set(k)

                    if k == "btn_history" then
                        -- 대화 기록
                    elseif k == "btn_auto" then
                        -- 자동 진행
                        inst.auto = not inst.auto
                        if inst.auto then
                            btn:Set(btn.key_hover)
                            inst.autoTime = 0
                        else
                            btn:Set(btn.key_normal)
                        end
                    elseif k == "btn_save" then
                        -- 저장
                        import("scene/save")
                    elseif k == "btn_load" then
                        -- 불러오기
                        import("scene/load")
                    elseif k == "btn_ui" then
                        -- UI 감추기
                        inst.hidden = true
                    end
                end
            elseif k ~= "btn_auto" or inst.auto == false then
                btn:Set(btn.key_normal)
            end
        end)
    end

    if inBtn == true then return end
    if inst.block == true and #Mouse.Clicks > 0 then
        Mouse.Clicks = {}

        if inst.textTime > 0 and Time.now() - inst.textTime < inst.textTimeTo then
            inst.textTime = 0
            inst.nextFrame = Time.now()
        else
            inst.block = false
        end
    end
end

local textFont = Font.Create("맑은 고딕", 16)
scene:Add(textFont, "textFont")

local nameFont = Font.Create("맑은 고딕", 14)
scene:Add(nameFont, "nameFont")

local oldDraw = scene.Draw
function scene:Draw(opacity)
    -- oldDraw(self, opacity)
    if opacity ~= nil then Game.Push() end

    Game.Fill(0xff000000) -- 기본 검은색 배경

    local BG = self:Find("BG")
    if BG ~= nil then BG:Draw() end

    Array.foreach(self.scg, function(cgid)
        local SCG = self:Find(cgid)
        SCG:Draw()
    end)

    local textbox = self:Find("textbox")
    if inst.hidden == false and textbox.visible == true then
        textbox:Draw()

        local buttons = {
            btn_history = self:Find("btn_history"),
            btn_auto = self:Find("btn_auto"),
            btn_save = self:Find("btn_save"),
            btn_load = self:Find("btn_load"),
            btn_ui = self:Find("btn_ui")
        }
        Object.foreach(buttons, function(btn) btn:Draw() end)

        if inst.text ~= nil then
            if inst.teller ~= nil then
                local tellerBox = self:Find("tellerbox")
                tellerBox:Draw()
                nameFont.align = 2 -- 오른쪽 정렬
                nameFont.color = 0xFFFFFFFF
                nameFont:Draw(inst.teller, tellerBox.x + 151 - 4,
                              tellerBox.y + 25 - 8)
                -- 51 = tellerBox.height, 16 = fontSize
            end

            local x, y, stroke = textbox.x + 50, textbox.y + 50, 2
            local i, j = 0, 0

            local txt = ""
            if inst.textTime == 0 then
                txt = inst.text

                -- 텍스트 끝 지시자 표시
                local tend = self:Find("text_end")
                local elapsed = Time.now() - inst.nextFrame
                local angle = math.cos(elapsed * 5) / 2 + 0.5
                tend.color = (math.floor(0xff * angle) * 0x1000000) + 0xffffff
                tend:Draw()
            else
                local len = math.min(math.floor(
                                         (Time.now() - inst.textTime) /
                                             CHAR_DISP_TIME), inst.textLen)
                if len > 0 then txt = UTF8.sub(inst.text, 1, len) end -- 자르기

                if len == inst.textLen then
                    inst.textTime = 0
                    inst.nextFrame = Time.now()
                end -- 최적화 및 다음 대화 지시자 시간 설정
            end

            -- 테두리
            if stroke > 0 then
                textFont.color = 0xFF000000
                for i = -stroke, stroke do
                    for j = -stroke, stroke do
                        textFont:Draw(txt, x + i, y + j, 947 - 100) -- 947 = 대화창 가로
                    end
                end
            end

            -- 내용
            textFont.color = 0xFFFFFFFF
            textFont:Draw(txt, x, y, 947 - 100) -- 947 = 대화창 가로
        end
    end

    -- self:Debug()

    if opacity ~= nil then Game.Pop(opacity) end
end

Array.enqueue(inst.queue, "0")
while #inst.queue > 0 do
    local script = Array.dequeue(inst.queue)
    inst.scriptName = script
    inst.scriptIndex = 0
    import("script/" .. script)
end

scene:Destroy()

import("scene/title")
