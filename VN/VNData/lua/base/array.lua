function Array()
    local _ = {}
    function _.filter(t, predict)
        local j, n = 1, #t;

        for i = 1, n do
            if (predict(t, i, j)) then
                if (i ~= j) then
                    t[j] = t[i];
                    t[i] = nil;
                end
                j = j + 1;
            else
                t[i] = nil;
            end
        end

        return t;
    end
    function _.map(t, cb)
        local nt = {}
        for i, v in pairs(t) do nt[#nt + 1] = cb(v, i) end
        return nt
    end
    function _.foreach(t, cb) for i, v in pairs(t) do cb(v, i) end end

    function _.first(t, cb)
        if cb == nil then return t[1] end
        for i, v in pairs(t) do if cb(v, i) then return v end end
        return nil
    end
    function _.last(t, cb) -- Slow!
        if cb == nil then return t[#t] end
        local r = nil
        for i, v in pairs(t) do if cb(v, i) then r = v end end
        return r
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

    _.enqueue = _.push
    function _.dequeue(t)
        local n, r = #t, t[1]
        for i = 1, n - 1 do t[i] = t[i + 1] end
        t[n] = nil
        return r
    end

    Array = _
end
Array()
