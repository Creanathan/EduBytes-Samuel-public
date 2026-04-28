/**
 * Ambient Audio Engine - EduBytes
 * - Procedurally generated sounds via Web Audio API (no external files)
 * - Smooth fade-in on room enter, fade-out on room leave
 * - Dropdown volume panel styled to match the noir game theme
 */

(function () {

    // ──────────────────────────────────────────────
    // ROOM SOUND PROFILES
    // ──────────────────────────────────────────────
    const ROOM_PROFILES = {
        outside: {
            label: "Thunderstorm",
            noiseColor: "brown", noiseVolume: 0.18,
            windFreq: 80, windVolume: 0.08,
            thunder: true, creak: false, fireplace: false, drone: false,
        },
        hallway: {
            label: "Old Manor",
            noiseColor: "brown", noiseVolume: 0.04,
            windFreq: 120, windVolume: 0.03,
            thunder: false, creak: true, fireplace: false, drone: false,
        },
        living_room: {
            label: "Fireplace",
            noiseColor: "brown", noiseVolume: 0.12,
            windFreq: 200, windVolume: 0.02,
            thunder: false, creak: false, fireplace: true, drone: false,
        },
        nursery: {
            label: "Quiet Room",
            noiseColor: "white", noiseVolume: 0.015,
            windFreq: 150, windVolume: 0.015,
            thunder: false, creak: true, fireplace: false, drone: false,
        },
        crime_scene: {
            label: "Tension Drone",
            noiseColor: "brown", noiseVolume: 0.05,
            windFreq: 60, windVolume: 0.07,
            thunder: false, creak: false, fireplace: false, drone: true,
        },
        nannys_room: {
            label: "Nursery Window",
            noiseColor: "brown", noiseVolume: 0.09,
            windFreq: 180, windVolume: 0.02,
            thunder: false, creak: true, fireplace: false, drone: false,
        },
    };

    // ──────────────────────────────────────────────
    // STATE
    // ──────────────────────────────────────────────
    const FADE_IN_DURATION  = 3.0;   // seconds to reach full volume
    const FADE_OUT_DURATION = 1.5;   // seconds to fade on page leave

    let ctx         = null;
    let masterGain  = null;
    let isMuted     = localStorage.getItem('sfx_muted') === 'true';
    let volume      = parseFloat(localStorage.getItem('sfx_volume') ?? '0.4');
    let started     = false;

    const filename  = window.location.pathname.split('/').pop().replace('.html', '');
    const profile   = ROOM_PROFILES[filename];
    if (!profile) return;

    // ──────────────────────────────────────────────
    // AUDIO INIT + FADE IN
    // ──────────────────────────────────────────────
    function initAudio() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        // Start at 0 and ramp up — the smooth fade-in
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(
            isMuted ? 0 : volume,
            ctx.currentTime + FADE_IN_DURATION
        );
        masterGain.connect(ctx.destination);
    }

    // Fade out before navigating away
    function fadeOutAndLeave(destination) {
        // Trigger visual fade-to-black
        const overlay = document.getElementById('transition-overlay');
        if (overlay) overlay.classList.add('active');

        if (!ctx || !masterGain) {
            setTimeout(() => {
                if (destination) window.location.href = destination;
            }, 1000); // Wait for visual fade even if no audio
            return;
        }
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT_DURATION);

        setTimeout(() => {
            if (destination) window.location.href = destination;
        }, FADE_OUT_DURATION * 1000);
    }

    // Intercept all navigation links & buttons to fade out first
    function patchNavigation() {
        const origGoTo = window.goToLocation;
        window.goToLocation = function(url) {
            if (window.EduBytesNavigation && typeof window.EduBytesNavigation.allowRoomNavigation === 'function') {
                window.EduBytesNavigation.allowRoomNavigation(url);
            }

            // Add autoplay flag so new room starts audio automatically
            const sep = url.includes('?') ? '&' : '?';
            const dest = new URL(url + sep + 'autoplay=1', window.location.href).href;

            // Play door sound immediately (audio context is already running)
            if (started) playDoorSound(dest);

            // Small delay so the door creak starts before fade begins
            const doorDelay = started ? 200 : 0;
            setTimeout(() => {
                if (started) {
                    fadeOutAndLeave(dest);
                } else {
                    window.location.href = dest;
                }
            }, doorDelay);
        };

        // Handle back button / other unload
        window.addEventListener('beforeunload', () => {
            if (ctx && masterGain) {
                masterGain.gain.cancelScheduledValues(ctx.currentTime);
                masterGain.gain.setValueAtTime(0, ctx.currentTime);
            }
        });
    }

    // ── Noise generator ──
    function createNoiseSource(color, vol) {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        if (color === 'brown') {
            let last = 0;
            for (let i = 0; i < bufferSize; i++) {
                const w = Math.random() * 2 - 1;
                data[i] = (last + 0.02 * w) / 1.02;
                last = data[i];
                data[i] *= 3.5;
            }
        } else {
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer; src.loop = true;
        const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime);
        src.connect(g); g.connect(masterGain); src.start();
        return src;
    }

    // ── Wind ──
    function createWind(freq, vol) {
        const osc = ctx.createOscillator();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const g = ctx.createGain(); g.gain.setValueAtTime(0, ctx.currentTime);
        const lfo = ctx.createOscillator(); lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08 + Math.random() * 0.08, ctx.currentTime);
        const lfoG = ctx.createGain(); lfoG.gain.setValueAtTime(vol, ctx.currentTime);
        lfo.connect(lfoG); lfoG.connect(g.gain);
        osc.connect(g); g.connect(masterGain); osc.start(); lfo.start();
    }

    // ── Fireplace crackle ──
    function createFireplace() {
        function crackle() {
            if (!ctx) return;
            const o = ctx.createOscillator(); o.type = 'sawtooth';
            o.frequency.setValueAtTime(100 + Math.random() * 300, ctx.currentTime);
            const g = ctx.createGain(); const v = 0.02 + Math.random() * 0.06;
            g.gain.setValueAtTime(v, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05 + Math.random() * 0.1);
            o.connect(g); g.connect(masterGain); o.start(); o.stop(ctx.currentTime + 0.2);
            setTimeout(crackle, 30 + Math.random() * 200);
        }
        crackle();
    }

    // ── Wood creak ──
    function createCreaks() {
        function doCreak() {
            if (!ctx) return;
            const o = ctx.createOscillator(); o.type = 'triangle';
            const f = 200 + Math.random() * 200;
            o.frequency.setValueAtTime(f, ctx.currentTime);
            o.frequency.linearRampToValueAtTime(f - 80, ctx.currentTime + 0.5);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.04, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
            o.connect(g); g.connect(masterGain); o.start(); o.stop(ctx.currentTime + 0.7);
            setTimeout(doCreak, 8000 + Math.random() * 17000);
        }
        setTimeout(doCreak, 4000 + Math.random() * 6000);
    }

    // ── Thunder ──
    function createThunder() {
        function doThunder() {
            if (!ctx) return;
            const size = ctx.sampleRate * 3;
            const buf = ctx.createBuffer(1, size, ctx.sampleRate);
            const d = buf.getChannelData(0); let l = 0;
            for (let i = 0; i < size; i++) {
                const w = Math.random() * 2 - 1;
                d[i] = (l + 0.02 * w) / 1.02; l = d[i];
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);
            const filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, ctx.currentTime);
            src.connect(filter); filter.connect(g); g.connect(masterGain);
            src.start();
            setTimeout(doThunder, 15000 + Math.random() * 25000);
        }
        doThunder();
    }

    // ── Tension Drone (for crime scene) ──
    function createDrone() {
        const t = ctx.currentTime;
        [60, 61, 62].forEach(f => {
            const osc = ctx.createOscillator();
            osc.frequency.value = f;
            const g = ctx.createGain();
            g.gain.value = 0.02;
            osc.connect(g); g.connect(masterGain);
            osc.start(t);
        });
    }

    // ── Door sounds (procedural — high fidelity overhaul) ──
    function playDoorSound(destUrl) {
        if (!ctx) return;
        const isHeavy = destUrl.includes('hallway') && filename === 'outside';
        if (isHeavy) {
            playHeavyDoor();
        } else {
            playInteriorDoor();
        }
    }

    // Big heavy mansion entrance door — focus on "weight" and "sub-bass"
    function playHeavyDoor() {
        const t = ctx.currentTime;

        // 1. Heavy Sub-Bass Thump (The physical shudder of the mansion frame)
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(45, t + 0.6);
        const subG = ctx.createGain();
        subG.gain.setValueAtTime(0, t + 0.6);
        subG.gain.linearRampToValueAtTime(0.4, t + 0.65);
        subG.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        sub.connect(subG); subG.connect(ctx.destination);
        sub.start(t + 0.6); sub.stop(t + 1.3);

        // 2. Resonant Wood Creak (Multi-oscillator for natural wood strain)
        [80, 84].forEach(f => {
            const o = ctx.createOscillator();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(f, t);
            o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.6);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.08, t + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.value = 400;
            o.connect(filter); filter.connect(g); g.connect(ctx.destination);
            o.start(t); o.stop(t + 0.7);
        });

        // 3. Impact Thud (Wood meeting the frame)
        const noise = ctx.createBufferSource();
        const size = ctx.sampleRate * 0.5;
        const buf = ctx.createBuffer(1, size, ctx.sampleRate);
        const d = buf.getChannelData(0); let l = 0;
        for (let i = 0; i < size; i++) {
            const w = Math.random() * 2 - 1;
            d[i] = (l + 0.05 * w) / 1.05; l = d[i];
        }
        noise.buffer = buf;
        const nF = ctx.createBiquadFilter();
        nF.type = 'lowpass'; nF.frequency.setValueAtTime(150, t + 0.6);
        const nG = ctx.createGain();
        nG.gain.setValueAtTime(0, t + 0.6);
        nG.gain.linearRampToValueAtTime(0.8, t + 0.62);
        nG.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        noise.connect(nF); nF.connect(nG); nG.connect(ctx.destination);
        noise.start(t + 0.6);
    }

    // Lighter interior door — focus on "mechanical latch" and "click"
    function playInteriorDoor() {
        const t = ctx.currentTime;

        // 1. Sharp Latch-In (Metallic mechanism)
        const click = ctx.createOscillator();
        click.type = 'square';
        click.frequency.setValueAtTime(2000, t);
        const clickG = ctx.createGain();
        clickG.gain.setValueAtTime(0.06, t);
        clickG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 3000;
        click.connect(filter); filter.connect(clickG); clickG.connect(ctx.destination);
        click.start(t); click.stop(t + 0.06);

        // 2. The Thud (Soft, hollow wood impact)
        const thudOsc = ctx.createOscillator();
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(140, t + 0.1);
        thudOsc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
        const thudG = ctx.createGain();
        thudG.gain.setValueAtTime(0, t + 0.1);
        thudG.gain.linearRampToValueAtTime(0.2, t + 0.12);
        thudG.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        thudOsc.connect(thudG); thudG.connect(ctx.destination);
        thudOsc.start(t + 0.1); thudOsc.stop(t + 0.5);

        // 3. Latch-Out/Handle Reset
        const reset = ctx.createOscillator();
        reset.type = 'triangle';
        reset.frequency.setValueAtTime(1200, t + 0.3);
        const resetG = ctx.createGain();
        resetG.gain.setValueAtTime(0, t + 0.3);
        resetG.gain.linearRampToValueAtTime(0.03, t + 0.32);
        resetG.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        reset.connect(resetG); resetG.connect(ctx.destination);
        reset.start(t + 0.3); reset.stop(t + 0.5);
    }

    function playClickSound() {
        const t = ctx.currentTime;
        const clickSize = ctx.sampleRate * 0.05;
        const clickBuf = ctx.createBuffer(1, clickSize, ctx.sampleRate);
        const clickData = clickBuf.getChannelData(0);
        for (let i = 0; i < clickSize; i++) clickData[i] = Math.random() * 2 - 1;
        const click = ctx.createBufferSource(); click.buffer = clickBuf;
        const clickFilter = ctx.createBiquadFilter();
        clickFilter.type = 'bandpass'; clickFilter.frequency.value = 2000;
        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.22, t + 0.45);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        click.connect(clickFilter); clickFilter.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(t + 0.45); click.stop(t + 0.6);
    }

    // ──────────────────────────────────────────────
    // START AUDIO
    // ──────────────────────────────────────────────
    function startAudio() {
        initAudio(); ctx.resume();
        createNoiseSource(profile.noiseColor, profile.noiseVolume);
        createWind(profile.windFreq, profile.windVolume);
        if (profile.fireplace) createFireplace();
        if (profile.creak)     createCreaks();
        if (profile.thunder)   createThunder();
        if (profile.drone)     createDrone();
    }

    function tryStart() {
        if (started) return;
        started = true;
        startAudio();
        document.removeEventListener('click', tryStart);
        document.removeEventListener('keydown', tryStart);
    }

    document.addEventListener('click', tryStart);
    document.addEventListener('keydown', tryStart);

    // Expose for external components
    window.AudioEngine = {
        play: (type) => {
            if (!ctx) return;
            if (type === 'door' || type === 'interior_door') playInteriorDoor();
            if (type === 'heavy_door') playHeavyDoor();
            if (type === 'click') playClickSound();
        },
        getVolume: () => volume,
        setVolume: (v) => {
            volume = v;
            localStorage.setItem('sfx_volume', volume);
            if (masterGain && !isMuted) {
                masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
            }
        },
        isMuted: () => isMuted,
        setMuted: (m) => {
            isMuted = m;
            localStorage.setItem('sfx_muted', isMuted);
            if (masterGain) {
                masterGain.gain.setTargetAtTime(isMuted ? 0 : volume, ctx.currentTime, 0.1);
            }
        },
        tryStart: () => tryStart()
    };
})();
