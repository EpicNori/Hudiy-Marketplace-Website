import './style.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mdzsxuxqrhnadmkroalq.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HHy5vHMVCwmMb7kA-sgt5Q_UJ7A_vQM';
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const SESSION_KEY = 'hudiy-community-session';
const BUCKET = 'plugin-packages';
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const state = {
  entries: [],
  filter: 'all',
  query: '',
  session: null,
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
    </nav>
    <div class="header-actions">
      <span class="session-pill" id="session-pill">Gast</span>
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
        <div class="hero-stats"><span><strong id="hero-count">–</strong> Einträge</span><span><strong>RLS</strong> geschützte Uploads</span><span><strong>MIT</strong> offene Community</span></div>
      </div>
      <aside class="hero-panel"><div class="panel-top"><span>HUDIY COMMUNITY</span><span>ONLINE</span></div><strong>Community<br /><em>extensions.</em></strong><div class="panel-list"><span><b>01</b> Configs</span><span><b>02</b> Widgets</span><span><b>03</b> Guides</span></div></aside>
    </section>

    <section class="shell discover-section" id="discover">
      <div class="section-heading"><div><p class="eyebrow">Community-Katalog</p><h2>Was suchst du?</h2></div><span class="result-count" id="result-count">Lade Katalog …</span></div>
      <div class="search-panel"><label class="search-box"><span>⌕</span><input id="search" type="search" placeholder="Nach Configs, Widgets oder Namen suchen …" autocomplete="off" /><button id="clear-search" type="button" hidden>×</button></label><div class="filter-row" id="filters"><button class="filter active" data-filter="all" type="button">Alles</button><button class="filter" data-filter="dashboard-widget" type="button">Widgets</button><button class="filter" data-filter="application" type="button">Apps</button><button class="filter" data-filter="overlay" type="button">Overlays</button></div></div>
      <div class="catalog-grid" id="catalog-grid"></div>
      <div class="empty-state" id="empty-state" hidden><div class="empty-icon">⌁</div><h3 id="empty-title">Noch nichts gefunden</h3><p id="empty-copy">Versuche einen anderen Suchbegriff oder schaue später wieder vorbei.</p></div>
    </section>

    <section class="info-band shell" id="guides"><div class="section-heading"><div><p class="eyebrow">Wissen & Sicherheit</p><h2>Schneller startklar.</h2></div></div><div class="guide-grid"><article class="guide-card"><span class="guide-number">01</span><h3>Finde passende Configs</h3><p>Suche nach deinem Hudiy-Modell, Setup oder Anwendungsfall. Jede Karte zeigt Typ, Version und benötigte Berechtigungen.</p><a href="#discover">Katalog öffnen →</a></article><article class="guide-card"><span class="guide-number">02</span><h3>Prüfe vor der Installation</h3><p>Community-Inhalte sind ungeprüft. Lies Beschreibung und Permissions und installiere nur Pakete aus Quellen, denen du vertraust.</p><a href="#safety">Sicherheitsregeln →</a></article><article class="guide-card"><span class="guide-number">03</span><h3>Teile dein Setup</h3><p>Registriere dich, lade Manifest und ZIP hoch und reiche dein Paket als Entwurf zur Prüfung ein.</p><button class="text-button" data-open-upload type="button">Jetzt einreichen →</button></article></div></section>

    <section class="upload-section shell" id="upload"><div class="upload-card"><div><p class="eyebrow">Dein Beitrag</p><h2>Mach Hudiy besser.</h2><p>Teile eine Config, ein Widget oder eine Erweiterung mit der Community. Uploads werden serverseitig über Supabase Storage und RLS abgesichert.</p></div><button class="button button-primary" data-open-upload type="button">Plugin oder Config hochladen ↗</button></div></section>

    <section class="safety shell" id="safety"><span class="safety-icon">!</span><div><strong>Community-made · ungeprüft</strong><p>Es gibt keine Sicherheits-, Viren- oder Funktionsgarantie. Prüfe Permissions, Quelle und Paketinhalt vor jeder Installation.</p></div></section>
  </main>
  <footer class="site-footer shell"><span>Hudiy Marketplace Website</span><span>Open community · MIT</span><a href="https://github.com/EpicNori/Hudiy-Marketplace" target="_blank" rel="noreferrer">Hudiy Marketplace App ↗</a></footer>

  <dialog class="modal" id="upload-dialog"><div class="modal-header"><div><p class="eyebrow">Supabase Upload</p><h2>Beitrag einreichen</h2></div><button class="icon-button" data-close-modal type="button" aria-label="Dialog schließen">×</button></div><div class="modal-body"><p class="modal-intro">Melde dich an und reiche ein validiertes Plugin- oder Config-Paket als Entwurf ein.</p><form id="auth-form" class="auth-form"><label><span>E-Mail</span><input id="email" type="email" autocomplete="email" required /></label><label><span>Passwort</span><input id="password" type="password" autocomplete="current-password" minlength="6" required /></label><div class="inline-actions"><button class="button button-soft" id="sign-in" type="button">Einloggen</button><button class="button button-soft" id="sign-up" type="button">Registrieren</button><button class="button button-soft" id="google-login" type="button">Mit Google</button><button class="button button-ghost" id="sign-out" type="button" hidden>Abmelden</button></div></form><p class="auth-status" id="auth-status" role="status" aria-live="polite">Nicht angemeldet.</p><form id="upload-form" class="upload-form"><label><span>Manifest JSON</span><input id="manifest" type="file" accept="application/json,.json" required /></label><label><span>Plugin-/Config-Paket ZIP</span><input id="package" type="file" accept=".zip,application/zip" required /></label><button class="button button-primary" id="submit-upload" type="submit" disabled>Hochladen und einreichen</button></form></div></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
`;

const elements = {
  grid: document.querySelector('#catalog-grid'), empty: document.querySelector('#empty-state'), emptyTitle: document.querySelector('#empty-title'), emptyCopy: document.querySelector('#empty-copy'), resultCount: document.querySelector('#result-count'), heroCount: document.querySelector('#hero-count'), search: document.querySelector('#search'), clearSearch: document.querySelector('#clear-search'), filters: document.querySelector('#filters'), dialog: document.querySelector('#upload-dialog'), authForm: document.querySelector('#auth-form'), email: document.querySelector('#email'), password: document.querySelector('#password'), signIn: document.querySelector('#sign-in'), signUp: document.querySelector('#sign-up'), google: document.querySelector('#google-login'), signOut: document.querySelector('#sign-out'), authStatus: document.querySelector('#auth-status'), uploadForm: document.querySelector('#upload-form'), manifest: document.querySelector('#manifest'), package: document.querySelector('#package'), submit: document.querySelector('#submit-upload'), toast: document.querySelector('#toast'), sessionPill: document.querySelector('#session-pill'), themeToggle: document.querySelector('#theme-toggle')
};

function supabaseRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('apikey', SUPABASE_KEY);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (state.session?.access_token) headers.set('Authorization', `Bearer ${state.session.access_token}`);
  return fetch(`${SUPABASE_URL.replace(/\/$/, '')}${path}`, { ...options, headers }).then(async (response) => {
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.msg || body?.message || body?.error_description || `Supabase ${response.status}`);
    return body;
  });
}

function loadSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
function saveSession(session) { state.session = session?.access_token ? session : null; if (state.session) localStorage.setItem(SESSION_KEY, JSON.stringify(state.session)); else localStorage.removeItem(SESSION_KEY); updateAuthUi(); }
function toast(message) { elements.toast.textContent = message; elements.toast.hidden = false; window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => { elements.toast.hidden = true; }, 4200); }
function isColorModeDark() { return document.documentElement.dataset.mode !== 'light'; }

function renderCatalog() {
  const query = state.query.toLocaleLowerCase('de-DE');
  const filtered = state.entries.filter((entry) => {
    const matchesType = state.filter === 'all' || entry.type === state.filter;
    const haystack = `${entry.name || ''} ${entry.description || ''} ${entry.author || ''} ${entry.type || ''}`.toLocaleLowerCase('de-DE');
    return matchesType && (!query || haystack.includes(query));
  });
  elements.grid.innerHTML = filtered.map((entry) => `<article class="catalog-card"><div class="card-top"><span class="type-label">${escapeHtml(typeLabel(entry.type))}</span><span class="version">v${escapeHtml(entry.version || '–')}</span></div><div class="card-icon">${escapeHtml((entry.name || 'H').slice(0, 1).toUpperCase())}</div><h3>${escapeHtml(entry.name || 'Unbenannter Beitrag')}</h3><p>${escapeHtml(entry.description || 'Keine Beschreibung vorhanden.')}</p><div class="card-bottom"><span>${escapeHtml(entry.author || 'Community')}</span><button class="text-button" type="button" data-entry-id="${escapeHtml(entry.id || '')}">Details →</button></div></article>`).join('');
  elements.empty.hidden = filtered.length > 0;
  elements.resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'Eintrag' : 'Einträge'}`;
  elements.heroCount.textContent = state.entries.length;
}

function typeLabel(type) { return { application: 'Application', dashboard: 'Dashboard', 'dashboard-widget': 'Widget', overlay: 'Overlay' }[type] || 'Community'; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

async function loadCatalog() {
  try {
    const payload = await supabaseRequest('/functions/v1/catalog');
    state.entries = Array.isArray(payload?.plugins) ? payload.plugins : [];
    renderCatalog();
  } catch (error) {
    state.entries = [];
    elements.resultCount.textContent = 'Katalog nicht erreichbar';
    elements.empty.hidden = false;
    elements.emptyTitle.textContent = 'Katalog wird gerade verbunden';
    elements.emptyCopy.textContent = 'Die Website ist bereit. Sobald Supabase erreichbar ist, erscheinen hier veröffentlichte Beiträge.';
    elements.grid.innerHTML = '';
  }
}

function updateAuthUi() {
  const signedIn = Boolean(state.session?.access_token);
  elements.sessionPill.textContent = signedIn ? (state.session.user?.email || 'Angemeldet') : 'Gast';
  elements.signIn.hidden = signedIn; elements.signUp.hidden = signedIn; elements.google.hidden = signedIn; elements.signOut.hidden = !signedIn;
  elements.email.disabled = signedIn; elements.password.disabled = signedIn;
  elements.authStatus.textContent = signedIn ? `Angemeldet als ${state.session.user?.email || 'Supabase-Konto'}.` : 'Nicht angemeldet. Zum Hochladen ist ein Konto erforderlich.';
  elements.authStatus.dataset.state = signedIn ? 'signed-in' : 'signed-out';
  elements.submit.disabled = !signedIn || state.uploadBusy;
}

async function auth(path, button) {
  if (state.authBusy) return;
  state.authBusy = true; button.disabled = true;
  try { const session = await supabaseRequest(path, { method: 'POST', body: JSON.stringify({ email: elements.email.value.trim(), password: elements.password.value }) }); saveSession(session); toast('Anmeldung erfolgreich.'); }
  catch (error) { toast(error.message || 'Anmeldung fehlgeschlagen.'); }
  finally { state.authBusy = false; button.disabled = false; updateAuthUi(); }
}

function startGoogleLogin() {
  const redirect = new URL(SITE_URL); redirect.hash = '';
  const url = new URL('/auth/v1/authorize', SUPABASE_URL); url.searchParams.set('provider', 'google'); url.searchParams.set('redirect_to', redirect.href); window.location.assign(url.href);
}

async function handleAuthRedirect() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (!hash.get('access_token')) return;
  try { const session = { access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token'), token_type: hash.get('token_type'), expires_in: Number(hash.get('expires_in') || 3600), expires_at: Math.floor(Date.now() / 1000) + Number(hash.get('expires_in') || 3600) }; const user = await supabaseRequest('/auth/v1/user', { headers: { Authorization: `Bearer ${session.access_token}` } }); session.user = user; saveSession(session); history.replaceState(null, '', window.location.pathname + window.location.search); toast('Google-Anmeldung erfolgreich.'); } catch { toast('Google-Anmeldung konnte nicht abgeschlossen werden.'); }
}

async function uploadPackage(event) {
  event.preventDefault(); if (!state.session?.access_token || state.uploadBusy) return;
  const manifestFile = elements.manifest.files?.[0]; const packageFile = elements.package.files?.[0];
  if (!manifestFile || !packageFile) return toast('Manifest und ZIP auswählen.');
  if (packageFile.size > MAX_UPLOAD_BYTES) return toast('Das ZIP darf maximal 50 MB groß sein.');
  state.uploadBusy = true; updateAuthUi();
  try {
    const manifest = JSON.parse(await manifestFile.text());
    const required = ['id', 'name', 'description', 'author', 'version', 'checksum'];
    if (required.some((key) => typeof manifest[key] !== 'string' || !manifest[key].trim())) throw new Error('Manifest unvollständig.');
    if (manifest.schemaVersion !== 1 || (typeof manifest.supportedHudiyVersion !== 'string' && typeof manifest.supportedHudiy?.minVersion !== 'string')) throw new Error('Manifest-Schema oder Hudiy-Version ungültig.');
    if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(manifest.id) || !/^\d+\.\d+\.\d+([-+][0-9A-Za-z.-]+)?$/.test(manifest.version)) throw new Error('Manifest-ID oder Version ungültig.');
    if (!packageFile.name.toLowerCase().endsWith('.zip')) throw new Error('Nur ZIP-Pakete sind erlaubt.');
    const digest = await crypto.subtle.digest('SHA-256', await packageFile.arrayBuffer()); const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    if (manifest.checksum.replace(/^sha256:/i, '').toLowerCase() !== checksum) throw new Error('Checksum stimmt nicht mit dem ZIP überein.');
    const form = new FormData();
    form.append('manifest', new File([JSON.stringify(manifest)], 'manifest.json', { type: 'application/json' }));
    form.append('package', packageFile, packageFile.name);
    const result = await supabaseRequest('/functions/v1/submit-plugin-upload', { method: 'POST', body: form });
    if (!result?.ok) throw new Error('Upload wurde abgelehnt.');
    toast('Upload serverseitig geprüft und zur Moderation eingereicht.'); elements.uploadForm.reset();
  } catch (error) { toast(error.message || 'Upload fehlgeschlagen.'); }
  finally { state.uploadBusy = false; updateAuthUi(); }
}

function openUpload() { updateAuthUi(); elements.dialog.showModal(); }
document.querySelectorAll('[data-open-upload]').forEach((button) => button.addEventListener('click', openUpload));
document.querySelector('#header-upload').addEventListener('click', openUpload);
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => elements.dialog.close()));
elements.dialog.addEventListener('click', (event) => { if (event.target === elements.dialog) elements.dialog.close(); });
elements.signIn.addEventListener('click', () => auth('/auth/v1/token?grant_type=password', elements.signIn));
elements.signUp.addEventListener('click', () => auth('/auth/v1/signup', elements.signUp));
elements.signOut.addEventListener('click', () => saveSession(null));
elements.google.addEventListener('click', startGoogleLogin);
elements.uploadForm.addEventListener('submit', uploadPackage);
elements.search.addEventListener('input', (event) => { state.query = event.target.value.trim(); elements.clearSearch.hidden = !state.query; renderCatalog(); });
elements.clearSearch.addEventListener('click', () => { elements.search.value = ''; state.query = ''; elements.clearSearch.hidden = true; renderCatalog(); });
elements.filters.addEventListener('click', (event) => { const button = event.target.closest('[data-filter]'); if (!button) return; state.filter = button.dataset.filter; document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button)); renderCatalog(); });
elements.themeToggle.addEventListener('click', () => { document.documentElement.dataset.mode = isColorModeDark() ? 'light' : 'dark'; elements.themeToggle.textContent = isColorModeDark() ? '☼' : '☾'; localStorage.setItem('hudiy-community-mode', document.documentElement.dataset.mode); });

document.documentElement.dataset.mode = localStorage.getItem('hudiy-community-mode') || 'dark';
elements.themeToggle.textContent = isColorModeDark() ? '☼' : '☾';
state.session = loadSession(); updateAuthUi(); handleAuthRedirect().finally(loadCatalog);
