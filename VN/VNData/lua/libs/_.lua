import("libs/rect")
import("libs/image")
import("libs/sprite")
import("libs/audio")
import("libs/font")
import("libs/input")
import("libs/game")
import("libs/scene")

function fallback(value, default)
    if value == nil then return default end
    return value
end
