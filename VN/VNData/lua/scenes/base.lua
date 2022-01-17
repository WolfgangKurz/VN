Scene_Base = Container:extend()
Scene_Base.__class = "Scene_Base"
Scene_Base.__constructor = Scene_Base.new

function Scene_Base:new() Scene_Base.super.new(self) end

function Scene_Base:Initialize()
    self._started = false
    self._active = false
    self._fadeSign = 0
    self._fadeDuration = 0
    self._fadeWhite = 0
    self._fadeOpacity = 0
end

function Scene_Base:Create()
    -- Placeholder
end
function Scene_Base:Start() self._started, self._active = true, true end
function Scene_Base:Update()
    self:UpdateFade()
    self:UpdateChildren()
end
function Scene_Base:Stop() self._active = false end
function Scene_Base:Terminate()
    -- Placeholder
end

function Scene_Base:createWindowLayer()
    layer = Container:new()
    self:AddChild(layer)
end

function Scene_Base:StartFadeIn(duration, isWhite)
    self._fadeSign = 1
    self._fadeDuration = duration or 30
    self._fadeWhite = isWhite or false
    self._fadeOpacity = 255
end
function Scene_Base:StartFadeOut(duration, isWhite)
    self._fadeSign = -1
    self._fadeDuration = duration or 30
    self._fadeWhite = isWhite or false
    self._fadeOpacity = 0
end
function Scene_Base:UpdateFade()
    if self._fadeDuration > 0 then
        local d = self._fadeDuration
        if self._fadeSign > 0 then
            self._fadeOpacity = self._fadeOpacity - (self._fadeOpacity / d);
        else
            self._fadeOpacity = self._fadeOpacity +
                                    ((255 - self._fadeOpacity) / d);
        end
        self._fadeDuration = self._fadeDuration - 1
    end
end
function Scene_Base:UpdateChildren()
    for i, child in ipairs(self.children) do
        if type(child.Update) == "function" then child:Update() end
    end
end

function Scene_Base:Draw()
    Scene_Base.super.Draw(self)

    local c, a, rgba = 0, self._fadeOpacity, 0
    if self._fadeWhite then c = 255 end
    rgba = c | c << 8 | c << 16 | math.floor(a) << 24
    Game.Fill(rgba)
end

function Scene_Base:PopScene() SceneManager:Pop() end

function Scene_Base:FadeOutAll()
    local time = self:SlowFadeSpeed() / 60
    AudioManager:FadeOutBgm(time)
    AudioManager:FadeOutBgs(time)
    AudioManager:FadeOutMe(time)
    self:StartFadeOut(self:SlowFadeSpeed())
end
function Scene_Base:FadeSpeed() return 24 end
function Scene_Base:SlowFadeSpeed() return self:FadeSpeed() * 2 end

function Scene_Base:isActive() return self._active end
function Scene_Base:isStarted() return self._started end
function Scene_Base:isBusy() return self:isFading() end
function Scene_Base:isFading() return self._fadeDuration > 0 end
