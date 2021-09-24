Mouse = {X = 0, Y = 0, State = 0, Clicks = {}}

function Input()
    local _ = {}
    function _.Update()
        -- 현재 마우스의 좌표, 버튼 상태
        local x, y, state = Bridge.Input_Mouse()
        Mouse.X = x
        Mouse.Y = y
        Mouse.State = state

        -- 클릭 기록 가져오기
        local clicks = Bridge.Input_Clicks()
        Array.foreach(clicks, function(c)
            Array.enqueue(Mouse.Clicks, {X = c[1], Y = c[2]})
        end)
    end

    Input = _
end
Input()
