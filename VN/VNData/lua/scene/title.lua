local scene = Scene.Create()

local bg = Image.Load("BG/BG_Title")
bg.width = Game.width
bg.height = Game.height
-- Transition.Progress(scene, 2, function(scene) scene:Add(bg) end)

local logo = Image.Load("IMG/logo")
logo.x = 1200
logo.y = 40
logo.centerx = 1
-- Transition.Progress(scene, 1, function(scene) scene:Add(logo) end)

-- local buttons = {
--     btnStart = Sprite.Load("IMG/title"),
--     btnLoad = Sprite.Load("IMG/title"),
--     btnCollection = Sprite.Load("IMG/title"),
--     btnOption = Sprite.Load("IMG/title")
-- }
-- Array.foreach(buttons, function(btn, k)
--     btn.x = 50
--     btn:Set(k)
-- end)
-- buttons.btnStart.y = 240
-- buttons.btnLoad.y = 360
-- buttons.btnCollection.y = 480
-- buttons.btnOption.y = 600

-- Transition.Progress(scene, 2, function(scene) scene:Adds(buttons) end)

-- function scene:Update()
--     -- Array.foreach(buttons, function(btn, k)
--     --     if Rect.contain(Mouse.X, Mouse.Y, btn) then
--     --         btn:Anim({
--     --             {key = k .. "_hover1", time = 300},
--     --             {key = k .. "_hover2", time = 300},
--     --             {key = k .. "_hover3", time = 300},
--     --             {key = k .. "_hover4", time = 300}
--     --         })
--     --     else
--     --         btnStart:Set(k)
--     --     end
--     -- end)
-- end

while true do
    -- Input:Update()
    -- scene:Update()

    -- scene:Draw()
    bg:Draw()
    Game:Update()
end

scene:Destroy()
