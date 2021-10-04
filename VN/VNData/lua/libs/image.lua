function Image()
    local Meta = {}
    function Meta:Clone()
        Bridge.Image_Clone(self.id)
        return Object.clone(self)
    end
    function Meta:Unload() Bridge.Image_Unload(self.id) end
    function Meta:Update() end
    function Meta:Draw()
        if self.visible ~= true then return end

        local x = self.x - (self.width * self.centerx)
        local y = self.y - (self.height * self.centery)
        Bridge.Image_Draw(self.id, self.srcx, self.srcy, self.srcwidth,
                          self.srcheight, x, y, self.width, self.height,
                          self.originx, self.originy, self.opacity, self.angle)
    end

    local _ = {}
    function _.Load(filename)
        local id = Bridge.Image_Load(filename)
        local width, height = Bridge.Image_Size(id)
        local object = {
            type = "image",
            id = id,
            filename = filename,
            visible = true,
            x = 0,
            y = 0,
            srcx = 0,
            srcy = 0,
            width = width,
            height = height,
            srcwidth = width,
            srcheight = height,
            centerx = 0,
            centery = 0,
            originx = width / 2,
            originy = height / 2,
            opacity = 1,
            angle = 0
        }
        return setmetatable(object, {__index = Meta})
    end
    Image = _
end
Image()
