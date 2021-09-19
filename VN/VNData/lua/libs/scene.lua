function Scene()
    local Meta = {}
    function Meta:Add(entity) Array.push(self.entities, entity) end
    function Meta:Adds(entities) Array.pushes(self.entities, entities) end
    function Meta:Remove(entity)
        self.entities = Array.filter(self.entities, function(t, i)
            test = t[i] == entity
            if (test) then t[i]:Unload() end
            return test
        end)
    end
    function Meta:Draw(alpha)
        if alpha ~= nil then Bridge:Graphics_EnterSurface() end
        Array.foreach(self.entities, function(entity) entity:Draw() end)
        if alpha ~= nil then Bridge:Graphics_FlushSurface(alpha) end
    end
    function Meta:Destroy()
        Array.foreach(self.entities, function(entity) entity:Unload() end)
        self.entities = nil
    end
    function Meta:Clone()
        local new = Scene.Create()
        new:Adds(self.entities)
        return new
    end
    function Meta:Update()
        -- TODO : Update Animated Sprite
    end

    local _ = {}
    function _.Create()
        local object = {entities = {}}
        return setmetatable(object, {__index = Meta})
    end
    function _.Empty() return _.Create() end
    Scene = _
end
Scene()
