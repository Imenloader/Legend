// firebase_sync.js — Firebase Firestore & Google Auth Cloud Persistence Module
import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserPopupRedirectResolver,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    getDocFromServer,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import {
    sanitizePlayerName,
    safeDeepMerge,
    computeSaveSignature,
    sanitizeSaveState
} from './combat_engine.js';

// Catch unhandled iframe network rejections that can occur in nested sandboxed iframes
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const msg = String(reason?.message || reason || '');
        const code = String(reason?.code || '');
        const stack = String(reason?.stack || '');
        if (
            code === 'auth/network-request-failed' ||
            msg.includes('network-request-failed') ||
            stack.includes('_openIframe') ||
            stack.includes('firebase_auth')
        ) {
            event.preventDefault();
            console.warn('Handled Firebase Auth sandbox network state:', msg || code);
        }
    });
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let authInstance;
try {
    // initializeAuth avoids proactively opening an authDomain iframe on page load
    authInstance = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence]
    });
} catch (e) {
    authInstance = getAuth(app);
}
export const auth = authInstance;


const OperationType = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LIST: 'list',
    GET: 'get',
    WRITE: 'write'
};

export function handleFirestoreError(error, operationType, path) {
    const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid ?? null,
            email: auth.currentUser?.email ?? null,
            emailVerified: auth.currentUser?.emailVerified ?? null,
            isAnonymous: auth.currentUser?.isAnonymous ?? null,
            tenantId: auth.currentUser?.tenantId ?? null,
            providerInfo:
                auth.currentUser?.providerData?.map(provider => ({
                    providerId: provider.providerId,
                    email: provider.email
                })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
    try {
        await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error('Please check your Firebase configuration.');
        }
    }
}
testConnection();

function buildFirestoreSavePayload(uid, stateObj, isCreate = false) {
    const check = sanitizeSaveState(stateObj);
    const cleanState = check.valid ? check.state : stateObj;
    const playerName = sanitizePlayerName(cleanState?.player?.name || 'البطل الفارس').slice(0, 40);
    const lvl = Math.max(1, Math.min(999, Math.floor(Number(cleanState?.player?.lvl) || 1)));
    const gold = Math.max(0, Math.min(999999999, Math.floor(Number(cleanState?.player?.gold) || 0)));

    let statePayload = JSON.stringify(cleanState);
    if (statePayload.length > 890000) {
        // Trim transient combat logs if state ever approaches 900KB limit
        const slim = { ...cleanState, _combatLock: false, _uiLock: false };
        statePayload = JSON.stringify(slim).slice(0, 890000);
    }
    const signature = computeSaveSignature(statePayload).slice(0, 64);

    const payload = {
        playerId: uid,
        ownerUid: uid,
        playerName,
        lvl,
        gold,
        statePayload,
        signature,
        updatedAt: serverTimestamp()
    };

    if (isCreate) {
        payload.createdAt = serverTimestamp();
    }
    return payload;
}

function scoreStateProgress(s) {
    if (!s || !s.player) return 0;
    const lvl = Number(s.player.lvl) || 1;
    const xp = Number(s.player.xp) || 0;
    const gold = Number(s.player.gold) || 0;
    const kills = Number(s.player.kills) || 0;
    const tower = Number(s.player.maxTowerFloor) || 0;
    const flags = s.storyFlags ? Object.keys(s.storyFlags).length : 0;
    const items = Array.isArray(s.player.inventory?.items) ? s.player.inventory.items.length : 0;
    return lvl * 10000 + tower * 1500 + flags * 500 + kills * 100 + items * 50 + xp + Math.min(5000, gold);
}

function updateFirebaseStatusUI(user, statusText) {
    const badge = document.getElementById('firebase-status-text');
    const signInBtn = document.getElementById('firebase-signin-btn');
    const signOutBtn = document.getElementById('firebase-signout-btn');

    if (badge) {
        if (statusText) {
            badge.textContent = statusText;
        } else if (user) {
            badge.textContent = `☁️ متصل بـ Firebase (${user.displayName || user.email || 'حساب موثق'})`;
            badge.style.color = 'var(--jade)';
        } else {
            badge.textContent = '💾 الحفظ المحلي نشط — سجل الدخول بـ Google للمزامنة السحابية عبر Firebase';
            badge.style.color = 'var(--text-dim)';
        }
    }
    if (signInBtn) signInBtn.style.display = user ? 'none' : 'inline-flex';
    if (signOutBtn) signOutBtn.style.display = user ? 'inline-flex' : 'none';
}

const FIREBASE_SYNC = {
    db,
    auth,
    currentUser: null,
    isReady: false,

    async saveToCloud(stateObj) {
        const user = auth.currentUser;
        if (!user || !user.emailVerified) return false;
        const uid = user.uid;
        const path = `game_saves/${uid}`;
        const docRef = doc(db, 'game_saves', uid);

        try {
            const snap = await getDoc(docRef);
            if (!snap.exists()) {
                const createPayload = buildFirestoreSavePayload(uid, stateObj, true);
                try {
                    await setDoc(docRef, createPayload);
                } catch (err) {
                    handleFirestoreError(err, OperationType.CREATE, path);
                }
            } else {
                const updatePayload = buildFirestoreSavePayload(uid, stateObj, false);
                try {
                    await updateDoc(docRef, updatePayload);
                } catch (err) {
                    handleFirestoreError(err, OperationType.UPDATE, path);
                }
            }
            updateFirebaseStatusUI(user, `☁️ تم الحفظ في Firebase بنجاح (${new Date().toLocaleTimeString('ar-EG')})`);
            return true;
        } catch (err) {
            console.warn('Firebase cloud save warning:', err);
            return false;
        }
    },

    async loadFromCloud(targetState) {
        const user = auth.currentUser;
        if (!user || !user.emailVerified) return false;
        const uid = user.uid;
        const path = `game_saves/${uid}`;
        const docRef = doc(db, 'game_saves', uid);

        try {
            let snap;
            try {
                snap = await getDoc(docRef);
            } catch (err) {
                handleFirestoreError(err, OperationType.GET, path);
            }

            if (snap && snap.exists()) {
                const data = snap.data();
                if (data && typeof data.statePayload === 'string') {
                    const parsed = JSON.parse(data.statePayload);
                    const check = sanitizeSaveState(parsed);
                    if (check.valid && check.state) {
                        const localScore = scoreStateProgress(targetState);
                        const cloudScore = scoreStateProgress(check.state);

                        if (cloudScore >= localScore) {
                            // Merge local into cloud so no local keys are lost, with cloud taking precedence on progress
                            safeDeepMerge(targetState, check.state);
                            localStorage.setItem('legend_rpg_state', JSON.stringify(targetState));
                        } else {
                            // Local state has newer progress: keep all local data and push it up to Firebase
                            await this.saveToCloud(targetState);
                        }
                        if (typeof window.validateState === 'function') window.validateState();
                        if (typeof window.calculateTotalStats === 'function') window.calculateTotalStats();
                        if (typeof window.updateTopBar === 'function') window.updateTopBar();
                        const contBtn = document.getElementById('continue-btn');
                        if (contBtn) contBtn.style.display = 'block';
                        return true;
                    }
                }
            } else if (targetState && targetState.player) {
                // First time cloud sync for this user: upload existing local save to Firestore!
                await this.saveToCloud(targetState);
                return true;
            }
        } catch (err) {
            console.warn('Firebase cloud load warning:', err);
        }
        return false;
    },

    async signIn() {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
            if (result && result.user && window.state) {
                await this.loadFromCloud(window.state);
                if (typeof window.showToast === 'function') {
                    window.showToast('☁️ تم ربط حسابك ومزامنة بياناتك مع قاعدة بيانات Firebase!');
                }
            }
        } catch (err) {
            console.warn('Google Sign-In notice:', err);
            const msg = String(err?.code || err?.message || '');
            if (typeof window.showToast === 'function') {
                if (msg.includes('popup-closed-by-user')) {
                    window.showToast('تم إغلاق نافذة تسجيل الدخول.');
                } else {
                    window.showToast('تعذر إكمال تسجيل الدخول السحابي — بياناتك محفوظة محلياً بأمان.');
                }
            }
        }
    },

    async signOutUser() {
        try {
            await signOut(auth);
            updateFirebaseStatusUI(null);
            if (typeof window.showToast === 'function') {
                window.showToast('تم تسجيل الخروج من السحابة مع الاحتفاظ بكامل تقدمك المحلي.');
            }
        } catch (err) {
            console.warn('Sign-out error:', err);
        }
    }
};

onAuthStateChanged(auth, async user => {
    FIREBASE_SYNC.currentUser = user;
    FIREBASE_SYNC.isReady = true;
    updateFirebaseStatusUI(user);
    if (user && user.emailVerified && window.state) {
        await FIREBASE_SYNC.loadFromCloud(window.state);
    }
});

window.FIREBASE_SYNC = FIREBASE_SYNC;
export default FIREBASE_SYNC;
