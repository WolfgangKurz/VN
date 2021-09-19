function Image()
    local Meta = {}
    function Meta:Unload() Bridge:Image_Unload(self.id) end
    function Meta:Update() end
    function Meta:Draw()
        local x = self.x - (self.width * self.centerx)
        local y = self.y - (self.height * self.centery)
        Bridge:Image_Draw(self.id, self.srcx, self.srcy, self.srcwidth,
                          self.srcheight, x, y, self.width, self.height)
    end

    local _ = {}
    function _.Load(filename)
        local id = Bridge:Image_Load(filename)
        local size = Array.normalize(Bridge:Image_Size(id))
        local object = {
            id = id,
            x = 0,
            y = 0,
            srcx = 0,
            srcy = 0,
            width = size[1],
            height = size[2],
            srcwidth = size[1],
            srcheight = size[2],
            centerx = 0,
            centery = 0
        }
        return setmetatable(object, {__index = Meta})
    end
    Image = _
end
Image()
