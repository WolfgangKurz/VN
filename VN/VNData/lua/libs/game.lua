function Game()
    local _ = {width = 0, height = 0}
    local lastTime, fps, fpsCounter = 0, 0, 0

    function _.Center() Bridge:Game_Center() end
    function _.Resize(width, height)
        Bridge:Game_Resize(width, height)
        _.width = width
        _.height = height
    end
    function _.Title(title) Bridge:Game_Title(title) end
    function _.Update()
        fpsCounter = fpsCounter + 1

        local now = Time.now()
        local diff = now - lastTime
        if diff >= 1 then
            fps = fpsCounter
            fpsCounter = 0
            lastTime = now
        end

        _.Title("남십자성이 보이는 하늘 아래 - FPS : " .. fps)

        -- local text = Mouse.X .. " x " .. Mouse.Y .. " : " .. Mouse.State
        -- Bridge:Graphics_Text(text, 0, 0)
        Bridge:Game_Update()
    end

    Game = _
end
Game()
