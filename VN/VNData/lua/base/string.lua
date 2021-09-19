function string.Split(str, delimiter)
    local result = {}
    local from = 1
    local delim_from, delim_to = string.find(str, delimiter, from)

    while delim_from do
        table.insert(result, string.sub(str, from, delim_from - 1))
        from = delim_to + 1
        delim_from, delim_to = string.find(str, delimiter, from)
    end

    table.insert(result, string.sub(str, from))
    return result
end
function string.Replace(str, from, to)
    local start, _end = string.find(str, from)
    local ret = str
    while start ~= nil do
        local cnt = string.len(ret)
        ret = string.sub(ret, 1, start - 1) .. to ..
                  string.sub(ret, _end + 1, cnt)

        start, _end = string.find(ret, from)
    end
    return ret
end
