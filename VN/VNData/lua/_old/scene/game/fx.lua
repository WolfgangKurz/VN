function fx.shake(slot, power, period, initializer)
    return fx.r(slot, -- slot번 FX 슬롯
    function(scene) -- 초기화
        initializer(scene)

        local bg = scene:Find("BG")
        local _power = 1 - power
        bg.srcwidth = bg.source.width * _power
        bg.srcheight = bg.source.height * _power

        local ret = {
            power = power, -- 가장 크게 흔들릴 때 power * 100% 만큼의 크기가 흔들림
            multiply = 1, -- 최종 곱 factor (흔들림 값 = power * multiply)
            period = period, -- 갱신 주기
            last = 0 -- 목표 위치 갱신 기준
        }
        -- 초기 좌표, 목표 좌표
        ret.px, ret.py, ret.dx, ret.dy = 0, 0, 0, 0
        return ret
    end, function(scene, data) -- Update
        local t = Time.now()
        local bg = scene:Find("BG")
        if bg ~= nil then
            local now = Time.now()
            local base = data.power / 2
            if now - data.last >= data.period then
                local div = 1 / base
                data.px = data.dx
                data.py = data.dy
                data.dx = math.random() / div * data.power
                data.dy = math.random() / div * data.power
                data.last = now
            end

            local base = data.power / 2
            local progress = (now - data.last) / data.period
            bg.srcx = bg.source.width *
                          (base + (data.px + (data.dx - data.px) * progress) *
                              data.multiply)
            bg.srcy = bg.source.height *
                          (base + (data.py + (data.dy - data.py) * progress) *
                              data.multiply)
        end
    end)
end
function fx.shakeFadeOut(target, dur)
    local slot = nil
    slot = fx.r(nil, -- 비어있는 FX 슬롯
    function(scene) -- 초기화
        return {time = Time.now()}
    end, function(scene, data) -- Update
        local available = fx.data(target, function(d) -- 점차 줄이기
            d.multiply = math.max(0, 1 - (Time.now() - data.time) / dur) -- dur초 동안 점점 약해지도록
            if d.multiply <= 0 then -- Fadeout이 끝났다면 두 효과를 해제
                fx.d(target)
                fx.d(slot)
            end
        end)
        if not available then fx.d(slot) end -- 이미 대상 FX가 제거된 경우
    end)
end
