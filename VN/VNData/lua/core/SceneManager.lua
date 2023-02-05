local class = {}
class._scene = nil
class._nextScene = nil
class._stack = {}
class._exiting = false
class._previousScene = nil
class._previousClass = nil
class._backgroundBitmap = nil
class._smoothDeltaTime = 1
class._elapsedTime = 0

local Meta = {}
local function initialize(self)
    Game.SetTickHandler(function(deltaTime)
        self:Update(deltaTime) -- 프레임 핸들러
    end)
end

local function DetermineRepeatNumber(self, deltaTime)
    self._smoothDeltaTime = self._smoothDeltaTime * 0.8
    self._smoothDeltaTime = self._smoothDeltaTime + math.min(deltaTime, 2) * 0.2
    if self._smoothDeltaTime >= 0.9 then
        self._elapsedTime = 0
        return math.round(self._smoothDeltaTime)
    else
        self._elapsedTime = self._elapsedTime + deltaTime
        if self._elapsedTime >= 1 then
            self._elapsedTime = self._elapsedTime - 1
            return 1
        end
        return 0
    end
end

function class:Run(sceneClass)
    -- if call(function()
    initialize(self)
    self:GoTo(sceneClass)
    Game.StartGameLoop()
    -- end) then return end
end

function class:Update(deltaTime)
    -- if pcall(function()
    local n, i = DetermineRepeatNumber(self, deltaTime), 0
    for i = 1, n do self:UpdateMain() end
    -- end) then return end
end
function class:UpdateMain()
    Game.frameCount = Game.frameCount + 1
    Input.Update()
    self:ChangeScene()
    self:UpdateScene()
end

function class:ChangeScene()
    if self:isSceneChanging() and not self:isCurrentSceneBusy() then
        if self._scene then
            self._scene:Terminate()
            self:onSceneTerminate()
        end

        self._scene = self._nextScene
        self._nextScene = nil
        if self._scene then
            self._scene:Create()
            self:onSceneCreate()
        end

        if self._exiting then self:Terminate() end
    end
end
function class:UpdateScene()
    if self._scene ~= nil then
        if self._scene:isStarted() then
            self._scene:Update() --
        else
            self:onBeforeSceneStart()
            self._scene:Start()
            self:onSceneStart()
        end
    end
end

function class:GoTo(sceneClass)
    if sceneClass ~= nil then self._nextScene = sceneClass() end
    if self._scene ~= nil then self._scene:Stop() end
end

function class:Push(sceneClass)
    Array.push(self._stack, self._scene.__constructor)
    self:GoTo(sceneClass)
end
function class:Pop()
    if #self._stack > 0 then
        self.GoTo(Array.pop(self._stack))
    else
        self:Exit()
    end
end
function class:Exit()
    self:GoTo(nil)
    self._exiting = true
end
function class:ClearStack() self._stack = {} end
function class:Stop() Game.StopGameLoop() end

function class:Snap() return Image.LoadRaw(Game.Snap()) end
function class:SnapForBackground()
    if self._backgroundBitmap ~= nil then self._backgroundBitmap:Unload() end
    self._backgroundBitmap = self:Snap()
end
function class:BackgroundBitmap() return self._backgroundBitmap end
function class:Resume() Game.StartGameLoop() end

function class:onSceneCreate()
    -- 씬 로드 시작
end
function class:onSceneTerminate()
    self._previousScene = self._scene
    self._previousClass = self._scene.__constructor
    Game.SetStage(nil)
end
function class:onBeforeSceneStart()
    if self._previousScene then
        self._previousScene:Unload()
        self._previousScene = nil
    end
end
function class:onSceneStart()
    -- 로딩 종료
    Game.SetStage(self._scene)
end
function class:onUnload() AudioManager:StopAll() end

function class:isSceneChanging() return self._exiting or self._nextScene end
function class:isCurrentSceneBusy() return self._scene and self._scene.isBusy() end
function class:isNextScene(sceneClass)
    return self._nextScene and self._nextScene.__constructor == sceneClass
end
function class:isPreviousScene(sceneClass)
    return self._previousClass == sceneClass
end

SceneManager = class
