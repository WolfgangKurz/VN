Game = {title = "VN", width = 0, height = 0, frameCount = 0}

local alive, tickHandler, stage = false, nil, nil
local lastTime, fps, fpsCounter = 0, 0, 0

local debugFont = Font.Create("맑은 고딕", 11)
debugFont.color = 0xffff0000

local function Update()
    local now = Time.now()
    local diff = now - lastTime
    if diff >= 1 then
        fps = Game.frameCount - fpsCounter
        fps = math.floor(fps / diff)
        fpsCounter = Game.frameCount
        lastTime = now
    end

    Game.Title(Game.title .. " - FPS : " .. fps, true)

    local text = Mouse.X .. " x " .. Mouse.Y .. " : " .. Mouse.State
    text = text .. ", Frame : " .. Game.frameCount
    text = text .. ", Time : " .. Time.now()
    debugFont:Draw(text, 0, 0)
    Bridge.Game_Update()
end

function Game.Title(title, volatile)
    if volatile ~= true then Game.title = title end
    Bridge.Game_Title(title, not volatile)
end
function Game.Resize(width, height)
    Bridge.Game_Resize(width, height)
    Game.width = width
    Game.height = height
end
function Game.Center() Bridge.Game_Center() end

function Game.StartGameLoop()
    local prev = Time.now()
    alive = true
    while alive do
        local now = Time.now()
        local delta = (now - prev) * 60
        prev = now

        if tickHandler ~= nil and type(tickHandler) == "function" then
            tickHandler(delta)
        end

        if stage ~= nil and type(stage.Draw) == "function" then
            stage:Draw()
        end

        Update()
    end
end
function Game.StopGameLoop() alive = false end

function Game.SetTickHandler(handler) tickHandler = handler end
function Game.SetStage(target) stage = target end

function Game.Fill(color) Bridge.Graphics_Fill(color) end

function Game.Push() Bridge.Graphics_EnterSurface() end
function Game.Pop() return Bridge.Graphics_FlushSurface() end
function Game.Snap() return Image.LoadRaw(Bridge.Graphics_Snap()) end
