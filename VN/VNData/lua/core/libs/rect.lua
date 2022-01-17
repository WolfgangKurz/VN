function Rect()
    local _ = {}
    function _.contain(x, y, tx, ty, tw, th)
        if ty == nil then
            local o = tx
            local sx, sy = 0, 0

            if o.width == nil then
                sx, sy = o.x - o.image.width * o.centerx,
                         o.y - o.image.height * o.centery
                return x >= sx and x <= sx + o.image.width and y >= sy and y <=
                           sy + o.image.height
            else
                sx, sy = o.x - o.width * o.centerx, o.y - o.height * o.centery
                return x >= sx and x <= sx + o.width and y >= sy and y <= sy +
                           o.height
            end
        end

        return x >= tx and x <= tx + tw and y >= ty and y <= ty + th
    end

    Rect = _
end
Rect()
