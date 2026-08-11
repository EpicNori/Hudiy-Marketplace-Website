import './style.css';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  addDoc,
  collection,
  getFirestore,
  getDocs,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};
const FIREBASE_CONFIGURED = ['apiKey', 'authDomain', 'projectId', 'appId'].every((key) => Boolean(firebaseConfig[key]));
const firebaseApp = FIREBASE_CONFIGURED ? initializeApp(firebaseConfig) : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

const state = {
  entries: [],
  filter: 'all',
  query: '',
  user: null,
  authBusy: false,
  uploadBusy: false
};

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Hudiy Marketplace Startseite">
      <span class="brand-mark">✦</span>
      <span><strong>Hudiy</strong> Marketplace<small>Community Hub</small></span>
    </a>
    <nav class="main-nav" aria-label="Hauptnavigation">
      <a href="#discover">Entdecken</a>
      <a href="#guides">Guides</a>
      <a href="#upload">Hochladen</a>
      <button class="nav-button" id="account-nav" type="button">Konto</button>
    </nav>
    <div class="header-actions">
      <span class="session-pill" id="session-pill">Gast</span>
      <button class="button button-soft" id="header-login" type="button">Anmelden</button>
      <button class="button button-ghost" id="theme-toggle" type="button" aria-label="Theme wechseln">☼</button>
      <button class="button button-primary" id="header-upload" type="button">Einreichen</button>
    </div>
  </header>

  <main id="top">
    <section class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow">Hudiy Community Hub</p>
        <h1>Finde dein nächstes <span>Hudiy-Upgrade.</span></h1>
        <p class="hero-lead">Entdecke geprüfte Community-Configs, Widgets und Erweiterungen für dein Dashboard. Lerne, passe an und teile deine eigenen Ideen.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#discover">Katalog entdecken <span>↗</span></a>
          <a class="button button-soft" href="#guides">Wie funktioniert's?</a>
        </div>
        <div class="hero-stats"><span><strong id="hero-count">–</strong> Einträge</span><span><strong>Firebase</strong> geschützte Daten</span><span><strong>MIT</strong> offene Community</span></div>
      </div>
      <aside class="hero-panel"><div class="panel-top"><span>HUDIY COMMUNITY</span><span>ONLINE</span></div><strong>Community<br /><em>extensions.</em></strong><div class="panel-list"><span><b>01</b> Configs</span><span><b>02</b> Widgets</span><span><b>03</b> Guides</span></div></aside>
    </section>

    <section class="shell discover-section" id="discover">
      <div class="section-heading"><div><p class="eyebrow">Community-Katalog</p><h2>Was suchst du?</h2></div><span class="result-count" id="result-count">Lade Katalog …</span></div>
      <div class="search-panel"><label class="search-box"><span>⌕</span><input id="search" type="search" placeholder="Nach Configs, Widgets oder Namen suchen …" autocomplete="off" /><button id="clear-search" type="button" hidden>×</button></label><div class="filter-row" id="filters"><button class="filter active" data-filter="all" type="button">Alle</button><button class="filter" data-filter="application" type="button">Apps</button><button class="filter" data-filter="dashboard-widget" type="button">Widgets</button><button class="filter" data-filter="overlay" type="button">Overlays</button><button class="filter" data-filter="dashboard" type="button">Dashboards</button></div></div>
      <div class="catalog-grid" id="catalog-grid"></div>
      <div class="empty-state" id="empty-state" hidden><div class="empty-icon">⌁</div><h3 id="empty-title">Noch nichts gefunden</h3><p id="empty-copy">Versuche einen anderen Suchbegriff oder schaue später wieder vorbei.</p></div>
    </section>

    <section class="info-band shell" id="guides"><div class="section-heading"><div><p class="eyebrow">Wissen & Sicherheit</p><h2>Schneller startklar.</h2></div></div><div class="guide-grid"><article class="guide-card"><span class="guide-number">01</span><h3>Finde passende Configs</h3><p>Suche nach deinem Hudiy-Modell, Setup oder Anwendungsfall. Jede Karte zeigt Typ, Version und benötigte Berechtigungen.</p><a href="#discover">Katalog öffnen →</a></article><article class="guide-card"><span class="guide-number">02</span><h3>Prüfe vor der Installation</h3><p>Community-Inhalte sind ungeprüft. Lies Beschreibung und Permissions und installiere nur Pakete aus Quellen, denen du vertraust.</p><a href="#safety">Sicherheitsregeln →</a></article><article class="guide-card"><span class="guide-number">03</span><h3>Teile dein Setup</h3><p>Veröffentliche dein Plugin oder deine Config in einem öffentlichen GitHub-Repo und reiche den Repo-Link zur Prüfung ein.</p><button class="text-button" data-open-upload type="button">Jetzt einreichen →</button></article></div></section>

    <section class="upload-section shell" id="upload"><div class="upload-card"><div><p class="eyebrow">Dein Beitrag</p><h2>Mach Hudiy besser.</h2><p>Veröffentliche deinen Beitrag in einem öffentlichen GitHub-Repository. Firebase Authentication und Firestore Rules sichern die Einreichung; das Repository bleibt die einzige Paketquelle.</p></div><button class="button button-primary" data-open-upload type="button">GitHub-Repo einreichen ↗</button></div></section>

    <section class="safety shell" id="safety"><span class="safety-icon">!</span><div><strong>Community-made · ungeprüft</strong><p>Es gibt keine Sicherheits-, Viren- oder Funktionsgarantie. Prüfe Permissions, Quelle und Paketinhalt vor jeder Installation.</p></div></section>
  </main>
  <footer class="site-footer shell"><span>Hudiy Marketplace Website</span><span>Open community · MIT</span><a href="https://github.com/EpicNori/Hudiy-Marketplace" target="_blank" rel="noreferrer">Hudiy Marketplace App ↗</a></footer>

  <dialog class="modal" id="login-dialog" aria-labelledby="login-dialog-title"><div class="modal-header"><div><p class="eyebrow">Konto-Zugang</p><h2 id="login-dialog-title">Anmelden</h2></div><button class="icon-button" data-close-modal type="button" aria-label="Anmeldedialog schließen">×</button></div><div class="modal-body"><p class="modal-intro">Melde dich separat an, bevor du dein Konto verwaltest oder einen Beitrag einreichst.</p><form id="login-form" class="auth-form"><label><span>E-Mail</span><input id="login-email" type="email" autocomplete="email" required /></label><label><span>Passwort</span><input id="login-password" type="password" autocomplete="current-password" minlength="6" required /></label><div class="inline-actions"><button class="button button-soft" id="sign-in" type="button">Einloggen</button><button class="button button-soft" id="sign-up" type="button">Registrieren</button><button class="button button-soft" id="google-login" type="button">Mit Google</button></div></form><p class="auth-status" id="login-status" role="status" aria-live="polite">Nicht angemeldet.</p></div></dialog>
  <dialog class="modal" id="account-dialog" aria-labelledby="account-dialog-title"><div class="modal-header"><div><p class="eyebrow">Persönlicher Bereich</p><h2 id="account-dialog-title">Mein Konto</h2></div><button class="icon-button" data-close-modal type="button" aria-label="Kontodialog schließen">×</button></div><div class="modal-body"><div class="account-summary"><div class="account-avatar" id="account-avatar">G</div><div><strong id="account-email">Gast</strong><p id="account-copy">Melde dich an, um Einreichungen zu verwalten.</p></div></div><p class="auth-status" id="account-status" role="status" aria-live="polite">Nicht angemeldet.</p><div class="dialog-actions"><button class="button button-soft" id="account-login" type="button">Anmelden</button><button class="button button-primary" id="account-submit" type="button" hidden>Einreichung öffnen</button><button class="button button-ghost" id="account-sign-out" type="button" hidden>Abmelden</button></div></div></dialog>
  <dialog class="modal" id="upload-dialog" aria-labelledby="upload-dialog-title"><div class="modal-header"><div><p class="eyebrow">GitHub-Einreichung</p><h2 id="upload-dialog-title">Beitrag einreichen</h2></div><button class="icon-button" data-close-modal type="button" aria-label="Einreichungsdialog schließen">×</button></div><div class="modal-body"><p class="modal-intro">Reiche ein öffentliches GitHub-Repository als Entwurf ein. Das Repository muss eine valide <code>manifest.json</code> enthalten.</p><p class="auth-status" id="upload-auth-status" role="status" aria-live="polite">Zum Einreichen ist eine Anmeldung erforderlich.</p><button class="button button-soft" id="open-upload-login" type="button">Zum Anmelden</button><form id="upload-form" class="upload-form"><label><span>Öffentliche GitHub-Repository-URL</span><input id="repo-url" type="url" placeholder="https://github.com/owner/repository" required /></label><label><span>Branch oder Tag</span><input id="repo-ref" type="text" value="main" pattern="[A-Za-z0-9._/-]+" required /></label><label><span>Pfad zum Manifest</span><input id="manifest-path" type="text" value="manifest.json" pattern="[A-Za-z0-9._/-]+" required /></label><p class="form-hint">Der Beitrag wird später genau aus diesem öffentlichen Repository installiert. Nutze keine privaten oder passwortgeschützten Repositories.</p><button class="button button-primary" id="submit-upload" type="submit" disabled>GitHub-Repo prüfen und einreichen</button></form></div></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
`;

const elements = {
  grid: document.querySelector('#catalog-grid'), empty: document.querySelector('#empty-state'), emptyTitle: document.querySelector('#empty-title'), emptyCopy: document.querySelector('#empty-copy'), resultCount: document.querySelector('#result-count'), heroCount: document.querySelector('#hero-count'), search: document.querySelector('#search'), clearSearch: document.querySelector('#clear-search'), filters: document.querySelector('#filters'), loginDialog: document.querySelector('#login-dialog'), accountDialog: document.querySelector('#account-dialog'), uploadDialog: document.querySelector('#upload-dialog'), loginForm: document.querySelector('#login-form'), email: document.querySelector('#login-email'), password: document.querySelector('#login-password'), signIn: document.querySelector('#sign-in'), signUp: document.querySelector('#sign-up'), google: document.querySelector('#google-login'), loginStatus: document.querySelector('#login-status'), accountEmail: document.querySelector('#account-email'), accountAvatar: document.querySelector('#account-avatar'), accountCopy: document.querySelector('#account-copy'), accountStatus: document.querySelector('#account-status'), accountLogin: document.querySelector('#account-login'), accountSubmit: document.querySelector('#account-submit'), accountSignOut: document.querySelector('#account-sign-out'), uploadAuthStatus: document.querySelector('#upload-auth-status'), openUploadLogin: document.querySelector('#open-upload-login'), uploadForm: document.querySelector('#upload-form'), repoUrl: document.querySelector('#repo-url'), repoRef: document.querySelector('#repo-ref'), manifestPath: document.querySelector('#manifest-path'), submit: document.querySelector('#submit-upload'), toast: document.querySelector('#toast'), sessionPill: document.querySelector('#session-pill'), headerLogin: document.querySelector('#header-login'), accountNav: document.querySelector('#account-nav'), themeToggle: document.querySelector('#theme-toggle')
};

function toast(message) { elements.toast.textContent = message; elements.toast.hidden = false; window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 4200); }
function isDarkMode() { return document.documentElement.dataset.mode !== 'light'; }
function ensureFirebase() { if (!FIREBASE_CONFIGURED || !auth || !db) throw new Error('Firebase ist noch nicht konfiguriert.'); }
function firebaseErrorMessage(error) {
  const code = String(error?.code || '');
  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') return 'E-Mail oder Passwort ist nicht korrekt.';
  if (code === 'auth/email-already-in-use') return 'Für diese E-Mail existiert bereits ein Konto.';
  if (code === 'auth/weak-password') return 'Das Passwort muss mindestens sechs Zeichen lang sein.';
  if (code === 'auth/operation-not-allowed') return 'Dieser Login-Anbieter ist in Firebase noch nicht aktiviert.';
  if (code === 'auth/popup-blocked') return 'Der Browser hat das Google-Login-Fenster blockiert.';
  if (code === 'auth/popup-closed-by-user') return 'Das Google-Login wurde geschlossen.';
  if (code === 'permission-denied') return 'Firebase Rules erlauben diese Aktion nicht.';
  return error?.message || 'Firebase-Vorgang fehlgeschlagen.';
}

function renderCatalog() {
  const queryText = state.query.toLocaleLowerCase('de-DE');
  const filtered = state.entries.filter((entry) => {
    const matchesType = state.filter === 'all' || entry.type === state.filter;
    const haystack = `${entry.name || ''} ${entry.description || ''} ${entry.author || ''} ${entry.type || ''}`.toLocaleLowerCase('de-DE');
    return matchesType && (!queryText || haystack.includes(queryText));
  });
  elements.grid.innerHTML = filtered.map((entry) => `<article class="catalog-card"><div class="card-top"><span class="type-label">${escapeHtml(typeLabel(entry.type))}</span><span class="version">v${escapeHtml(entry.version || '–')}</span></div><div class="card-icon">${escapeHtml((entry.name || 'H').slice(0, 1).toUpperCase())}</div><h3>${escapeHtml(entry.name || 'Unbenannter Beitrag')}</h3><p>${escapeHtml(entry.description || 'Keine Beschreibung vorhanden.')}</p><div class="card-bottom"><span>${escapeHtml(entry.author || 'Community')}</span><button class="text-button" type="button" data-entry-id="${escapeHtml(entry.id || '')}">Details →</button></div></article>`).join('');
  elements.empty.hidden = filtered.length > 0;
  elements.resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Eintrag' : 'Einträge'}`;
  elements.heroCount.textContent = state.entries.length;
}

function typeLabel(type) { return { application: 'Application', dashboard: 'Dashboard', 'dashboard-widget': 'Widget', overlay: 'Overlay' }[type] || 'Community'; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

async function loadCatalog() {
  if (!FIREBASE_CONFIGURED) {
    elements.resultCount.textContent = 'Firebase nicht konfiguriert';
    elements.empty.hidden = false;
    elements.emptyTitle.textContent = 'Firebase-Konfiguration fehlt';
    elements.emptyCopy.textContent = 'Trage die VITE_FIREBASE_* Werte in .env.local oder Vercel ein, damit der Katalog geladen wird.';
    return;
  }
  try {
    const snapshot = await getDocs(query(collection(db, 'plugins'), where('status', '==', 'published')));
    state.entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => String(b.createdAt?.toMillis?.() || '').localeCompare(String(a.createdAt?.toMillis?.() || '')));
    renderCatalog();
  } catch (error) {
    state.entries = [];
    elements.resultCount.textContent = 'Katalog nicht erreichbar';
    elements.empty.hidden = false;
    elements.emptyTitle.textContent = 'Firebase-Katalog nicht erreichbar';
    elements.emptyCopy.textContent = firebaseErrorMessage(error);
    elements.grid.innerHTML = '';
  }
}

function updateAuthUi() {
  const signedIn = Boolean(state.user);
  const email = state.user?.email || 'Firebase-Konto';
  elements.sessionPill.textContent = signedIn ? email : 'Gast';
  elements.headerLogin.textContent = signedIn ? 'Konto' : 'Anmelden';
  elements.headerLogin.setAttribute('aria-label', signedIn ? 'Konto öffnen' : 'Anmelden');
  elements.accountEmail.textContent = signedIn ? email : 'Gast';
  elements.accountAvatar.textContent = signedIn ? email.slice(0, 1).toUpperCase() : 'G';
  elements.accountCopy.textContent = signedIn ? 'Dein Konto ist bereit für Einreichungen.' : 'Melde dich an, um Einreichungen zu verwalten.';
  elements.accountLogin.hidden = signedIn;
  elements.accountSubmit.hidden = !signedIn;
  elements.accountSignOut.hidden = !signedIn;
  elements.signIn.disabled = state.authBusy || signedIn;
  elements.signUp.disabled = state.authBusy || signedIn;
  elements.google.disabled = state.authBusy || signedIn;
  elements.email.disabled = signedIn;
  elements.password.disabled = signedIn;
  const loginStatus = signedIn ? `Angemeldet als ${email}.` : FIREBASE_CONFIGURED ? 'Nicht angemeldet.' : 'Firebase ist noch nicht konfiguriert.';
  elements.loginStatus.textContent = loginStatus;
  elements.loginStatus.dataset.state = signedIn ? 'signed-in' : 'signed-out';
  elements.accountStatus.textContent = loginStatus;
  elements.accountStatus.dataset.state = signedIn ? 'signed-in' : 'signed-out';
  elements.uploadAuthStatus.textContent = signedIn ? `Angemeldet als ${email}. Dein Repository kann eingereicht werden.` : FIREBASE_CONFIGURED ? 'Zum Einreichen ist eine Anmeldung erforderlich.' : 'Firebase ist noch nicht konfiguriert.';
  elements.uploadAuthStatus.dataset.state = signedIn ? 'signed-in' : 'signed-out';
  elements.openUploadLogin.hidden = signedIn;
  elements.uploadForm.querySelectorAll('input').forEach((input) => { input.disabled = !signedIn || state.uploadBusy; });
  elements.submit.disabled = !signedIn || state.uploadBusy;
}

async function emailAuth(mode, button) {
  if (state.authBusy) return;
  state.authBusy = true; button.disabled = true;
  try {
    ensureFirebase();
    const email = elements.email.value.trim();
    const password = elements.password.value;
    if (!email || !password) throw new Error('E-Mail und Passwort ausfüllen.');
    if (mode === 'signup') await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
    toast(mode === 'signup' ? 'Konto erstellt und angemeldet.' : 'Anmeldung erfolgreich.');
    elements.loginDialog.close();
  } catch (error) { toast(firebaseErrorMessage(error)); }
  finally { state.authBusy = false; button.disabled = false; updateAuthUi(); }
}

async function startGoogleLogin() {
  try { ensureFirebase(); await signInWithPopup(auth, new GoogleAuthProvider()); toast('Google-Anmeldung erfolgreich.'); elements.loginDialog.close(); }
  catch (error) { toast(firebaseErrorMessage(error)); }
}

function parseGithubRepository(value) {
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Bitte eine gültige GitHub-Repository-URL angeben.'); }
  if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') throw new Error('Nur öffentliche https://github.com/... Repositories sind erlaubt.');
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || parts.some((part) => part === '.' || part === '..')) throw new Error('GitHub-URL muss genau owner/repository enthalten.');
  return { owner: parts[0], repo: parts[1].replace(/\.git$/i, '') };
}

function githubManifestUrl(owner, repo, refName, manifestPath) {
  const path = manifestPath.split('/').filter(Boolean).map((part) => encodeURIComponent(part)).join('/');
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(refName)}/${path}`;
}

function validateManifest(manifest) {
  const required = ['id', 'name', 'description', 'author', 'version'];
  if (!manifest || typeof manifest !== 'object' || required.some((key) => typeof manifest[key] !== 'string' || !manifest[key].trim())) throw new Error('Manifest unvollständig.');
  if (manifest.schemaVersion !== 1 || (typeof manifest.supportedHudiyVersion !== 'string' && typeof manifest.supportedHudiy?.minVersion !== 'string')) throw new Error('Manifest-Schema oder Hudiy-Version ungültig.');
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(manifest.id) || !/^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/.test(manifest.version)) throw new Error('Manifest-ID oder Version ungültig.');
}

async function uploadPackage(event) {
  event.preventDefault();
  if (!state.user || state.uploadBusy) return;
  state.uploadBusy = true; updateAuthUi();
  try {
    ensureFirebase();
    const { owner, repo } = parseGithubRepository(elements.repoUrl.value);
    const refName = elements.repoRef.value.trim();
    const manifestPath = elements.manifestPath.value.trim().replace(/^\/+|\/+$/g, '');
    if (!refName || !/^[A-Za-z0-9._/-]+$/.test(refName) || !manifestPath || !/^[A-Za-z0-9._/-]+$/.test(manifestPath)) throw new Error('Branch/Tag und Manifest-Pfad sind ungültig.');
    const manifestUrl = githubManifestUrl(owner, repo, refName, manifestPath);
    const response = await fetch(manifestUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Manifest nicht gefunden. Prüfe öffentliche Repo-URL, Branch und Pfad.');
    const manifest = await response.json();
    validateManifest(manifest);
    const submissionId = crypto.randomUUID();
    await addDoc(collection(db, 'submissions'), { submissionId, sourceType: 'github', pluginId: manifest.id, name: manifest.name, description: manifest.description, author: manifest.author, version: manifest.version, ownerId: state.user.uid, status: 'pending', repoUrl: `https://github.com/${owner}/${repo}`, repoOwner: owner, repoName: repo, repoRef: refName, manifestPath, manifestUrl, createdAt: serverTimestamp() });
    toast('GitHub-Repository geprüft und zur Moderation eingereicht.'); elements.uploadForm.reset(); elements.repoRef.value = 'main'; elements.manifestPath.value = 'manifest.json';
  } catch (error) { toast(firebaseErrorMessage(error)); }
  finally { state.uploadBusy = false; updateAuthUi(); }
}

function openUpload() { updateAuthUi(); elements.uploadDialog.showModal(); }
function openLogin() { updateAuthUi(); elements.loginDialog.showModal(); window.setTimeout(() => elements.email.focus(), 0); }
function openAccount() { updateAuthUi(); elements.accountDialog.showModal(); }
document.querySelectorAll('[data-open-upload]').forEach((button) => button.addEventListener('click', openUpload));
document.querySelector('#header-upload').addEventListener('click', openUpload);
elements.headerLogin.addEventListener('click', () => state.user ? openAccount() : openLogin());
elements.accountNav.addEventListener('click', openAccount);
elements.accountLogin.addEventListener('click', () => { elements.accountDialog.close(); openLogin(); });
elements.accountSubmit.addEventListener('click', () => { elements.accountDialog.close(); openUpload(); });
elements.accountSignOut.addEventListener('click', async () => { try { await signOut(auth); toast('Du wurdest abgemeldet.'); } catch (error) { toast(firebaseErrorMessage(error)); } });
elements.openUploadLogin.addEventListener('click', () => { elements.uploadDialog.close(); openLogin(); });
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('.modal').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
elements.signIn.addEventListener('click', () => emailAuth('signin', elements.signIn));
elements.signUp.addEventListener('click', () => emailAuth('signup', elements.signUp));
elements.google.addEventListener('click', startGoogleLogin);
elements.uploadForm.addEventListener('submit', uploadPackage);
elements.search.addEventListener('input', (event) => { state.query = event.target.value.trim(); elements.clearSearch.hidden = !state.query; renderCatalog(); });
elements.clearSearch.addEventListener('click', () => { elements.search.value = ''; state.query = ''; elements.clearSearch.hidden = true; renderCatalog(); });
elements.filters.addEventListener('click', (event) => { const button = event.target.closest('[data-filter]'); if (!button) return; state.filter = button.dataset.filter; document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button)); renderCatalog(); });
elements.themeToggle.addEventListener('click', () => { document.documentElement.dataset.mode = isDarkMode() ? 'light' : 'dark'; elements.themeToggle.textContent = isDarkMode() ? '☼' : '☾'; localStorage.setItem('hudiy-community-mode', document.documentElement.dataset.mode); });

document.documentElement.dataset.mode = localStorage.getItem('hudiy-community-mode') || 'dark';
elements.themeToggle.textContent = isDarkMode() ? '☼' : '☾';
updateAuthUi();
if (auth) onAuthStateChanged(auth, (user) => { state.user = user; updateAuthUi(); });
loadCatalog();

