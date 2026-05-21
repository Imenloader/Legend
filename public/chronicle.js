// ============================================================
// CHRONICLE.JS — سجل ذكريات البطل وتواريخ الملحمة البدنية
// "ملحمة الشرق الساحر: مخطوطة الخلود والأساطير الشرقية"
// ============================================================

function highlightTabForCurrentScreen() {
    if (window.state && typeof window.highlightMobileTab === 'function') {
        const screen = window.state.screen;
        if (screen === 'story-screen' || screen === 'hub-screen') {
            window.highlightMobileTab(0);
        } else if (screen === 'map-screen') {
            window.highlightMobileTab(1);
        } else if (screen === 'inventory-screen') {
            window.highlightMobileTab(2);
        } else if (screen === 'cultivation-screen') {
            window.highlightMobileTab(3);
        }
    }
}

window.toggleChronicleModal = function() {
    const modal = document.getElementById('chronicle-modal');
    if (!modal) return;
    
    const active = modal.classList.toggle('active');
    
    // Play transition chime if possible
    if (active && window.AUDIO) {
        window.AUDIO.playEffect('menu_click');
    }
    
    // Auto-update contents if opening
    if (active && window.state) {
        window.updateChronicleUI(window.state);
    } else {
        highlightTabForCurrentScreen();
    }
};

// Robust flag checking that supports both objects (true/false) and arrays (includes) formats
function hasChronicleFlag(state, flag) {
    if (!state || !state.storyFlags) return false;
    if (Array.isArray(state.storyFlags)) {
        return state.storyFlags.includes(flag);
    }
    return !!state.storyFlags[flag];
}

window.updateChronicleUI = function(state) {
    if (!state) return;
    
    // 1. Update Karma Slider pointer
    const pointer = document.getElementById('chronicle-karma-pointer');
    if (pointer) {
        const karma = state.player.karma || 0;
        // Map -100 to 100 onto 0% to 100%
        const pct = Math.max(0, Math.min(100, ((karma + 100) / 2)));
        pointer.style.left = `${pct}%`;
    }
    
    // 2. Update Ending Projections based on Alignment
    const projectionBox = document.getElementById('ending-projection-box');
    if (projectionBox) {
        const karma = state.player.karma || 0;
        if (karma >= 60) {
            projectionBox.innerHTML = `
                <span style="color:var(--jade); font-weight:bold; font-size:1rem; display:block; margin-bottom:5px;">☀️ طريق الولاية والصفاء النوراني</span>
                أفعالك الخيرة والنورانية بتتردد في جبال الطور وجوف الصحراء. إنت ماشي في طريق الهداية والنور، وقريب جداً من <b>نهاية الارتقاء النوراني الأسمى</b>. هتقدر تقفل الفجوات المظلمة، وتنشر السلام الأبدي وتوحد عوالم النور والرمال.
            `;
        } else if (karma <= -60) {
            projectionBox.innerHTML = `
                <span style="color:var(--danger); font-weight:bold; font-size:1rem; display:block; margin-bottom:5px;">💀 طريق ملكوت الغرور المظلم</span>
                صنعت وهرست تركيزك وهمتك في نار الطموح المطلق والغرور المظلم. إنت دلوقتي في طريقك لـ <b>نهاية ملكوت الظلال المطلق</b>. هتستولى على قوة الفجوات السحرية وتدمر القلاع ودواوين الكبرى، وتحكم بقبضة حديدية على الصحراء بالكامل.
            `;
        } else {
            projectionBox.innerHTML = `
                <span style="color:var(--secondary); font-weight:bold; font-size:1rem; display:block; margin-bottom:5px;">⚖️ طريق الميزان والاعتدال الأبدي</span>
                إنت بعيد عن التطرف وواقف في النص بالظبط زي الحكيم المعتدل. إنت في طريقك لـ <b>نهاية الميزان الهائم الأبدي</b>. هتحافظ على التوازن والدورة الأبدية بين النور والظلام في تناسق تام.
            `;
        }
    }
    
    // 3. Populate Story Timeline
    const timeline = document.getElementById('chronicle-timeline');
    if (timeline) {
        timeline.innerHTML = '';
        
        const nodes = [];
        
        // Background node
        if (state.player.background) {
            nodes.push({
                title: "تحديد المولد والنشأة والبركة",
                desc: `اتولدت ونشأت كـ <b>${state.player.background.name}</b>، وورثت خصلة وصفة <i>${state.player.background.trait}</i> في عوالم الفناء البدنية.`,
                type: 'neutral'
            });
        }
        
        // System node
        if (state.player.system) {
            nodes.push({
                title: "انفتاح ميزة القدر المباركة",
                desc: `حلت عليك بركة السماء بميزة قدر فريدة ونادرة <b>${state.player.system.name}</b>: <i>${state.player.system.desc}</i>`,
                type: 'saintly'
            });
        }
        
        // Act completions & decisions
        if (hasChronicleFlag(state, 'womb_completed')) {
            nodes.push({
                title: "الخطوات الأولى في طريق التدريب القتالي",
                desc: "عديت اختبارات الطفولة والسما الصعبة بنجاح، وقويت مقامات جذورك البدنية وخرجت لرحاب الصحراء الواسعة.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'harun_met')) {
            nodes.push({
                title: "تاجر واحة القوافل الغامض",
                desc: "قابلت الشيخ هارون تاجر الجان، وعرفت منه السموم والشرور اللي بتلوث عوالم الرمال وجبل الطور البدنية.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act2_started')) {
            nodes.push({
                title: "فتنة العوالم والأنوار",
                desc: "شهدت بعينك التوترات والخلافات الكبيرة بين أبطال طريقة الربع الخالي وفرسان ديوان فرسان جبل الطور.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act3_pass_visited')) {
            nodes.push({
                title: "ممر الشيخ الجليل وحكمة اللقاء",
                desc: "واجهت حراس ممر الطور البدني. وحليت الخلاف بجدعنة ووقار وحكمة نورانية بالغة.",
                type: 'saintly'
            });
        }
        if (hasChronicleFlag(state, 'act3_mirror_completed')) {
            nodes.push({
                title: "مرآة الذاكرة وعزم الأوائل",
                desc: "بصيت بعمق في مرآة بحر النور اللجي. وفتحت ذكريات الخالد الساقط المدوية وتجليات النفس.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act4_started')) {
            nodes.push({
                title: "حصار واحة القوافل الكبرى",
                desc: "وقفت وقفة رجالة ودافعت عن واحة القوافل وقلب طريق الحرير ضد الطوائف السوداء الشيطانية.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'act4_completed')) {
            nodes.push({
                title: "فك الحصار وطرد الأشرار",
                desc: "سحقت جيوش الظلال الوهمية ورجعت الأمان للواحة، وكسبت احترام وود الطائفتين بالكامل.",
                type: 'saintly'
            });
        }
        if (hasChronicleFlag(state, 'act5_started')) {
            nodes.push({
                title: "ملتقى الفجوات الأعظم وقدر النهاية",
                desc: "ارتقيت للفجوة الكبرى الأخيرة، وجاهز دلوقتي عشان تقرر مصير الرمال، وجبل الطور، وأقاليم الصحراء بالكامل.",
                type: 'neutral'
            });
        }
        if (hasChronicleFlag(state, 'ending_saint')) {
            nodes.push({
                title: "☀️ الارتقاء النوراني الأسمى",
                desc: "حققت الاتحاد البدني الكامل والصفاء. وقفلت الفجوات المظلمة ببركة سماوية، وبقيت الولي الحامي لكلا العالمين.",
                type: 'saintly'
            });
        }
        if (hasChronicleFlag(state, 'ending_demon')) {
            nodes.push({
                title: "💀 حكم ملكوت الظلال والغرور المطلق",
                desc: "سحقت كل المقاومين تحت رجليك. وأسست إمبراطورية جديدة بيحكمها سيف القوة المطلقة والظلال.",
                type: 'demonic'
            });
        }
        if (hasChronicleFlag(state, 'ending_balance')) {
            nodes.push({
                title: "⚖️ توازن الميزان النوراني الكبير",
                desc: "رفضت التطرف وحافظت على النور والظلام مع بعض في توازن مستمر، ماشي في طريق الاعتدال الهائم الأبدي.",
                type: 'neutral'
            });
        }
        
        if (nodes.length === 0) {
            timeline.innerHTML = '<div style="color:var(--text-dim); text-align:center; margin-top:50px;">قصتك وابتلاءاتك لسة بادية... كمل طريقك وجاهد نفسك!</div>';
        } else {
            nodes.forEach(n => {
                const item = document.createElement('div');
                item.className = `timeline-node ${n.type}`;
                item.innerHTML = `
                    <div style="font-weight:bold; color:var(--secondary); font-size:0.95rem; margin-bottom:2px;">${n.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-dim); line-height:1.4;">${n.desc}</div>
                `;
                timeline.appendChild(item);
            });
        }
    }
    
    // 4. Update Hub Story Progress bars
    updateHubStoryProgress(state);
};

window.updateHubStoryProgress = function(state) {
    if (!state) return;
    
    const progress = calculateStoryProgress(state);
    
    // 1. Hub Screen elements
    const hudActName = document.getElementById('hud-act-name');
    const hudActPct = document.getElementById('hud-act-pct');
    const hudBar = document.getElementById('hud-act-progress-bar');
    
    if (hudActName) hudActName.textContent = progress.actName;
    if (hudActPct) hudActPct.textContent = `${progress.pct}% اكتملت`;
    if (hudBar) hudBar.style.width = `${progress.pct}%`;
    
    // 2. Narrative Screen elements
    const storyHudActName = document.getElementById('story-hud-act-name');
    const storyHudActPct = document.getElementById('story-hud-act-pct');
    const storyHudBar = document.getElementById('story-hud-act-progress-bar');
    
    if (storyHudActName) storyHudActName.textContent = progress.actName;
    if (storyHudActPct) storyHudActPct.textContent = `${progress.pct}% اكتملت`;
    if (storyHudBar) storyHudBar.style.width = `${progress.pct}%`;
};

function calculateStoryProgress(state) {
    let actName = "الفصل الأول: رمال الصحراء الهائمة";
    let pct = 0;
    
    if (window.STORY && typeof window.STORY.getCurrentAct === 'function') {
        const act = window.STORY.getCurrentAct(state);
        const names = {
            1: "الفصل الأول: رمال الصحراء الهائمة",
            2: "الفصل الثاني: فتنة العوالم والأنوار",
            3: "الفصل الثالث: مرآة الذاكرة وعزم الأوائل",
            4: "الفصل الرابع: حصار واحة القوافل الكبرى",
            5: "الفصل الخامس: ملتقى الفجوات الأعظم وقدر النهاية"
        };
        actName = names[act] || "الفصل الأول: رمال الصحراء الهائمة";
        pct = window.STORY.getActProgress(state);
    } else {
        // Fallback to legacy calculation if STORY isn't loaded yet
        if (hasChronicleFlag(state, 'act5_started')) {
            actName = "الفصل الخامس: ملتقى الفجوات الأعظم وقدر النهاية";
            pct = 50;
        } else if (hasChronicleFlag(state, 'act4_started')) {
            actName = "الفصل الرابع: حصار واحة القوافل الكبرى";
            pct = 40;
        } else if (hasChronicleFlag(state, 'act3_started')) {
            actName = "الفصل الثالث: مرآة الذاكرة وعزم الأوائل";
            pct = 30;
        } else if (hasChronicleFlag(state, 'act2_started')) {
            actName = "الفصل الثاني: فتنة العوالم والأنوار";
            pct = 50;
        } else {
            actName = "الفصل الأول: رمال الصحراء الهائمة";
            pct = 10;
        }
    }
    
    return { actName, pct };
}

window.toggleGuideModal = function() {
    const modal = document.getElementById('guide-modal');
    if (!modal) return;
    
    const active = modal.classList.toggle('active');
    
    if (active && window.AUDIO) {
        window.AUDIO.playEffect('menu_click');
    }
};

window.switchGuideTab = function(tabName) {
    const tabs = ['stances', 'cultivation', 'sects', 'exploration', 'crafting', 'companions'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const sec = document.getElementById(`guide-sec-${t}`);
        if (btn) btn.classList.remove('active');
        if (sec) sec.classList.remove('active');
    });
    
    const targetBtn = document.getElementById(`tab-btn-${tabName}`);
    const targetSec = document.getElementById(`guide-sec-${tabName}`);
    if (targetBtn) targetBtn.classList.add('active');
    if (targetSec) targetSec.classList.add('active');
    
    if (window.AUDIO) {
        window.AUDIO.playEffect('menu_click');
    }
};

window.toggleSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    
    const active = modal.classList.toggle('active');
    
    if (active && window.AUDIO) {
        window.AUDIO.playEffect('menu_click');
    }
};

window.updateSettingsBGM = function() {
    const active = document.getElementById('settings-bgm').checked;
    if (window.AUDIO) {
        if (active) {
            window.AUDIO.muted = false;
            if (window.AUDIO.ctx && window.AUDIO.master) {
                window.AUDIO.master.gain.setValueAtTime(window.AUDIO.volume, window.AUDIO.ctx.currentTime);
            }
            if (!window.AUDIO.currentRegion) {
                window.AUDIO.playRegion('crossroads');
            }
        } else {
            if (window.AUDIO.ctx && window.AUDIO.master) {
                window.AUDIO.master.gain.setValueAtTime(0, window.AUDIO.ctx.currentTime);
            }
        }
    }
};

window.updateSettingsSFX = function() {
    const active = document.getElementById('settings-sfx').checked;
    window._sfxMuted = !active;
};

window.updateTextSpeed = function() {
    const val = document.getElementById('settings-text-speed').value;
    if (val === 'instant') {
        window._textSpeedMultiplier = 0;
    } else if (val === 'fast') {
        window._textSpeedMultiplier = 0.25;
    } else {
        window._textSpeedMultiplier = 1.0;
    }
};

window.updateFontSize = function() {
    const val = document.getElementById('settings-font-size').value;
    const body = document.body;
    if (val === 'large') {
        body.style.fontSize = '1.15rem';
    } else if (val === 'xlarge') {
        body.style.fontSize = '1.3rem';
    } else {
        body.style.fontSize = ''; // Default
    }
};

window.exportSaveData = function() {
    if (!window.state) {
        alert("لا توجد بيانات بطل للتصدير حالياً!");
        return;
    }
    try {
        const json = JSON.stringify(window.state);
        const code = btoa(unescape(encodeURIComponent(json)));
        navigator.clipboard.writeText(code).then(() => {
            alert("📋 تم نسخ شفرة حفظ بطل القلوب إلى الحافظة بنجاح! احتفظ بها في مكان آمن.");
        }).catch(() => {
            alert(`فشل النسخ التلقائي. انسخ الكود التالي يدوياً:\n\n${code}`);
        });
    } catch(e) {
        alert("فشل تصدير البيانات: " + e.message);
    }
};

window.importSaveData = function() {
    const code = prompt("📥 الصق شفرة حفظ البطل التي قمت بتصديرها سابقاً:");
    if (!code) return;
    try {
        const json = decodeURIComponent(escape(atob(code.trim())));
        const parsed = JSON.parse(json);
        if (parsed && parsed.player) {
            window.state = parsed;
            if (typeof window.saveGame === 'function') window.saveGame();
            alert("🌟 تم استيراد روح بطل القلوب بنجاح! سيتم إعادة تحميل اللعبة لتطبيق التغييرات.");
            window.location.reload();
        } else {
            alert("شفرة الحفظ غير صالحة أو تالفة!");
        }
    } catch(e) {
        alert("فشل استيراد الحفظ: الكود غير صالح!");
    }
};

window.confirmResetGame = function() {
    const doubleCheck = confirm("⚠️ تحذير خطير جداً:\nهل أنت متأكد تماماً أنك تريد مسح بيانات البطل والبدء من جديد بالكامل؟ لا يمكن التراجع عن هذا القرار!");
    if (doubleCheck) {
        localStorage.clear();
        alert("💀 تم فناء التقدم البدني بالكامل. ستبدأ من نقطة الصفر كبطل جديد.");
        window.location.reload();
    }
};
