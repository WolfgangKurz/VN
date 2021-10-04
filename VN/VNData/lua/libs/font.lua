function Font()
    local Meta = {}
    function Meta:Clone()
        Bridge.Font_Clone(self.id)
        return Object.clone(self)
    end
    function Meta:Unload() Bridge.Font_Unload(self.id) end
    function Meta:Draw(text, x, y, width)
        Bridge.Font_Draw(self.id, text, self.size, x, y, self.color, self.bold,
                         self.italic, self.underline, self.strike, self.align,
                         width)
    end
    function Meta:Update()
        -- Nothing to do
    end

    local _ = {}
    function _.Create(fontface, size, bold, italic, underline, strike)
        local obj = {
            type = "font",
            id = Bridge.Font_Create(fontface),
            size = size,
            color = 0xffffffff, -- 색상은 0xAARRGGBB 형식
            align = 0,
            bold = bold,
            italic = italic,
            underline = underline,
            strike = strike
        }
        return setmetatable(obj, {__index = Meta})
    end

    Font = _
end
Font()
