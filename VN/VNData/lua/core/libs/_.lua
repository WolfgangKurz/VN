import("rect")
import("image")
import("sprite")
import("audio")
import("font")
import("input")
import("debug")

function fallback(value, default)
    if value == nil then return default end
    return value
end
