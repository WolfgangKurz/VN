function Scene()
    local Meta = {}
    function Meta:Add(entity) Array.push(self.entities, entity) end
    function Meta:Adds(entities)
        self.entities = Array.pushes(self.entities, entities)
    end
    function Meta:Remove(entity)
        self.entities = Array.filter(self.entities, function(t, i)
            test = t[i].type == entity.type and t[i].id == entity.id
            if (test) then pcall(function() t[i]:Unload() end) end
            return not test
        end)
    end
    function Meta:Draw(alpha)
        local y = 40
        if alpha ~= nil then
            Bridge.Graphics_EnterSurface()
            Array.foreach(self.entities, function(entity)
                pcall(function() entity:Draw() end) --
            end)
            Bridge.Graphics_FlushSurface(alpha)
        else
            Array.foreach(self.entities, function(entity)
                pcall(function() entity:Draw() end) --
            end)
        end

        if false then
            Array.foreach(self.entities, function(entity)
                local text = ""
                if entity.id == nil then
                    text = "id : " .. entity.key
                elseif entity.volume ~= nil then
                    text = "vol : " .. entity.volume
                else
                    text = "id : " .. entity.id
                end
                Game.debugFont:Draw(text, 0, y)
                y = y + 20
            end)
        end
    end
    function Meta:Destroy()
        Array.foreach(self.entities, function(entity)
            pcall(function() entity:Unload() end)
        end)
        self.entities = nil
    end
    function Meta:Clone()
        local new = Scene.Create()
        new:Adds(self.entities)
        return new
    end
    function Meta:Update()
        Array.foreach(self.entities, function(entity) entity:Update() end)
    end

    local _ = {}
    function _.Create()
        local object = {alive = true, entities = {}}
        return setmetatable(object, {__index = Meta})
    end
    function _.Empty() return _.Create() end
    Scene = _
end
Scene()
