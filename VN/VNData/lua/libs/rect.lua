function Rect()
    local _ = {}
    function _.contain(x, y, tx, ty, tw, th)
        if ty == nil then
            local o = tx

            if o.width == nil then
                return
                    x >= o.x and x <= o.x + o.image.width and y >= o.y and y <=
                        o.y + o.image.height
            else
                return
                    x >= o.x and x <= o.x + o.width and y >= o.y and y <= o.y +
                        o.height
            end
        end

        return x >= tx and x <= tx + tw and y >= ty and y <= ty + th
    end

    Rect = _
end
Rect()
