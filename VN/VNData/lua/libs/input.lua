Mouse = {X = 0, Y = 0, State = 0, Clicks = {}}

function Input()
    local _ = {}
    function _.Update()
        local mouse = Array.normalize(Bridge:Input_Mouse())
        Mouse.X = mouse[1]
        Mouse.Y = mouse[2]
        Mouse.State = mouse[3]

        local clicks = Array.normalize(Bridge:Input_Clicks())
        Array.pushes(Mouse.Clicks, clicks)
    end

    Input = _
end
Input()
