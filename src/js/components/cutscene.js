/**
 * Cutscene Engine — EduBytes / NormaLIES
 * Plays a short cinematic intro when a new game is started.
 *
 * Sequence:
 *   1. Fade-in from black
 *   2. Slide 1 (exterior wide shot) — narration typed out
 *   3. Cross-fade to Slide 2 (interior car close-up) — narration typed out
 *   4. Fade to black → navigate to first room
 *
 * Skippable with the "Skip" button or pressing Escape / Enter / Space.
 */

const CutsceneEngine = (() => {

    /* ── Slide definitions ────────────────────── */
    const SLIDES = [
        {
            image: './src/assets/cutscenes/cutscene_auto(2).png',
            kenBurns: 'kb-pan-left',
            narration: 'A cold rain hammered the empty lot. The kind of night that made honest men stay home… and guilty ones get careless.',
        },
        {
            image: './src/assets/cutscenes/cutscene_auto(1).png',
            kenBurns: 'kb-zoom-in',
            narration: '"Dekoning. The Dégrasse estate — get there before the rain washes everything away." The line went dead. Some invitations you can\'t refuse.',
        },
    ];

    const TYPING_SPEED = 38;          // ms per character
    const FADE_IN_DURATION = 1200;    // ms overlay fade-in
    const CROSSFADE_DELAY = 1400;     // ms overlap between slides
    const END_HOLD = 2000;            // ms hold on black before navigating

    let overlayEl = null;
    let currentTimeout = null;
    let typingInterval = null;
    let isPlaying = false;
    let navigateUrl = './src/rooms/outside.html';
    let audioCtx = null;

    /* ── Click / key-advance resolver ─────────── */
    let advanceResolve = null;        // resolved when user clicks to continue

    /* ── Build the DOM ────────────────────────── */
    function buildOverlay() {
        if (document.getElementById('cutscene-overlay')) {
            overlayEl = document.getElementById('cutscene-overlay');
            return;
        }

        overlayEl = document.createElement('div');
        overlayEl.id = 'cutscene-overlay';

        // Letterbox bars
        overlayEl.innerHTML = `
            <div class="cutscene-letterbox-top"></div>
            <div class="cutscene-letterbox-bottom"></div>
            <div class="cutscene-vignette"></div>
            <div class="cutscene-rain"></div>
            <div class="cutscene-narration">
                <div class="cutscene-narration-inner">
                    <div class="cutscene-narration-text" id="cutscene-text"></div>
                </div>
            </div>
            <div class="cutscene-continue" id="cutscene-continue">Click to continue…</div>
            <button class="cutscene-skip" id="cutscene-skip" aria-label="Skip cutscene">Skip ▸▸</button>
        `;

        // Build slide elements
        SLIDES.forEach((slide, i) => {
            const slideEl = document.createElement('div');
            slideEl.className = `cutscene-slide ${slide.kenBurns}`;
            slideEl.id = `cutscene-slide-${i}`;
            slideEl.innerHTML = `<img src="${slide.image}" alt="Cutscene frame ${i + 1}">`;
            overlayEl.insertBefore(slideEl, overlayEl.firstChild);
        });

        document.body.appendChild(overlayEl);

        // Skip button handler
        document.getElementById('cutscene-skip').addEventListener('click', (e) => {
            e.stopPropagation();
            skip();
        });

        // Click anywhere on the overlay to advance
        overlayEl.addEventListener('click', handleAdvanceClick);
    }

    /* ── Handle advance click ─────────────────── */
    function handleAdvanceClick(e) {
        // Don't advance if clicking the skip button
        if (e.target.closest('.cutscene-skip')) return;
        if (!isPlaying) return;

        // If typing is still in progress, skip to end of typing
        if (typingInterval) {
            finishTypingImmediately();
            return;
        }

        // If we're waiting for the user to advance, resolve
        if (advanceResolve) {
            const resolve = advanceResolve;
            advanceResolve = null;
            hideContinuePrompt();
            resolve();
        }
    }

    /* ── Finish typing immediately ────────────── */
    function finishTypingImmediately() {
        if (!typingInterval) return;
        clearInterval(typingInterval);
        typingInterval = null;

        // Fill in the remaining text
        const el = document.getElementById('cutscene-text');
        const textSpan = el.querySelector('span:first-child');
        const cursor = el.querySelector('.cutscene-cursor');
        if (textSpan && currentNarration) {
            textSpan.textContent = currentNarration;
        }
        if (cursor) {
            cursor.style.opacity = '0';
            cursor.style.transition = 'opacity 0.5s ease';
        }

        // Trigger the typing-done callback
        if (typingDoneCallback) {
            const cb = typingDoneCallback;
            typingDoneCallback = null;
            cb();
        }
    }

    let currentNarration = '';
    let typingDoneCallback = null;

    /* ── Show / hide "Click to continue" ──────── */
    function showContinuePrompt() {
        const el = document.getElementById('cutscene-continue');
        if (el) el.classList.add('visible');
    }

    function hideContinuePrompt() {
        const el = document.getElementById('cutscene-continue');
        if (el) el.classList.remove('visible');
    }

    /* ── Typewriter effect ────────────────────── */
    function typeText(text, callback) {
        const el = document.getElementById('cutscene-text');
        el.innerHTML = '';
        let charIndex = 0;
        currentNarration = text;
        typingDoneCallback = callback;

        // Create span for text and cursor
        const textSpan = document.createElement('span');
        const cursor = document.createElement('span');
        cursor.className = 'cutscene-cursor';
        el.appendChild(textSpan);
        el.appendChild(cursor);

        clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (charIndex < text.length) {
                const char = text[charIndex];
                textSpan.textContent += char;
                
                // Play typewriter sound for non-space characters
                if (char.trim() !== '' && audioCtx) {
                    playTypewriterClick();
                }
                
                charIndex++;
            } else {
                clearInterval(typingInterval);
                typingInterval = null;
                currentNarration = '';
                typingDoneCallback = null;
                // Keep cursor blinking for a moment, then remove
                setTimeout(() => {
                    cursor.style.opacity = '0';
                    cursor.style.transition = 'opacity 0.5s ease';
                }, 800);
                if (callback) callback();
            }
        }, TYPING_SPEED);
    }

    /* ── Wait for user click to continue ──────── */
    function waitForClick() {
        return new Promise((resolve) => {
            showContinuePrompt();
            advanceResolve = resolve;
        });
    }

    /* ── Audio ────────────────────────────────── */
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTypewriterClick() {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        
        // Multiple oscillators to create a mechanical click sound
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        osc1.type = 'square';
        osc2.type = 'triangle';
        
        // Randomize pitch slightly
        const baseFreq = 500 + Math.random() * 300;
        osc1.frequency.setValueAtTime(baseFreq, t);
        osc2.frequency.setValueAtTime(baseFreq * 1.5, t);
        
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800;
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(g);
        g.connect(audioCtx.destination);
        
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.04);
        osc2.stop(t + 0.04);
    }

    /* ── Play a single slide ──────────────────── */
    function playSlide(index) {
        return new Promise((resolve) => {
            if (!isPlaying) return resolve();

            const slide = SLIDES[index];
            const slideEl = document.getElementById(`cutscene-slide-${index}`);

            // Activate slide (fade in via CSS)
            slideEl.classList.add('active');

            // Start narration typing after a short beat
            currentTimeout = setTimeout(() => {
                if (!isPlaying) return resolve();

                typeText(slide.narration, () => {
                    // Narration done — wait for user click to continue
                    waitForClick().then(() => {
                        resolve();
                    });
                });
            }, 600);
        });
    }

    /* ── Deactivate a slide ───────────────────── */
    function deactivateSlide(index) {
        const slideEl = document.getElementById(`cutscene-slide-${index}`);
        if (slideEl) slideEl.classList.remove('active');
    }

    /* ── Main sequence ────────────────────────── */
    async function play(url) {
        if (isPlaying) return;
        isPlaying = true;
        navigateUrl = url || navigateUrl;
        
        initAudio();

        buildOverlay();

        // Fade-in the overlay
        requestAnimationFrame(() => {
            overlayEl.classList.add('active');
        });

        // Wait for overlay fade-in
        await wait(FADE_IN_DURATION);

        // Play each slide in sequence
        for (let i = 0; i < SLIDES.length; i++) {
            if (!isPlaying) break;

            await playSlide(i);

            // Cross-fade: start fading out current before next begins
            if (i < SLIDES.length - 1 && isPlaying) {
                // Brief pause before crossfade
                await wait(400);
                deactivateSlide(i);
                // Small overlap
                await wait(CROSSFADE_DELAY);
            }
        }

        if (isPlaying) {
            endCutscene();
        }
    }

    /* ── End / fade to black ──────────────────── */
    function endCutscene() {
        isPlaying = false;
        clearInterval(typingInterval);
        clearTimeout(currentTimeout);
        advanceResolve = null;
        hideContinuePrompt();

        // Fade all slides out and go to black
        overlayEl.classList.add('fade-to-black');

        // Also fade the main menu behind
        document.body.classList.add('fade-out');

        setTimeout(() => {
            window.location.href = navigateUrl;
        }, END_HOLD);
    }

    /* ── Skip ─────────────────────────────────── */
    function skip() {
        if (!isPlaying) return;
        endCutscene();
    }

    /* ── Keyboard support ─────────────────────── */
    function onKeyDown(e) {
        if (!isPlaying) return;

        // Escape always skips entirely
        if (e.key === 'Escape') {
            e.preventDefault();
            skip();
            return;
        }

        // Enter / Space advance (same as clicking)
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();

            // If typing, finish it immediately
            if (typingInterval) {
                finishTypingImmediately();
                return;
            }

            // If waiting for click, advance
            if (advanceResolve) {
                const resolve = advanceResolve;
                advanceResolve = null;
                hideContinuePrompt();
                resolve();
            }
        }
    }

    document.addEventListener('keydown', onKeyDown);

    /* ── Utility ──────────────────────────────── */
    function wait(ms) {
        return new Promise(resolve => {
            currentTimeout = setTimeout(resolve, ms);
        });
    }

    /* ── Public API ───────────────────────────── */
    return { play, skip };

})();
