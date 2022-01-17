function Array()
    local _ = {}
    function _.filter(t, predict)
        local nt, i = {}, 1
        Array.foreach(t, function(v, k)
            if predict(v, k) then
                nt[i] = v
                i = i + 1
            end
        end)
        return nt
    end
    function _.map(t, cb)
        local nt = {}
        for i, v in ipairs(t) do nt[i] = cb(v, i) end
        return nt
    end
    function _.foreach(t, cb) for i, v in ipairs(t) do cb(v, i) end end

    function _.contains(t, v)
        for b in ipairs(t) do if v == b then return true end end
        return false
    end

    function _.remove(t, v) -- Semi-slow
        local offset = 1
        for ai, av in ipairs(t) do
            t[offset] = t[ai]
            if av ~= v then offset = offset + 1 end
        end
        for i = offset, #t do t[i] = nil end
    end
    function _.removeAt(t, k) -- Semi-slow
        local offset = 1
        for ai, av in ipairs(t) do
            t[offset] = t[ai]
            if ai ~= k then offset = offset + 1 end
        end
        for i = offset, #t do t[i] = nil end
    end

    function _.first(t, cb)
        if cb == nil then return t[1] end
        for i, v in ipairs(t) do if cb(v, i) then return v end end
        return nil
    end
    function _.last(t, cb) -- Slow!
        if cb == nil then return t[#t] end
        local r = nil
        for i, v in ipairs(t) do if cb(v, i) then r = v end end
        return r
    end

    function _.clone(t)
        local nt = {}
        Array.foreach(t, function(c, k) nt[k] = c end)
        return nt
    end

    function _.push(t, e)
        t[#t + 1] = e
        return t
    end
    function _.pushes(t, et)
        local n, m = #t, #et
        for i = 1, m do
            t[n + 1] = et[i]
            n = n + 1
        end
        return t
    end
    function _.pop(t)
        local v = t[#t]
        t[#t] = nil
        return v
    end
    function _.peek(t) return t[#t] end

    _.enqueue = _.push
    function _.dequeue(t)
        local n, r = #t, t[1]
        for i = 1, n - 1 do t[i] = t[i + 1] end
        t[n] = nil
        return r
    end
    function _.peekqueue(t) return t[1] end

    Array = _
end
Array()
