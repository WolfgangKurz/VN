Scene_Title = Scene_Base:extend()
Scene_Title.__class = "Scene_Title"
Scene_Title.__constructor = Scene_Title.new

function Scene_Title:new() Scene_Title.super.new(self) end

function Scene_Title:Create()
    Scene_Title.super.Create(self)
    self:createBackground()
    self:createForeground()
    self:createWindowLayer()
    self:createCommands()
end

function Scene_Title:Start()
    Scene_Title.super.Start(self)
    SceneManager:ClearStack()
    self:playTitleMusic()
    self:StartFadeIn(self:SlowFadeSpeed(), false)
end
function Scene_Title:Update()
    -- if not self:isBusy() then self._commandWindow:open() end
    Scene_Title.super.Update(self)
end
function Scene_Title:Terminate()
    Scene_Title.super.Terminate(self)
    SceneManager:SnapForBackground()
    if self._gameTitleSprite ~= nil then
        self._gameTitleSprite.bitmap:Unload()
        self._gameTitleSprite = nil
    end
end

function Scene_Title:isBusy() return Scene_Title.super.isBusy(self) end

function Scene_Title:createBackground()
    bg = Image.Load("BG/BG_Title")
    bg.width = Game.width
    bg.height = Game.height
    self._backSprite = bg
    self:AddChild(self._backSprite)
end
function Scene_Title:createForeground()
    title = Image.Load("IMG/logo")
    title.x = 1200
    title.y = 40
    title.centerx = 1
    self._titleSprite = title
    self:AddChild(self._titleSprite);
end
function Scene_Title:createCommands() end

function Scene_Title:playTitleMusic()
    AudioManager:PlayBGM(Audio.Load("BGM/title_first.mp3", true))
    AudioManager:StopBGS()
    AudioManager:StopME()
end
