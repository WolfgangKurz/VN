function Audio()
    local Meta = {}
    function Meta:Play() Bridge.Audio_Play(self.id) end
    function Meta:Stop() Bridge.Audio_Stop(self.id) end
    function Meta:Pause() Bridge.Audio_Pause(self.id) end
    function Meta:Volume(vol)
        self.volume = vol
        Bridge.Audio_Volume(self.id, vol * Audio.Master)
    end
    function Meta:FadeIn(dur)
        self.fadeTime = Time.now()
        self.fadeFrom = self.volume
        self.fadeTo = 1
        self.fadeDuration = dur
    end
    function Meta:FadeOut(dur)
        self.fadeTime = Time.now()
        self.fadeFrom = self.volume
        self.fadeTo = 0
        self.fadeDuration = dur
    end
    function Meta:Update()
        if self.fadeTime ~= 0 then
            local elapsed = Time.now() - self.fadeTime
            local progress = math.min(1, elapsed / self.fadeDuration)
            local current = self.fadeFrom + (self.fadeTo - self.fadeFrom) *
                                progress
            self:Volume(current)

            if progress >= 1 then self.fadeTime = 0 end
        end
    end
    function Meta:Clone()
        local n = Audio.Create(self.file, self.repeats)
        n:Volume(self.volume)
        return n
    end
    function Meta:Unload() Bridge.Audio_Unload(self.id) end

    local _ = {Master = 1}
    function _.Load(file, repeats)
        local obj = {
            type = "audio",
            id = Bridge.Audio_Load(file, repeats),
            file = file,
            repeats = repeats,
            volume = 1,
            fadeFrom = 0,
            fadeTo = 0,
            fadeTime = 0,
            fadeDuration = 0
        }
        return setmetatable(obj, {__index = Meta})
    end
    Audio = _
end
Audio()
