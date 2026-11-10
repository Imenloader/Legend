// ============================================================
// COMBAT_VISUALS.JS — Canvas Particle Effect Battle Overlay
// "أساطير الشرق الساحر: مصفوفة الأنوار والجسيمات القتالية"
// ============================================================

window.COMBAT_VISUALS = {
    canvas: null,
    ctx: null,
    particles: [],
    slashes: [],
    floats: [],
    ripples: [],
    active: false,

    init() {
        this.canvas = document.getElementById('combat-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'combat-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.inset = '0';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '2000';
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        if (!this.active) {
            this.active = true;
            this.loop();
        }
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    // ── SPARKLES & SHARDS ──
    spawnExplosion(x, y, color = '#ffd700', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (Math.random() * 2), // upward bias
                alpha: 1.0,
                color: color,
                size: 2 + Math.random() * 4,
                gravity: 0.15,
                decay: 0.015 + Math.random() * 0.02
            });
        }
    },

    // ── SWORD SLASHES ──
    spawnSlash(x1, y1, x2, y2, color = '#ff4d4d') {
        this.slashes.push({
            x1, y1, x2, y2,
            progress: 0,
            color: color,
            width: 4 + Math.random() * 3,
            alpha: 1.0,
            sparkTimer: 0
        });
        
        // Spawn initial spark spray at start point
        this.spawnExplosion(x1, y1, color, 8);
    },

    // ── CUSTOM FLOATING TEXT ──
    spawnFloat(text, x, y, color = '#ffd700', size = 24, type = 'normal') {
        this.floats.push({
            text, x, y, color, size, type,
            vx: type === 'crit' ? (Math.random() * 4 - 2) : 0,
            vy: type === 'crit' ? -8 : -3,
            alpha: 1.0,
            scale: type === 'crit' ? 1.8 : 1.0,
            age: 0,
            bounce: type === 'crit' ? 15 : 0
        });
    },

    // ── SHOCKWAVE RIPPLES ──
    spawnRipple(x, y, color = 'rgba(212,175,55,0.4)') {
        this.ripples.push({
            x, y,
            radius: 10,
            maxRadius: 80 + Math.random() * 40,
            color: color,
            width: 3,
            alpha: 1.0,
            decay: 0.02
        });
    },

    // ── STANCE SPECIFIC AURA VORTEX ──
    spawnStanceVortex(x, y, stance) {
        let color = '#00ffcc'; // Water default
        if (stance === 'mountain') color = '#d4af37';
        if (stance === 'wind') color = '#ff4d4d';

        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 40;
            this.particles.push({
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                vx: -Math.sin(angle) * (1.5 + Math.random() * 1.5), // Orbital spin
                vy: Math.cos(angle) * (1.5 + Math.random() * 1.5) - 0.5,
                alpha: 0.8,
                color: color,
                size: 3 + Math.random() * 3,
                gravity: -0.05, // Float up slowly
                decay: 0.02 + Math.random() * 0.02
            });
        }
    },

    // ── SHOCKWAVE HIT SHAKE ──
    triggerScreenShake() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => {
            s.style.transition = 'transform 0.05s';
            let count = 0;
            const shake = setInterval(() => {
                const dx = (Math.random() * 12 - 6);
                const dy = (Math.random() * 12 - 6);
                s.style.transform = `translate(${dx}px, ${dy}px)`;
                count++;
                if (count > 6) {
                    clearInterval(shake);
                    s.style.transform = '';
                    s.style.transition = '';
                }
            }, 30);
        });
    },

    // ── EFFECTS ANIMATION LOOP ──
    loop() {
        if (!this.active) return;
        requestAnimationFrame(() => this.loop());

        const ctx = this.ctx;
        if (!ctx) return;

        // Clear canvas with full transparency
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // ── 1. Render & Update Slashes ──
        for (let i = this.slashes.length - 1; i >= 0; i--) {
            const s = this.slashes[i];
            s.progress += 0.12;
            s.alpha -= 0.04;

            if (s.alpha <= 0 || s.progress >= 1.0) {
                // Spawn final spark spray at endpoint
                this.spawnExplosion(s.x2, s.y2, s.color, 8);
                this.slashes.splice(i, 1);
                continue;
            }

            const cx = s.x1 + (s.x2 - s.x1) * s.progress;
            const cy = s.y1 + (s.y2 - s.y1) * s.progress;

            // Draw glowing slash line
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = s.color;
            ctx.strokeStyle = s.color;
            ctx.lineWidth = s.width * s.alpha;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.restore();

            // Emit sparks along the slash path
            if (Math.random() < 0.4) {
                this.particles.push({
                    x: cx,
                    y: cy,
                    vx: (Math.random() * 4 - 2),
                    vy: (Math.random() * 4 - 2),
                    alpha: 1.0,
                    color: s.color,
                    size: 2 + Math.random() * 2,
                    gravity: 0.1,
                    decay: 0.03
                });
            }
        }

        // ── 2. Render & Update Ripples ──
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += (r.maxRadius - r.radius) * 0.15;
            r.alpha -= r.decay;

            if (r.alpha <= 0) {
                this.ripples.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.width * r.alpha;
            ctx.globalAlpha = r.alpha;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // ── 3. Render & Update Particles ──
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            
            // Draw soft glowing particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ── 4. Render & Update Bouncy Floating Text ──
        for (let i = this.floats.length - 1; i >= 0; i--) {
            const f = this.floats[i];
            f.x += f.vx;
            f.y += f.vy;
            
            if (f.type === 'crit') {
                // Apply drag & gravity bounce feel
                f.vx *= 0.95;
                f.vy += 0.4;
                if (f.bounce > 0 && f.vy > 0) {
                    f.vy = -f.bounce * 0.5;
                    f.bounce *= 0.5;
                }
            } else {
                f.vy *= 0.96; // Drift upward slowly
            }

            f.alpha -= 0.015;

            if (f.alpha <= 0) {
                this.floats.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = f.alpha;
            ctx.fillStyle = f.color;
            ctx.font = `bold ${f.size * f.scale}px 'El Messiri', serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add text shadow glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = f.color;

            ctx.fillText(f.text, f.x, f.y);
            ctx.restore();
        }
    }
};
