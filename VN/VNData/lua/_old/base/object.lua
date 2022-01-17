function Object()
    local _ = {}

    function _.filter(t, predict)
        local nt = {}
        Object.foreach(t, function(v, k)
            if predict(v, k) then nt[k] = v end
        end)
        return nt
    end
    function _.map(t, cb)
        local nt = {}
        for k, v in pairs(t) do nt[k] = cb(v, k) end
        return nt
    end
    function _.foreach(t, cb) for k, v in pairs(t) do cb(v, k) end end

    function _.clone(t)
        local nt = {}
        Object.foreach(t, function(c, k) nt[k] = c end)
        return setmetatable(nt, getmetatable(t))
    end

    Object = _
end
Object();
