function Rect()
    local _ = {}
    function _.contain(x, y, tx, ty, tw, th)
        if ty == nil then
            local o = tx
            tx = o.x
            ty = o.y
            tw = o.width
            th = o.height
        end

        return x >= tx and x <= tx + tw and y >= ty and y <= ty + th
    end
end
Rect()
