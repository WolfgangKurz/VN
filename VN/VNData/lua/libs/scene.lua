function Scene()
    local Meta = {}
    function Meta:Add(entity, name)
        if entity == nil then
            Bridge.Debug(name)
            return
        end
        Array.push(self.entities, {name, entity}) -- Key-Value
    end
    function Meta:Adds(entities)
        for k, v in pairs(entities) do self:Add(v, k) end
    end
    function Meta:Remove(name)
        self.entities = Array.filter(self.entities, function(set)
            -- local entity = set[2]
            -- test = e.type == entity.type and e.id == entity.id
            test = set[1] == name
            if (test) then pcall(function() e:Unload() end) end
            return not test
        end)
    end
    function Meta:Find(name)
        if self.entities == nil then return nil end
        for k, v in pairs(self.entities) do
            if v[1] == name then return v[2] end
        end
        return nil
    end
    function Meta:Draw(alpha)
        if alpha ~= nil then
            Game.Push()
            Array.foreach(self.entities, function(set)
                local entity = set[2]
                pcall(function() entity:Draw() end) --
            end)
            Game.Pop(alpha)
        else
            Array.foreach(self.entities, function(set)
                local entity = set[2]
                pcall(function() entity:Draw() end) --
            end)
        end

        if false then self:Debug() end
    end

    function Meta:Debug()
        local y = 40
        Array.foreach(self.entities, function(set)
            local key = set[1]
            local entity = set[2]
            local text = key .. " -> " .. entity.type
            if entity.key ~= nil then
                text = text .. " / key : " .. entity.key
            end
            if entity.volume ~= nil then
                text = text .. " / vol : " .. entity.volume
            end
            if entity.id ~= nil then
                text = text .. " / id : " .. entity.id
            end
            if entity.filename ~= nil then
                text = text .. " / filename : " .. entity.filename
            end
            if entity.visible ~= nil then
                if entity.visible then
                    text = text .. " / visible : true"
                else
                    text = text .. " / visible : false"
                end
            end
            Game.debugFont:Draw(text, 0, self.debug + y)
            y = y + 22
        end)
    end

    function Meta:Destroy()
        Array.foreach(self.entities, function(set)
            local entity = set[2]
            pcall(function() entity:Unload() end)
        end)
        self.entities = nil
    end
    function Meta:Clone(cb)
        local new = Scene.Create()
        if cb ~= nil then cb(new) end
        local list = {}
        Array.foreach( --
        Array.filter(self.entities, function(set)
            local e = set[2]
            return e.type ~= "audio" -- 오디오가 아닌 경우에만 복제
        end), --
        function(set)
            list[set[1]] = set[2]:Clone() -- 각 Entity를 복제
        end)
        new:Adds(list)
        return new
    end
    function Meta:Update()
        Array.foreach(self.entities, function(set)
            local entity = set[2]
            pcall(function() entity:Update() end)
        end)
    end

    local _ = {}
    function _.Create()
        local object = {alive = true, entities = {}, debug = 0}
        return setmetatable(object, {__index = Meta})
    end
    function _.Empty() return _.Create() end
    Scene = _
end
Scene()
