function Transition()
    local _ = {}
    function _.Run(from, to, dur)
        local begin = Time.now()

        while true do
            local el = Time.now() - begin -- elapsed
            if el > dur then break end

            Input.Update()
            if #Mouse.Clicks > 0 then
                Mouse.Clicks = {}
                break
            end

            local p = el / dur

            if from ~= nil then
                from:Update()

                if to == nil then
                    from:Draw(1 - p)
                else
                    from:Draw()
                end
            end

            if to ~= nil then
                to:Update()
                to:Draw(p)
            end
            Game:Update()
        end
    end
    function _.One(scene, dur, cb)
        local before = scene:Clone()
        if type(cb) == "function" then cb(scene) end

        _.Run(before, scene, dur)
        before:Destroy()
    end

    Transition = _
end
Transition()
