function Rect()
    local _ = {}
    function _.contain(x, y, tx, ty, tw, th)
        if ty == nil then
            local o = tx
            return x >= o.x and x <= o.x + o.image.width and y >= o.y and y <= o.y + o.image.height
        end

        return x >= tx and x <= tx + tw and y >= ty and y <= ty + th
    end

    Rect = _
end
Rect()
