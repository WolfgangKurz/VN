local class = {}
class._bgmVolume = 100
class._bgsVolume = 100
class._meVolume = 100
class._seVolume = 100
class._currentBGM = nil -- 별도 객체
class._currentBGS = nil -- 별도 객체
class._bgm = nil
class._bgs = nil
class._me = nil
class._ses = {}
class._replayFadeTime = 0.5

local function updateCurrentBGM(self, bgm, pos)
    self._currentBGM = {file = bgm.file, volume = bgm.volume, pos = pos}
end
local function updateCurrentBGS(self, bgm, pos)
    self._currentBGS = {file = bgm.file, volume = bgm.volume, pos = pos}
end
local function cleanupSE(self)
    self._ses = Array.filter(self._ses, function(item)
        ret = item:isPlaying()
        if not ret then item:Unload() end
        return ret
    end)
end

function class:PlayBGM(bgm, pos)
    if self:isCurrentBGM(bgm) then
        self._bgm:Volume(self._bgmVolume)
    else
        self:StopBGM()
        if bgm ~= nil then
            self._bgm = bgm
            self._bgm:Volume(self._bgmVolume)
            if self._me == nil then
                self._bgm:Seek(pos or 0)
                self._bgm:Play()
            end
        end
    end
    updateCurrentBGM(self, bgm, pos)
end
function class:ReplayBGM(bgm)
    if self:isCurrentBGM(bgm) then
        self._bgm:Volume(self._bgmVolume)
    else
        self:PlayBGM(bgm, bgm:Pos())
        if bgm ~= nil then
            self._bgm = bgm
            if self._bgm ~= nil then
                self._bgm:FadeIn(self._replayFadeTime)
            end
        end
    end
end
function class:StopBGM()
    if self._bgm ~= nil then
        self._bgm:Unload()
        self._bgm = nil
        self._currentBGM = nil
    end
end
function class:FadeOutBGM(dur)
    if self._bgm ~= nil and self._currentBGM ~= nil then
        self._bgm:FadeOut(dur)
        self._currentBGM = nil
    end
end
function class:FadeInBGM(dur)
    if self._bgm ~= nil and self._currentBGM ~= nil then
        self._bgm:FadeIn(dur)
    end
end
function class:isCurrentBGM(bgm)
    return self._currentBGM ~= nil and self._bgm ~= nil and
               self._currentBGM.file == bgm.file
end

function class:PlayBGS(bgs, pos)
    if self:isCurrentBGS(bgs) then
        self._bgs:Volume(self._bgsVolume)
    else
        self:StopBGS()
        if bgs ~= nil then
            self._bgs = bgs
            self._bgs:Volume(self._bgsVolume)
            if self._me == nil then
                self._bgs:Seek(pos or 0)
                self._bgs:Play()
            end
        end
    end
    updateCurrentBGS(self, bgs, pos)
end
function class:ReplayBGS(bgs)
    if self:isCurrentBGS(bgs) then
        updateBGSParams(bgs)
    else
        self:PlayBGS(bgs, bgs:Pos())
        if bgs ~= nil then
            self._bgs = bgs
            if self._bgs ~= nil then
                self._bgs:FadeIn(self._replayFadeTime)
            end
        end
    end
end
function class:StopBGS()
    if self._bgs ~= nil then
        self._bgs:Unload()
        self._bgs = nil
        self._currentBGS = nil
    end
end
function class:FadeOutBGS(dur)
    if self._bgs ~= nil and self._currentBGS ~= nil then
        self._bgs:FadeOut(dur)
        self._currentBGS = nil
    end
end
function class:FadeInBGS(dur)
    if self._bgs ~= nil and self._currentBGS ~= nil then
        self._bgs:FadeIn(dur)
    end
end
function class:isCurrentBGS(bgs)
    return self._currentBGS ~= nil and self._bgs ~= nil and
               self._currentBGS.file == bgs.file
end

function class:PlayME(me)
    self:StopME()
    if me ~= nil then
        if self._bgm and self._currentBGM then
            self._currentBGM.pos = self._bgm:Pos()
            self._bgm:Pause()
        end

        self._me = me
        self._me:Volume(self._meVolume)
        self._me:Play()
    end
end
function class:FadeOutME(dur) if self._me ~= nil then self._me.FadeOut(dur) end end
function class:StopME()
    if self._me ~= nil then
        self._me:Unload()
        self._me = nil

        if self._bgm ~= nil and self._currentBGM ~= nil and
            not self._bgm:isPlaying() then
            self._bgm:Play()
            self._bgm:FadeIn(self._replayFadeTime)
        end
    end
end

function class:PlaySE(se)
    if se ~= nil then
        latest = Array.filter(self._ses, function(audio)
            return audio.frameCount == Game.frameCount and audio.file == se.file
        end)
        if #latest > 0 then return end -- prevent play same se at same frame

        se:Volume(self._seVolume)
        se.Play()
        Array.push(self._ses, se)
        cleanupSE(self)
    end
end
function class:StopSE()
    Array.foreach(self._ses, function(item)
        item:Stop()
        item:Unload()
    end)
    self._ses = {}
end

function class:StopAll()
    self:StopME()
    self:StopBGM()
    self:StopBGS()
    self:StopSE()
end

function class:SaveBGM()
    if self._bgm ~= nil then
        updateCurrentBGM(self, self._bgm, self._bgm:Pos())
        return self._currentBGM
    else
        return {file = "", volume = 0, pos = 0}
    end
end
function class:SaveBGS()
    if self._bgs ~= nil then
        updateCurrentBGS(self, self._bgs, self._bgs:Pos())
        return self._currentBGS
    else
        return {file = "", volume = 0, pos = 0}
    end
end

AudioManager = class
