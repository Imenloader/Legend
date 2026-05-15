// ============================================================
// AUDIO.JS — Procedural Ambient Sound Engine
// Uses Web Audio API to generate region-specific soundscapes
// No external dependencies — works entirely in-browser
// ============================================================

window.AUDIO = {
    ctx: null,
    master: null,
    activeNodes: [],
    currentRegion: null,
    muted: false,
    volume: 0.18, // Low ambient by default

    // Region audio profiles — each is a stack of oscillators + noise
    profiles: {
        crossroads: {
            label: 'Crossroads Ambient',
            drones: [
                { freq: 110,  type: 'sine',     gain: 0.06, detune: 0 },
                { freq: 220,  type: 'sine',     gain: 0.04, detune: 3 },
                { freq: 164,  type: 'triangle', gain: 0.03, detune: -2 },
                { freq: 330,  type: 'sine',     gain: 0.02, detune: 5 }
            ],
            noise: { gain: 0.01, color: 'brown' },
            lfoRate: 0.08, lfoDepth: 6,
            filterFreq: 800
        },
        jade_peak: {
            label: 'Jade Peak Heavens',
            drones: [
                { freq: 196,  type: 'sine',     gain: 0.05, detune: 0 },
                { freq: 392,  type: 'sine',     gain: 0.04, detune: 4 },
                { freq: 588,  type: 'triangle', gain: 0.025, detune: -3 },
                { freq: 784,  type: 'sine',     gain: 0.015, detune: 6 }
            ],
            noise: { gain: 0.008, color: 'white' },
            lfoRate: 0.05, lfoDepth: 8,
            filterFreq: 1800
        },
        empty_quarter: {
            label: 'Empty Quarter Desert',
            drones: [
                { freq: 82,   type: 'sine',     gain: 0.07, detune: 0 },
                { freq: 123,  type: 'sine',     gain: 0.05, detune: -4 },
                { freq: 164,  type: 'triangle', gain: 0.03, detune: 2 },
                { freq: 246,  type: 'sawtooth', gain: 0.01, detune: 0 }
            ],
            noise: { gain: 0.015, color: 'brown' },
            lfoRate: 0.04, lfoDepth: 12,
            filterFreq: 400
        },
        abyssal_sea: {
            label: 'Abyssal Sea of Qi',
            drones: [
                { freq: 55,   type: 'sine',     gain: 0.08, detune: 0 },
                { freq: 110,  type: 'sine',     gain: 0.05, detune: 5 },
                { freq: 165,  type: 'triangle', gain: 0.03, detune: -3 },
                { freq: 220,  type: 'sine',     gain: 0.02, detune: 7 }
            ],
            noise: { gain: 0.02, color: 'brown' },
            lfoRate: 0.15, lfoDepth: 20, // Slow wave oscillation
            filterFreq: 350
        },
        brass_city: {
            label: 'Brass City of Irem',
            drones: [
                { freq: 138,  type: 'sawtooth', gain: 0.04, detune: 0 },
                { freq: 207,  type: 'square',   gain: 0.02, detune: -2 },
                { freq: 276,  type: 'sawtooth', gain: 0.025, detune: 4 },
                { freq: 414,  type: 'triangle', gain: 0.015, detune: -5 }
            ],
            noise: { gain: 0.01, color: 'pink' },
            lfoRate: 0.06, lfoDepth: 5,
            filterFreq: 600
        },
        celestial_court: {
            label: 'Celestial Court',
            drones: [
                { freq: 256,  type: 'sine',     gain: 0.06, detune: 0 },
                { freq: 384,  type: 'sine',     gain: 0.05, detune: 2 },
                { freq: 512,  type: 'sine',     gain: 0.04, detune: -1 },
                { freq: 640,  type: 'triangle', gain: 0.03, detune: 3 },
                { freq: 768,  type: 'sine',     gain: 0.02, detune: 5 }
            ],
            noise: { gain: 0.005, color: 'white' },
            lfoRate: 0.03, lfoDepth: 4,
            filterFreq: 2400
        }
    },

    // ── INIT ──
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
            this.master.connect(this.ctx.destination);
            return true;
        } catch (e) {
            console.warn('Web Audio API not available:', e);
            return false;
        }
    },

    // Resume context (required after user interaction on some browsers)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    // ── NOISE GENERATOR ──
    createNoise(color = 'brown') {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (color === 'brown') {
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            } else if (color === 'pink') {
                // Simple pink approximation
                data[i] = white * 0.5 + (i > 0 ? data[i-1] * 0.5 : 0);
            } else {
                data[i] = white; // White noise
            }
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
    },

    // ── PLAY REGION AMBIENT ──
    playRegion(regionId) {
        if (!this.ctx) { if (!this.init()) return; }
        this.resume();

        if (this.currentRegion === regionId) return; // Already playing
        this.stopAll(0.8); // Fade out current

        const profile = this.profiles[regionId] || this.profiles['crossroads'];
        this.currentRegion = regionId;

        const startTime = this.ctx.currentTime + 0.9; // Start after fade-out

        // ── Create LFO for subtle movement ──
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = profile.lfoRate;
        lfoGain.gain.value = profile.lfoDepth;
        lfo.connect(lfoGain);
        lfo.start(startTime);
        this.activeNodes.push(lfo, lfoGain);

        // ── Create low-pass filter ──
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = profile.filterFreq;
        filter.Q.value = 1.2;
        filter.connect(this.master);
        this.activeNodes.push(filter);

        // ── Create drones ──
        profile.drones.forEach(d => {
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();

            osc.type = d.type;
            osc.frequency.value = d.freq;
            osc.detune.value = d.detune;
            oscGain.gain.setValueAtTime(0, startTime);
            oscGain.gain.linearRampToValueAtTime(d.gain, startTime + 2); // Fade in

            // LFO modulates frequency slightly
            lfoGain.connect(osc.frequency);

            osc.connect(oscGain);
            oscGain.connect(filter);
            osc.start(startTime);
            this.activeNodes.push(osc, oscGain);
        });

        // ── Create noise layer ──
        if (profile.noise) {
            const noise = this.createNoise(profile.noise.color);
            const noiseGain = this.ctx.createGain();
            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = profile.filterFreq * 0.5;

            noiseGain.gain.setValueAtTime(0, startTime);
            noiseGain.gain.linearRampToValueAtTime(profile.noise.gain, startTime + 3);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(filter);
            noise.start(startTime);
            this.activeNodes.push(noise, noiseGain, noiseFilter);
        }
    },

    // ── STOP ALL ──
    stopAll(fadeTime = 0.5) {
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.activeNodes.forEach(node => {
            try {
                if (node.gain) {
                    node.gain.linearRampToValueAtTime(0, now + fadeTime);
                }
                if (node.stop) {
                    node.stop(now + fadeTime + 0.1);
                }
            } catch(e) {}
        });
        setTimeout(() => { this.activeNodes = []; }, (fadeTime + 0.2) * 1000);
        this.currentRegion = null;
    },

    // ── TOGGLE MUTE ──
    toggleMute() {
        this.muted = !this.muted;
        if (this.ctx && this.master) {
            this.master.gain.linearRampToValueAtTime(
                this.muted ? 0 : this.volume,
                this.ctx.currentTime + 0.3
            );
        }
        return this.muted;
    },

    // ── SET VOLUME ──
    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (!this.muted && this.ctx && this.master) {
            this.master.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.2);
        }
    },

    // ── SOUND EFFECTS ──
    playEffect(type) {
        if (!this.ctx || this.muted) return;
        this.resume();
        const now = this.ctx.currentTime;

        const fx = {
            combat_hit: () => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
                g.gain.setValueAtTime(0.3, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.connect(g); g.connect(this.ctx.destination);
                osc.start(now); osc.stop(now + 0.25);
            },
            combat_block: () => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(g); g.connect(this.ctx.destination);
                osc.start(now); osc.stop(now + 0.2);
            },
            level_up: () => {
                [523, 659, 784, 1047].forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = f;
                    g.gain.setValueAtTime(0, now + i*0.1);
                    g.gain.linearRampToValueAtTime(0.2, now + i*0.1 + 0.05);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.35);
                    osc.connect(g); g.connect(this.ctx.destination);
                    osc.start(now + i*0.1); osc.stop(now + i*0.1 + 0.4);
                });
            },
            loot_mythic: () => {
                [440, 554, 659, 880, 1108].forEach((f, i) => {
                    const osc = this.ctx.createOscillator();
                    const g = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = f;
                    g.gain.setValueAtTime(0, now + i*0.08);
                    g.gain.linearRampToValueAtTime(0.15, now + i*0.08 + 0.04);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i*0.08 + 0.5);
                    osc.connect(g); g.connect(this.ctx.destination);
                    osc.start(now + i*0.08); osc.stop(now + i*0.08 + 0.55);
                });
            },
            story_beat: () => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(330, now + 0.6);
                g.gain.setValueAtTime(0.15, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                osc.connect(g); g.connect(this.ctx.destination);
                osc.start(now); osc.stop(now + 1.3);
            },
            menu_click: () => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = 660;
                g.gain.setValueAtTime(0.08, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.connect(g); g.connect(this.ctx.destination);
                osc.start(now); osc.stop(now + 0.12);
            }
        };

        if (fx[type]) fx[type]();
    }
};
