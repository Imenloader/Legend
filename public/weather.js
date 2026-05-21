// ============================================================
// WEATHER.JS — نظام الطقس والمناخ الصحراوي والمؤثرات الجوية
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.WEATHER_SYSTEM = {
    currentWeather: 'clear_sky',
    turnCounter: 0,
    cycleIndex: 0,
    
    weathers: {
        'clear_sky': {
            id: 'clear_sky',
            name: "سماء صافية مباركة",
            subtitle: "سماء زرقاء نقية بلا أتربة، تمنح الفارس استقراراً باطنياً تاماً",
            class: "weather-clear-active",
            filter: "sepia(0) saturate(1.1) hue-rotate(0deg) contrast(1.0)",
            effectText: "✨ جو صحو وهادئ، لا يوجد أي تأثيرات سلبية أو إيجابية على القدرات.",
            color: "#87CEEB"
        },
        'sandstorm': {
            id: 'sandstorm',
            name: "عاصفة السموم الهوجاء",
            subtitle: "رياح عاتية تثير الرمال الذهبية وتعطل الرؤية وتشتت تركيز الهجوم",
            class: "weather-sandstorm-active",
            filter: "sepia(0.4) saturate(0.8) hue-rotate(5deg) contrast(0.95)",
            effectText: "🎯 يقلل من دقة الهجمات والهجوم البدني بنسبة 25% ويزيد التفادي بنسبة 15%.",
            color: "#d4af37"
        },
        'heatwave': {
            id: 'heatwave',
            name: "موجة الحر اللاهبة",
            subtitle: "حرارة حارقة تغلي الدماء في العروق، تزيد الشراسة وتذيب طاقة الحياة",
            class: "weather-heatwave-active",
            filter: "sepia(0.5) saturate(1.8) hue-rotate(-15deg) contrast(1.2)",
            effectText: "🔥 يزيد الهجوم بنسبة 25%، لكنه يستنزف 3% من أقصى طاقة حياة في كل جولة!",
            color: "#ff4500"
        },
        'spiritual_mist': {
            id: 'spiritual_mist',
            name: "ضباب الأثير النوراني",
            subtitle: "ضباب أرجواني ميتافيزيقي كثيف يشحن الهالات الروحية وينشط التشي الباطني",
            class: "weather-mist-active",
            filter: "sepia(0.2) saturate(1.3) hue-rotate(60deg) contrast(1.05)",
            effectText: "🔮 يضاعف استرجاع التركيز (MP) بالمعركة بنسبة 100%، ويزيد ضرر مهارات الخلود بنسبة 25%، ويقلل تفادي الأعداء بـ 10%!",
            color: "#9b59b6"
        },
        'eclipse': {
            id: 'eclipse',
            name: "خسوف العقاب المظلم",
            subtitle: "حجب كلي لنور الشمس وهالة سماوية حمراء مرعبة تفتح أبواب القوى الباطنية الفتاكة",
            class: "weather-eclipse-active",
            filter: "brightness(0.65) contrast(1.2) saturate(0.8) hue-rotate(-20deg)",
            effectText: "🌙 تزيد الأضرار الحرجة بنسبة 30%، وتخترق الضربات 20% من دفاع الأعداء، لكن تزيد تكلفة مهارات البدن بمقدار 20% تركيز!",
            color: "#ff4d4d"
        }
    },
    
    weatherCycle: ['clear_sky', 'sandstorm', 'heatwave', 'spiritual_mist', 'eclipse'],

    init(state) {
        if (!state.environment) {
            state.environment = {
                weather: 'clear_sky',
                turnCounter: 0,
                cycleIndex: 0
            };
        }
        this.currentWeather = state.environment.weather || 'clear_sky';
        this.turnCounter = state.environment.turnCounter || 0;
        this.cycleIndex = state.environment.cycleIndex || 0;
        this.applyVisuals();
        this.renderWeatherWidget();
    },

    advanceTurns(state, turns = 1) {
        if (!state.environment) this.init(state);
        
        state.environment.turnCounter += turns;
        this.turnCounter = state.environment.turnCounter;

        if (state.environment.turnCounter >= 5) {
            state.environment.turnCounter = 0;
            state.environment.cycleIndex = (state.environment.cycleIndex + 1) % this.weatherCycle.length;
            state.environment.weather = this.weatherCycle[state.environment.cycleIndex];
            
            this.currentWeather = state.environment.weather;
            this.cycleIndex = state.environment.cycleIndex;
            this.turnCounter = 0;
            
            this.applyVisuals();
            this.triggerWeatherTransitionAlert();
        }
        this.renderWeatherWidget();
    },

    getModifiers() {
        const defaultMods = { healMult: 1, accuracyBonus: 0, dodgeBonus: 0, mpRegenMult: 1, atkMult: 1, hpDrainMult: 0, critDamageMult: 0, skillCostMult: 1 };
        if (this.currentWeather === 'clear_sky') {
            return { ...defaultMods };
        } else if (this.currentWeather === 'sandstorm') {
            return { ...defaultMods, accuracyBonus: -0.25, dodgeBonus: 0.15, atkMult: 0.75 };
        } else if (this.currentWeather === 'heatwave') {
            return { ...defaultMods, atkMult: 1.25, hpDrainMult: 0.03 };
        } else if (this.currentWeather === 'spiritual_mist') {
            return { ...defaultMods, healMult: 1.30, dodgeBonus: -0.10, mpRegenMult: 2, atkMult: 1.25 };
        } else if (this.currentWeather === 'eclipse') {
            return { ...defaultMods, critDamageMult: 0.30, skillCostMult: 1.20 };
        }
        return defaultMods;
    },

    applyVisuals() {
        const w = this.weathers[this.currentWeather] || this.weathers['clear_sky'];
        
        // Remove existing weather body classes
        document.body.classList.remove(
            'weather-clear-active',
            'weather-sandstorm-active',
            'weather-heatwave-active',
            'weather-mist-active',
            'weather-eclipse-active'
        );
        document.body.classList.add(w.class);
        
        // Apply color grading filter on the viewport
        const viewport = document.getElementById('story-screen') || document.body;
        if (viewport) {
            viewport.style.filter = w.filter;
            viewport.style.transition = "filter 2.5s ease-in-out";
        }
        
        // Handle Sandstorm Particles
        let particles = document.getElementById('weather-particles-overlay');
        if (this.currentWeather === 'sandstorm') {
            if (!particles) {
                particles = document.createElement('div');
                particles.id = 'weather-particles-overlay';
                particles.style.position = 'fixed';
                particles.style.top = '0';
                particles.style.left = '0';
                particles.style.width = '100vw';
                particles.style.height = '100vh';
                particles.style.pointerEvents = 'none';
                particles.style.zIndex = '9';
                particles.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1.5\' fill=\'%23c2b280\' opacity=\'0.3\'/%3E%3Ccircle cx=\'70\' cy=\'40\' r=\'1\' fill=\'%23c2b280\' opacity=\'0.25\'/%3E%3Ccircle cx=\'40\' cy=\'80\' r=\'2\' fill=\'%23e28743\' opacity=\'0.25\'/%3E%3Ccircle cx=\'90\' cy=\'90\' r=\'1.8\' fill=\'%23d4af37\' opacity=\'0.2\'/%3E%3C/svg%3E") repeat';
                particles.style.animation = 'sandstormDrift 3.5s linear infinite';
                
                if (!document.getElementById('sandstorm-animation-styles')) {
                    const style = document.createElement('style');
                    style.id = 'sandstorm-animation-styles';
                    style.innerHTML = `
                        @keyframes sandstormDrift {
                            0% { background-position: 0px 0px; }
                            100% { background-position: 500px 300px; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                document.body.appendChild(particles);
            }
            particles.style.display = 'block';
        } else {
            if (particles) particles.style.display = 'none';
        }

        // Handle Spiritual Mist Overlay
        let fog = document.getElementById('weather-fog-overlay');
        if (this.currentWeather === 'spiritual_mist') {
            if (!fog) {
                fog = document.createElement('div');
                fog.id = 'weather-fog-overlay';
                document.body.appendChild(fog);
            }
            fog.style.display = 'block';
        } else {
            if (fog) fog.style.display = 'none';
        }

        // Handle Eclipse Shadow Overlay
        let eclipse = document.getElementById('weather-eclipse-overlay');
        if (this.currentWeather === 'eclipse') {
            if (!eclipse) {
                eclipse = document.createElement('div');
                eclipse.id = 'weather-eclipse-overlay';
                document.body.appendChild(eclipse);
            }
            eclipse.style.display = 'block';
        } else {
            if (eclipse) eclipse.style.display = 'none';
        }
    },

    triggerWeatherTransitionAlert() {
        const w = this.weathers[this.currentWeather] || this.weathers['clear_sky'];
        const toast = document.createElement('div');
        toast.className = 'weather-toast';
        toast.innerHTML = `
            <div style="background:rgba(20, 20, 20, 0.95); border:2px solid ${w.color}; border-radius:12px; padding:20px; box-shadow:0 0 20px ${w.color}; text-align:center; max-width:400px; animation: weatherSlideIn 0.5s ease-out;">
                <h4 style="color:${w.color}; font-size:1.3rem; margin-bottom:5px; font-family:'Cairo';">🏜️ تبدل طقس الصحراء والبادية</h4>
                <b style="font-size:1.1rem; color:var(--text);">${w.name}</b>
                <p style="font-size:0.85rem; color:var(--text-dim); margin:8px 0 12px;">${w.subtitle}</p>
                <div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; border:1px dashed rgba(255,255,255,0.1); font-size:0.8rem; color:${w.color}; font-weight:bold;">
                    ${w.effectText}
                </div>
            </div>
        `;
        
        toast.style.position = 'fixed';
        toast.style.top = '15%';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.zIndex = '9999';
        toast.style.pointerEvents = 'none';
        
        if (!document.getElementById('weather-slidein-styles')) {
            const style = document.createElement('style');
            style.id = 'weather-slidein-styles';
            style.innerHTML = `
                @keyframes weatherSlideIn {
                    0% { transform: scale(0.7); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Play gust or chime sound
        if (window.AUDIO) {
            window.AUDIO.playEffect('menu_click');
        }
        
        setTimeout(() => {
            toast.style.transition = "opacity 1s ease-out";
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 1000);
        }, 4000);
    },

    renderWeatherWidget() {
        const w = this.weathers[this.currentWeather] || this.weathers['clear_sky'];
        let widget = document.getElementById('weather-widget');
        if (!widget) {
            const gameContainer = document.getElementById('game-container') || document.body;
            widget = document.createElement('div');
            widget.id = 'weather-widget';
            gameContainer.appendChild(widget);
        }
        
        widget.style.borderColor = w.color;
        widget.innerHTML = `
            <span style="color:${w.color}; font-weight:bold; display:flex; align-items:center; gap:5px;">
                ${this.currentWeather === 'clear_sky' ? '☀️' : this.currentWeather === 'sandstorm' ? '💨' : this.currentWeather === 'heatwave' ? '🔥' : this.currentWeather === 'spiritual_mist' ? '🔮' : '🌙'} ${w.name}
            </span>
            <small style="color:rgba(255,255,255,0.6); border-right:1px solid rgba(255,255,255,0.25); padding-right:8px; margin-right:4px;">${5 - this.turnCounter} خطوات للتبدل</small>
        `;
        widget.title = `${w.subtitle}\n\nالتأثير:\n${w.effectText}`;
    }
};
