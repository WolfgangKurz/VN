function Sprite()
    local Meta = {}
    function Meta:Clone()
        local c = Object.clone(self)
        c.id = Time.now()
        c.image = self.image:Clone()
        return c
    end
    function Meta:Unload() self.image:Unload() end
    function Meta:Update()
        if self.frames == nil then return end

        local now = Time.now()
        local frame, elapsed = nil, now - self.frameTime

        while true do
            frame = self.frames[self.frame + 1]
            if elapsed > frame.duration then
                elapsed = elapsed - frame.duration
                self.frameTime = self.frameTime + frame.duration
                self.frame = (self.frame + 1) % #self.frames
            else
                break
            end
        end

        if self.key ~= frame.key then self:Set(frame.key, true) end
    end
    function Meta:Draw()
        if self.visible ~= true then return end
        if self.image ~= nil then
            self.image.x = self.x
            self.image.y = self.y
            self.image.centerx = self.centerx
            self.image.centery = self.centery
            self.image.color = self.color
            self.image:Draw()
        end
    end

    function Meta:Set(key, inframe)
        if self.key ~= key then
            local info = self.infos[key]
            if info ~= nil then
                self.key = key

                self.image.srcx = info.x
                self.image.srcy = info.y
                self.image.srcwidth = info.width
                self.image.srcheight = info.height

                self.image.width = info.width
                self.image.height = info.height

                if inframe ~= true then self.frames = nil end
            end
        end
    end
    function Meta:Anim(frames)
        self.frames = frames
        self.frame = 0
        self.frameTime = Time.now()
        self:Update()
    end

    local _ = {}
    function _.Load(filename, init)
        local img = Image.Load(filename .. ".sprite")

        local infos = {}
        local _infos = Bridge.Sprite_Info(filename)
        Array.foreach(_infos, function(v)
            local name = v[1]
            local info = {
                name = name,
                x = tonumber(v[2]),
                y = tonumber(v[3]),
                width = tonumber(v[4]),
                height = tonumber(v[5])
            }
            infos[name] = info
        end)

        local object = {
            type = "sprite",
            id = Time.now(),
            key = "",
            image = img,
            infos = infos,
            x = 0,
            y = 0,
            centerx = 0,
            centery = 0,
            frames = nil,
            frame = 0,
            frameTime = 0,
            color = 0xffffffff,
            visible = true
        }
        local ret = setmetatable(object, {__index = Meta})
        if init ~= nil then ret:Set(init) end
        return ret
    end
    Sprite = _
end
Sprite()
