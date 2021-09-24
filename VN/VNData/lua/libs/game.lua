function Game()
    local _ = {
        title = "VN",
        width = 0,
        height = 0,
        debugFont = Font.Create("맑은 고딕", 14)
    }
    local lastTime, fps, fpsCounter = 0, 0, 0

    function _.Center() Bridge.Game_Center() end
    function _.Resize(width, height)
        Bridge.Game_Resize(width, height)
        _.width = width
        _.height = height
    end
    function _.Title(title, volatile)
        if volatile ~= true then _.title = title end
        Bridge.Game_Title(title, not volatile)
    end
    function _.Update()
        fpsCounter = fpsCounter + 1

        local now = Time.now()
        local diff = now - lastTime
        if diff >= 1 then
            fps = fpsCounter
            fpsCounter = 0
            lastTime = now
        end

        _.Title(_.title .. " - FPS : " .. fps, true)

        local text = Mouse.X .. " x " .. Mouse.Y .. " : " .. Mouse.State ..
                         ", Time : " .. Time.now()
        -- _.debugFont:Draw(text, 0, 0)
        Bridge.Game_Update()
    end

    Game = _
end
Game()
