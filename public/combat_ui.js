// combat_ui.js – Visual effects layer for combat
// Canvas-based particles, health bar animations, screen shake — no external deps

(function () {
    // ── Canvas overlay ──────────────────────────────────────────
    let canvas, ctx;
    let particles = [];
    let rafId = null;
    let shakeTimeout = null;

    function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'combat-fx-canvas';
        Object.assign(canvas.style, {
            position: 'fixed', inset: '0', width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: '9999'
        });
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        loop();
    }

    function resize() {
        if (!canvas) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // ── Particle engine ─────────────────────────────────────────
    function loop() {
        rafId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => {
            p.x += p.vx; p.y += p.vy;
            p.vy += p.gravity || 0;
            p.life -= p.decay;
            p.vx *= p.drag || 0.97;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.glow || p.color;
            ctx.shadowBlur = p.blur || 8;
            ctx.beginPath();
            if (p.shape === 'star') drawStar(ctx, p.x, p.y, p.size);
            else if (p.shape === 'slash') drawSlash(ctx, p.x, p.y, p.size, p.angle || 0);
            else ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return p.life > 0;
        });
    }

    function drawStar(c, x, y, r) {
        c.moveTo(x, y - r);
        for (let i = 0; i < 5; i++) {
            c.lineTo(x + r * Math.sin((i * 4 * Math.PI) / 5), y - r * Math.cos((i * 4 * Math.PI) / 5));
        }
        c.closePath();
    }

    function drawSlash(c, x, y, r, angle) {
        c.translate(x, y);
        c.rotate(angle);
        c.ellipse(0, 0, r * 2, r * 0.3, 0, 0, Math.PI * 2);
        c.rotate(-angle);
        c.translate(-x, -y);
    }

    function spawnParticles(x, y, count, opts) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = opts.speed * (0.5 + Math.random());
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: opts.size * (0.5 + Math.random() * 0.5),
                color: Array.isArray(opts.color) ? opts.color[Math.floor(Math.random()*opts.color.length)] : opts.color,
                glow: opts.glow,
                blur: opts.blur || 10,
                gravity: opts.gravity || 0.05,
                drag: opts.drag || 0.97,
                life: 1,
                decay: opts.decay || 0.022,
                shape: opts.shape || 'circle',
                angle: angle // for slashes
            });
        }
    }

    // ── Target position resolver ────────────────────────────────
    function getTargetPos(target) {
        const sel = target === 'enemy' ? '#story-enemy-hp-bar' : '#story-hp-bar';
        const el  = document.querySelector(sel);
        if (el) {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        return { x: canvas.width * (target === 'enemy' ? 0.75 : 0.25), y: canvas.height * 0.35 };
    }

    // ── Screen shake ────────────────────────────────────────────
    function shakeScreen(intensity, duration) {
        const container = document.getElementById('game-container') || document.body;
        if (shakeTimeout) clearTimeout(shakeTimeout);
        container.style.transition = 'none';
        let start = null;
        function step(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            if (elapsed < duration) {
                const power = intensity * (1 - elapsed / duration);
                const dx = (Math.random() - 0.5) * power * 2;
                const dy = (Math.random() - 0.5) * power * 2;
                container.style.transform = `translate(${dx}px,${dy}px)`;
                requestAnimationFrame(step);
            } else {
                container.style.transform = '';
            }
        }
        requestAnimationFrame(step);
    }

    // ── Flash overlay ───────────────────────────────────────────
    function flashScreen(color, duration) {
        const flash = document.createElement('div');
        Object.assign(flash.style, {
            position: 'fixed', inset: '0', background: color,
            pointerEvents: 'none', zIndex: '9998', opacity: '0.35',
            transition: `opacity ${duration}ms ease-out`
        });
        document.body.appendChild(flash);
        requestAnimationFrame(() => { flash.style.opacity = '0'; });
        setTimeout(() => flash.remove(), duration + 50);
    }

    // ── HP bar animate ──────────────────────────────────────────
    function pulseBar(selector, color) {
        const el = document.querySelector(selector);
        if (!el) return;
        const orig = el.style.boxShadow;
        el.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
        el.style.transition = 'box-shadow 0.1s';
        setTimeout(() => { el.style.boxShadow = orig; }, 350);
    }

    // ── Effect presets ──────────────────────────────────────────
    const EFFECTS = {
        crit: ({ x, y }) => {
            shakeScreen(8, 300);
            flashScreen('rgba(255,215,0,0.4)', 300);
            spawnParticles(x, y, 60, { speed:6, size:5, color:['#ffd700','#ffcc00','#fff8dc','#ff8c00'], glow:'#ffd700', blur:15, decay:0.018, shape:'star' });
            spawnParticles(x, y, 30, { speed:3, size:3, color:'#ffffff', glow:'#ffd700', blur:8, decay:0.025, gravity:0.08 });
        },
        execution: ({ x, y }) => {
            shakeScreen(15, 500);
            flashScreen('rgba(255,100,0,0.5)', 400);
            spawnParticles(x, y, 100, { speed:10, size:7, color:['#ff4500','#ff6347','#ffd700','#ff0000'], glow:'#ff4500', blur:20, decay:0.015, gravity:0.1 });
        },
        guard_break: ({ x, y }) => {
            shakeScreen(12, 400);
            flashScreen('rgba(255,77,77,0.45)', 350);
            spawnParticles(x, y, 50, { speed:5, size:4, color:['#ff4d4d','#8a1c1c','#fff'], glow:'#ff4d4d', blur:12, decay:0.02 });
        },
        poison: ({ x, y }) => {
            spawnParticles(x, y, 40, { speed:2, size:4, color:['#2ecc71','#00ff7f','#90ee90'], glow:'#2ecc71', blur:8, gravity:-0.02, decay:0.018 });
        },
        sword_intent: ({ x, y }) => {
            shakeScreen(6, 250);
            flashScreen('rgba(255,215,0,0.3)', 250);
            spawnParticles(x, y, 80, { speed:9, size:5, color:['#ffd700','#fff','#ffe066'], glow:'#ffd700', blur:18, decay:0.016, shape:'star' });
        },
        fear: ({ x, y }) => {
            spawnParticles(x, y, 30, { speed:2, size:5, color:['#9b59b6','#bf5fff','#6c3483'], glow:'#9b59b6', blur:12, gravity:-0.03, decay:0.02 });
        },
        heal: ({ x, y }) => {
            spawnParticles(x, y, 50, { speed:2, size:4, color:['#00ffcc','#00e5a0','#7fffaa'], glow:'#00ffcc', blur:10, gravity:-0.06, decay:0.016 });
            pulseBar('#story-hp-bar', '#00ffcc');
        },
        magic: ({ x, y }) => {
            spawnParticles(x, y, 55, { speed:4, size:4, color:['#00ced1','#1e90ff','#7b68ee','#bf5fff'], glow:'#7b68ee', blur:14, decay:0.02 });
        },
        fire: ({ x, y }) => {
            shakeScreen(5, 200);
            spawnParticles(x, y, 60, { speed:4, size:5, color:['#ff4500','#ff6347','#ffa500','#ffd700'], glow:'#ff4500', blur:16, gravity:-0.04, decay:0.018 });
        },
        stun: ({ x, y }) => {
            spawnParticles(x, y, 35, { speed:2, size:6, color:['#ffd700','#ffff00','#ffffff'], glow:'#ffff00', blur:12, gravity:-0.02, decay:0.02, shape:'star' });
        },
        hit: ({ x, y }) => {
            shakeScreen(4, 150);
            spawnParticles(x, y, 20, { speed:4, size:3, color:['#ff4d4d','#fff','#ffcccb'], glow:'#ff4d4d', blur:8, decay:0.03 });
        },
        slash: ({ x, y }) => {
            shakeScreen(6, 200);
            flashScreen('rgba(255,255,255,0.2)', 150);
            spawnParticles(x, y, 15, { speed:8, size:12, color:['#fff','#ccc'], glow:'#fff', blur:15, decay:0.04, shape:'slash' });
            spawnParticles(x, y, 30, { speed:5, size:4, color:['#ffcc00','#fff'], glow:'#ffcc00', blur:10, decay:0.03 });
        },
        magic_burst: ({ x, y }) => {
            shakeScreen(8, 300);
            flashScreen('rgba(123,104,238,0.4)', 250);
            spawnParticles(x, y, 80, { speed:6, size:6, color:['#7b68ee','#00ced1','#bf5fff','#fff'], glow:'#7b68ee', blur:20, decay:0.02, shape:'star' });
            spawnParticles(x, y, 40, { speed:2, size:8, color:['#00ced1','#fff'], glow:'#00ced1', blur:15, decay:0.015 });
        }
    };

    // ── Floating damage numbers ──────────────────────────────────
    function showFloatingNumber(value, target, color) {
        const pos = getTargetPos(target);
        const el = document.createElement('div');
        const sign = value > 0 ? '+' : '';
        const dx = (Math.random() - 0.5) * 100;
        const dy = -(Math.random() * 50 + 50);
        
        Object.assign(el.style, {
            position: 'fixed',
            left: `${pos.x - 20}px`,
            top: `${pos.y - 20}px`,
            color: color || (value < 0 ? '#ff4d4d' : '#ffd700'),
            fontFamily: "'El Messiri', serif",
            fontSize: `${Math.min(3.5, 1.5 + Math.abs(value)/50)}rem`,
            fontWeight: '900',
            textShadow: `0 0 15px ${color || '#ffd700'}, 0 0 5px #000`,
            pointerEvents: 'none',
            zIndex: '10000',
            transition: 'transform 1.1s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.1s ease-in',
            opacity: '1',
            transform: 'translate(0, 0) scale(0.5)'
        });
        el.textContent = `${sign}${value}`;
        document.body.appendChild(el);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transform = `translate(${dx}px, ${dy}px) scale(1.2)`;
                el.style.opacity = '0';
            });
        });
        setTimeout(() => el.remove(), 1100);
    }

    // ── HP bar flash on damage ───────────────────────────────────
    function animateHpBar(selector, newPct, color) {
        const bar = document.querySelector(selector);
        if (!bar) return;
        bar.style.transition = 'width 0.4s ease-out, box-shadow 0.2s';
        bar.style.width = `${Math.max(0, Math.min(100, newPct))}%`;
        bar.style.boxShadow = `0 0 12px ${color}`;
        setTimeout(() => { bar.style.boxShadow = ''; }, 500);
    }

    // ── Public API ───────────────────────────────────────────────
    window.COMBAT_UI = {
        playEffect(effectName, target) {
            ensureCanvas();
            const pos = getTargetPos(target || 'enemy');
            const fn = EFFECTS[effectName] || EFFECTS.hit;
            fn(pos);
        },

        showDamage(amount, target) {
            showFloatingNumber(-amount, target, '#ff4d4d');
        },

        showHeal(amount, target) {
            ensureCanvas();
            const pos = getTargetPos(target || 'player');
            EFFECTS.heal(pos);
            showFloatingNumber(+amount, target || 'player', '#00ffcc');
        },

        animateHpLoss(selector, newPct) {
            animateHpBar(selector, newPct, '#ff4d4d');
        },

        animateHpGain(selector, newPct) {
            animateHpBar(selector, newPct, '#00ffcc');
        },

        shakeScreen,
        flashScreen,

        // Call at combat start
        init() { ensureCanvas(); },

        // Call at combat end to clean up
        destroy() {
            if (canvas) { canvas.remove(); canvas = null; ctx = null; }
            if (rafId)  { cancelAnimationFrame(rafId); rafId = null; }
            particles = [];
        }
    };
})();
