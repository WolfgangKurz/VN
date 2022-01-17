function dbg(...)
    local arg = {...}
    arg.n = #arg
    if arg.n == 0 then
        Bridge.Debug()
    elseif arg.n == 1 then
        Bridge.Debug(arg[1])
    elseif arg.n == 2 then
        Bridge.Debug(arg[1], arg[2])
    elseif arg.n == 3 then
        Bridge.Debug(arg[1], arg[2], arg[3])
    elseif arg.n == 4 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4])
    elseif arg.n == 5 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5])
    elseif arg.n == 6 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6])
    elseif arg.n == 7 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7])
    elseif arg.n == 8 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8])
    elseif arg.n == 9 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9])
    elseif arg.n == 10 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10])
    elseif arg.n == 11 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11])
    elseif arg.n == 12 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12])
    elseif arg.n == 13 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13])
    elseif arg.n == 14 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13], arg[14])
    elseif arg.n == 15 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13],
                     arg[14], arg[15])
    elseif arg.n == 16 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13],
                     arg[14], arg[15], arg[16])
    elseif arg.n == 17 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13],
                     arg[14], arg[15], arg[16], arg[17])
    elseif arg.n == 18 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13],
                     arg[14], arg[15], arg[16], arg[17], arg[18])
    elseif arg.n == 19 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13],
                     arg[14], arg[15], arg[16], arg[17], arg[18], arg[19])
    elseif arg.n == 20 then
        Bridge.Debug(arg[1], arg[2], arg[3], arg[4], arg[5], arg[6], arg[7],
                     arg[8], arg[9], arg[10], arg[11], arg[12], arg[13],
                     arg[14], arg[15], arg[16], arg[17], arg[18], arg[19],
                     arg[20])
    else
        error("Bridge.Debug can hold maximum 20 arguments, but " .. #arg ..
                  " passed")
    end
end
