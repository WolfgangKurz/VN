function UTF8()
    _ = {}
    function _.charlen(str, bytePos)
        bytePos = bytePos or 1
        local c = string.byte(str, bytePos)

        -- RFC 3629
        if c > 0 and c <= 127 then -- utf8-1
            return 1
        elseif c >= 194 and c <= 223 then -- utf8-2
            local c2 = string.byte(str, bytePos + 1)
            return 2
        elseif c >= 224 and c <= 239 then -- utf8-3
            local c2 = str:byte(bytePos + 1)
            local c3 = str:byte(bytePos + 2)
            return 3
        elseif c >= 240 and c <= 244 then -- utf8-4
            local c2 = str:byte(bytePos + 1)
            local c3 = str:byte(bytePos + 2)
            local c4 = str:byte(bytePos + 3)
            return 4
        end
    end
    function _.len(str)
        local pos = 1
        local bytes = string.len(str)
        local len = 0

        while pos <= bytes and len ~= chars do
            local c = string.byte(str, pos)
            len = len + 1
            pos = pos + _.charlen(str, pos)
        end
        if chars ~= nil then return pos - 1 end
        return len
    end
    function _.sub(str, start, length)
        length = length or -1

        if start == nil then return "" end

        local pos = 1
        local bytes = string.len(str)
        local len = 0

        local l = (start >= 0 and length >= 0) or _.len(str)
        local startChar = (start >= 0) and start or l + start + 1
        local endChar = (length >= 0) and length or l + length + 1
        if startChar > endChar then return "" end

        local startByte, endByte = 1, bytes
        while pos <= bytes do
            len = len + 1
            if len == startChar then startByte = pos end

            pos = pos + _.charlen(str, pos)
            if len == endChar then
                endByte = pos - 1
                break
            end
        end

        return string.sub(str, startByte, endByte)
    end
    UTF8 = _
end
UTF8()
