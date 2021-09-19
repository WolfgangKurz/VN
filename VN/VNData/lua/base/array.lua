function Array()
    local _ = {}
    function _.isNative(t)
        return (t.length ~= nil or t.Length ~= nil or t.Count ~= nil)
    end
    function _.count(t)
        local ret = nil
        if pcall(function() ret = #t end) then return ret end
        if t.length ~= nil then return t.length end
        if t.Length ~= nil then return t.Length end
        if t.Count ~= nil then return t.Count end
        return 0
    end
    function _.filter(t, predict)
        local j, n = 1, _.count(t);

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
    function _.foreach(t, cb)
        if pcall(function() for i, v in pairs(t) do cb(v, i) end end) then
            return
        end

        local n = _.count(t)
        for i = 1, n do cb(t[i], i) end
    end
    function _.push(t, e)
        local n = _.count(t)
        t[n + 1] = e
        return t
    end
    function _.pushes(t, et)
        local n = _.count(et)
        if _.isNative(et) then
            for i = 0, n - 1 do _.push(t, et[i]) end
        else
            for i = 1, n do _.push(t, et[i]) end
        end
        return t
    end
    function _.pop(t)
        local n = _.count(t)
        local v = t[n]
        t[n] = nil
        return v
    end
    function _.normalize(t)
        if _.isNative(t) then return _.pushes({}, t) end
        return t
    end

    Array = _
end
Array()
