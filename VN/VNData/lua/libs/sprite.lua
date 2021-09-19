function Sprite()
    local Meta = {}
    function Meta:Unload() self.image:Unload() end
    function Meta:Update()
        if self.frames == nil then return end

        local frame = nil
        while true do
            frame = self.frames[self.frame + 1]
            if frame.duration < self.frameTime then
                self.frameTime = self.frameTime - frame.duration
                self.frame = (self.frame + 1) % Array.count(self.frames)
            else
                break
            end
        end

        if self.key ~= frame.key then self:Set(frame.key) end
    end
    function Meta:Draw()
        if self.image ~= nil then
            self.image.x = self.x
            self.image.y = self.y
            self.image:Draw()
        end
    end

    function Meta:Set(key)
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

                self.frames = nil
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
    function _.Load(filename)
        local img = Image.Load(filename .. ".sprite")

        local infos = {}
        local str = string.Replace(Bridge:Sprite_Info(filename), "\r", "")
        local _infos = string.Split(str, "\n")
        Array.foreach(_infos, function(v)
            local p = string.Split(v, "\t")
            local info = {
                name = p[1],
                x = tonumber(p[2]),
                y = tonumber(p[3]),
                width = tonumber(p[4]),
                height = tonumber(p[5])
            }

            infos[info.name] = info
        end)

        local object = {
            key = "",
            image = img,
            infos = infos,
            x = 0,
            y = 0,
            frames = nil,
            frame = 0
        }
        return setmetatable(object, {__index = Meta})
    end
    Sprite = _
end
Sprite()
