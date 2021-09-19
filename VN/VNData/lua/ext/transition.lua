function Transition()
    local _ = {}
    function _.Run(from, to, dur)
        local begin = Time.now()

        while true do
            local el = Time.now() - begin -- elapsed
            if el >= dur then break end

            Input.Update()
            if #Mouse.Clicks > 0 then
                Mouse.Clicks = {}
                break
            end

            from:Update()
            to:Update()

            from:Draw()
            to:Draw(el / dur)
            Game:Update()
        end

        to:Draw()
        Game:Update()
    end
    function _.Progress(scene, dur, cb)
        local before = scene:Clone()
        cb(scene)

        _.Run(before, scene, dur)
        before:Destroy()
    end

    Transition = _
end
Transition()
