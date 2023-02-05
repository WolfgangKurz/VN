Container = Object:extend()
Container.__class = "Container"
Container.__constructor = Container.new

function Container:new(x, y, width, height)
    self.children = {}
    self.x = x or 0
    self.y = y or 0
    self.width = width or 100
    self.height = height or 100
    self.color = {r = 255, g = 255, b = 255, a = 255}
end
function Container:Unload()
    self.children = Array.filter(self.children, function(child)
        if child ~= nil and type(child.Unload) == "function" then
            child:Unload()
        end
        return false
    end)
end

function Container:AddChild(child) Array.push(self.children, child) end
function Container:Draw()
    Game.Push()
    for i, v in ipairs(self.children) do
        if type(v.Draw) == "function" then v:Draw() end
    end
    layer = Image.LoadRaw(Game.Pop())
    layer.color = math.floor(self.color.r) | math.floor(self.color.g) << 8 |
                      math.floor(self.color.b) << 16 | math.floor(self.color.a)
    layer.x = self.y
    layer.y = self.y
    layer.width = self.width
    layer.height = self.height
    layer:Draw()
    layer:Unload()
end
