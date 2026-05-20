// ============================================================
// WEATHER.JS — نظام الطقس والمناخ الصحراوي والمؤثرات الجوية
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

window.WEATHER_SYSTEM = {
    currentWeather: 'clear_noon',
    turnCounter: 0,
    cycleIndex: 0,
    
    weathers: {
        'clear_sky': {
            id: 'clear_sky',
            name: "سماء صافية مباركة",
            subtitle: "سماء زرقاء نقية بلا أتربة، تمنح الفارس استقراراً تاماً",
            class: "weather-clear",
            filter: "sepia(0) saturate(1.1) hue-rotate(0deg) contrast(1.0)",
            effectText: "✨ جو صحو وهادئ، لا يوجد أي تأثيرات سلبية أو إيجابية على القدرات.",
            color: "#87CEEB"
        },
        'sandstorm': {
            id: 'sandstorm',
            name: "عاصفة السموم الهوجاء",
            subtitle: "رياح عاتية تثير الرمال وتعطل الرؤية والتركيز",
            class: "weather-sandstorm",
            filter: "sepia(0.4) saturate(0.8) hue-rotate(5deg) contrast(0.95)",
            effectText: "🎯 يقلل من دقة الهجمات والهجوم البدني بنسبة 25% ويزيد التفادي بنسبة 15%.",
            color: "#c2b280"
        },
        'heatwave': {
            id: 'heatwave',
            name: "موجة الحر اللاهبة",
            subtitle: "حرارة لا تطاق تغلي الدماء في العروق وتزيد الشراسة",
            class: "weather-heatwave",
            filter: "sepia(0.5) saturate(1.8) hue-rotate(-15deg) contrast(1.2)",
            effectText: "🔥 يزيد الهجوم بنسبة 25%، لكنه يستنزف 3% من أقصى طاقة حياة في كل جولة!",
            color: "#ff4500"
        }
    },
    
    weatherCycle: ['clear_sky', 'sandstorm', 'heatwave'],

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
        if (this.currentWeather === 'clear_sky') {
            return { healMult: 1, accuracyBonus: 0, dodgeBonus: 0, mpRegenMult: 1, atkMult: 1, hpDrainMult: 0 };
        } else if (this.currentWeather === 'sandstorm') {
            return { healMult: 1, accuracyBonus: -0.25, dodgeBonus: 0.15, mpRegenMult: 1, atkMult: 0.75, hpDrainMult: 0 };
        } else if (this.currentWeather === 'heatwave') {
            return { healMult: 1, accuracyBonus: 0, dodgeBonus: 0, mpRegenMult: 1, atkMult: 1.25, hpDrainMult: 0.03 };
        }
        return { healMult: 1, accuracyBonus: 0, dodgeBonus: 0, mpRegenMult: 1, atkMult: 1, hpDrainMult: 0 };
    },

    applyVisuals() {
        const w = this.weathers[this.currentWeather];
        
        // Remove existing weather classes
        document.body.classList.remove('weather-noon', 'weather-sandstorm', 'weather-midnight');
        document.body.classList.add(w.class);
        
        // Apply color grading filter on the viewport
        const viewport = document.getElementById('story-screen') || document.body;
        if (viewport) {
            viewport.style.filter = w.filter;
            viewport.style.transition = "filter 2.5s ease-in-out";
        }
        
        // Handle sandstorm particle overlays
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
                particles.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1.5\' fill=\'%23c2b280\' opacity=\'0.3\'/%3E%3Ccircle cx=\'70\' cy=\'40\' r=\'1\' fill=\'%23c2b280\' opacity=\'0.25\'/%3E%3Ccircle cx=\'40\' cy=\'80\' r=\'2\' fill=\'%23e28743\' opacity=\'0.2\'/%3E%3C/svg%3E") repeat';
                particles.style.animation = 'sandstormDrift 4s linear infinite';
                
                // Add keyframe animation inline if not present
                if (!document.getElementById('sandstorm-animation-styles')) {
                    const style = document.createElement('style');
                    style.id = 'sandstorm-animation-styles';
                    style.innerHTML = `
                        @keyframes sandstormDrift {
                            0% { background-position: 0px 0px; }
                            100% { background-position: 500px 200px; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(particles);
            }
            particles.style.display = 'block';
        } else {
            if (particles) {
                particles.style.display = 'none';
            }
        }
    },

    triggerWeatherTransitionAlert() {
        const w = this.weathers[this.currentWeather];
        const toast = document.createElement('div');
        toast.className = 'weather-toast';
        toast.innerHTML = `
            <div style="background:rgba(20, 20, 20, 0.95); border:2px solid ${w.color}; border-radius:12px; padding:20px; box-shadow:0 0 20px ${w.color}; text-align:center; max-width:400px; animation: weatherSlideIn 0.5s ease-out;">
                <h4 style="color:${w.color}; font-size:1.3rem; margin-bottom:5px; font-family:'Cinzel';">🏜️ تبدل طقس الصحراء والبادية</h4>
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
        const w = this.weathers[this.currentWeather];
        let widget = document.getElementById('weather-widget');
        if (!widget) {
            // Find appropriate place to mount weather status widget in the UI
            const topBar = document.querySelector('.top-bar-stats') || document.body;
            widget = document.createElement('div');
            widget.id = 'weather-widget';
            widget.style.background = 'rgba(0,0,0,0.5)';
            widget.style.border = '1px solid rgba(255,255,255,0.1)';
            widget.style.borderRadius = '6px';
            widget.style.padding = '4px 10px';
            widget.style.fontSize = '0.75rem';
            widget.style.color = '#fff';
            widget.style.display = 'inline-flex';
            widget.style.alignItems = 'center';
            widget.style.gap = '6px';
            widget.style.margin = '4px 8px';
            widget.style.cursor = 'help';
            
            topBar.appendChild(widget);
        }
        
        widget.style.borderColor = w.color;
        widget.innerHTML = `
            <span style="color:${w.color};">🏜️ ${w.name}</span>
            <small style="color:rgba(255,255,255,0.5); border-right:1px solid rgba(255,255,255,0.2); padding-right:6px; margin-right:4px;">${5 - this.turnCounter} خطوات للتبدل</small>
        `;
        widget.title = `${w.subtitle}\n\nالتأثير:\n${w.effectText}`;
    }
};
