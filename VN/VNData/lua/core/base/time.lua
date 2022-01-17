function Time()
    local _ = {}
    function _.now() return os.clock() end
    Time = _
end
Time()
