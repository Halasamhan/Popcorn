/* ==========================================================
   layout.js — shared header, footer, search, helpers.
   Every page loads this after data.js. The page declares its
   active nav item with <body data-page="home|movies|series|subscribe|signin">.
   ========================================================== */
(function () {
  'use strict';

  const CATALOG = window.CATALOG || [];

  /* ---------- helpers shared by other scripts ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Landscape art: use t.backdrop (true 16:9) when provided, else the poster
  const artOf = (t) => t.backdrop || t.poster;

  const titleUrl = (key) => 'title.html?id=' + encodeURIComponent(key);

  const FALLBACK_ICON = { movie: '🎬', series: '📺', kdrama: '📺', cdrama: '📺' };

  function posterFallbackHTML(t) {
    return `<div class="poster-fallback" role="img" aria-label="${esc(t.title)} poster unavailable">
      <span class="ico">${FALLBACK_ICON[t.kind] || '🎬'}</span>${esc(t.title)}</div>`;
  }

  function cardHTML(t) {
    return `<a class="card" href="${titleUrl(t.key)}" aria-label="${esc(t.title)} — details">
      <div class="poster-wrap">
        <img class="poster-bg" src="${esc(artOf(t))}" alt="" aria-hidden="true" loading="lazy" decoding="async">
        <img class="poster" src="${esc(artOf(t))}" alt="${esc(t.title)} poster" width="640" height="360" loading="lazy" decoding="async">
      </div>
      <div class="meta">
        <div class="name">${esc(t.title)}</div>
        <div class="sub">${esc(t.year)} · ${esc(t.meta)}</div>
      </div>
    </a>`;
  }

  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  // Safe localStorage wrapper (can throw in private mode / blocked storage)
  const store = {
    get(k, fallback) {
      try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  /* ---------- demo auth (browser-only; no server) ----------
     Accounts live in localStorage with a SHA-256 hashed password.
     This is a front-end demo — a real site needs a backend. */
  async function sha256(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return btoa(unescape(encodeURIComponent(text))); }
  }
  const normId = (s) => String(s).trim().toLowerCase().replace(/[\s-]/g, '');

  const auth = {
    user() { return store.get('pp-session', null); },
    async signUp(id, pw) {
      id = normId(id);
      const users = store.get('pp-users', {});
      if (users[id]) return { ok: false, error: 'An account with this email/number already exists. Try signing in.' };
      users[id] = await sha256(id + ':' + pw);
      store.set('pp-users', users);
      store.set('pp-session', id);
      return { ok: true };
    },
    async signIn(id, pw) {
      id = normId(id);
      const users = store.get('pp-users', {});
      if (!users[id]) return { ok: false, error: 'No account found. Create one first.' };
      if (users[id] !== await sha256(id + ':' + pw)) return { ok: false, error: 'Wrong password.' };
      store.set('pp-session', id);
      return { ok: true };
    },
    signOut() { try { localStorage.removeItem('pp-session'); } catch (e) { /* ignore */ } },
    list() { const u = auth.user(); return u ? store.get('pp-list:' + u, []) : []; },
    setList(l) { const u = auth.user(); if (u) store.set('pp-list:' + u, l); },
    // Send the visitor to sign in, then bring them back to `next`
    requireLogin(next) {
      window.location.href = 'signin.html?next=' + encodeURIComponent(next || (location.pathname.split('/').pop() + location.search));
    },
    // Only allow same-site relative targets after login
    safeNext(n) { return n && /^[\w.-]+\.html(\?[\w=&%.-]*)?$/.test(n) ? n : 'index.html'; },
  };

  window.PP = { esc, artOf, titleUrl, cardHTML, posterFallbackHTML, toast, store, auth, CATALOG };

  /* ---------- header + footer markup ---------- */
  const NAV = [
    ['home', 'index.html', 'Home'],
    ['movies', 'movies.html', 'Movies'],
    ['series', 'series.html', 'Series'],
    ['subscribe', 'subscribe.html', 'Subscribe'],
  ];

  const brandHTML = `<a class="brand-link" href="index.html" aria-label="PopCorn Palace — home">
      <span class="pop" aria-hidden="true">🍿</span>
      <span class="brand"><span class="r">P</span>o<span class="r">P</span>corn <span class="r">P</span>alace</span>
    </a>`;

  function headerHTML(page) {
    const me = auth.user();
    const navItems = me ? NAV.concat([['mylist', 'mylist.html', 'My List']]) : NAV;
    const links = navItems.map(([id, href, label]) =>
      `<a href="${href}"${id === page ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`).join('');
    return `${brandHTML}
      <button class="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu">☰</button>
      <nav class="nav-links" id="nav-menu" aria-label="Main">${links}</nav>
      <div class="nav-search" role="search">
        <label class="visually-hidden" for="nav-q">Search titles</label>
        <input type="search" id="nav-q" placeholder="Search movies, series..." autocomplete="off"
               role="combobox" aria-expanded="false" aria-controls="nav-dropdown">
        <button type="button" id="nav-go">Search</button>
        <div class="search-dropdown" id="nav-dropdown" role="listbox" hidden></div>
      </div>
      <div class="nav-right">
        ${me
          ? `<span class="user-chip" title="${esc(me)}">👤 ${esc(me.length > 18 ? me.slice(0, 16) + '…' : me)}</span>
             <button class="btn-ghost" id="signout" type="button">Sign Out</button>`
          : `<a class="btn-ghost${page === 'signin' ? ' is-on' : ''}" href="signin.html">Sign In</a>`}
        <a class="btn-primary" href="subscribe.html">Subscribe</a>
      </div>`;
  }

  function footerHTML() {
    return `${brandHTML}
      <nav class="footer-links" aria-label="Footer">
        <a href="index.html">Home</a><a href="movies.html">Movies</a><a href="series.html">Series</a>
        <a href="subscribe.html">Subscribe</a><a href="signin.html">Sign In</a>
      </nav>
      <p class="ar" lang="ar">جميع الحقوق محفوظة لموقع PopCorn Palace</p>
      <p class="muted">© ${new Date().getFullYear()} PopCorn Palace · Stream movies, series &amp; cartoons</p>`;
  }

  function mountChrome() {
    const page = document.body.dataset.page || '';

    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);

    const header = document.createElement('header');
    header.className = 'nav';
    header.innerHTML = headerHTML(page);
    skip.after(header);

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = footerHTML();
    document.body.appendChild(footer);

    // Mobile menu toggle
    const toggle = header.querySelector('.nav-toggle');
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    });

    const out = header.querySelector('#signout');
    if (out) out.addEventListener('click', () => {
      auth.signOut();
      window.location.href = page === 'mylist' ? 'index.html' : location.pathname.split('/').pop() + location.search;
    });

    initSearch(header);
  }

  /* ---------- live search ---------- */
  function initSearch(header) {
    const $input = header.querySelector('#nav-q');
    const $btn = header.querySelector('#nav-go');
    const $dd = header.querySelector('#nav-dropdown');
    let hits = [];
    let kb = -1;

    function score(t, terms) {
      const title = t.title.toLowerCase();
      const hay = `${title} ${t.category} ${t.year}`.toLowerCase();
      let s = 0;
      for (const term of terms) {
        if (title.includes(term)) s += 40;
        else if (hay.includes(term)) s += 18;
      }
      return s;
    }

    function itemHTML(t, i) {
      return `<a class="sr-item" role="option" href="${titleUrl(t.key)}" data-i="${i}">
        <img src="${esc(artOf(t))}" alt="" width="72" height="40" loading="lazy">
        <div><div class="t">${esc(t.title)}</div>
        <div class="s">${esc(t.category)} · ${esc(t.year)} · ${esc(t.meta)}</div></div>
      </a>`;
    }

    function close() {
      $dd.hidden = true; kb = -1; $input.setAttribute('aria-expanded', 'false');
    }

    function render() {
      const q = $input.value.trim();
      kb = -1;
      if (!q) { close(); $dd.innerHTML = ''; return; }
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      hits = CATALOG.map((t) => ({ t, s: score(t, terms) }))
        .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 8);
      $dd.hidden = false;
      $input.setAttribute('aria-expanded', 'true');
      $dd.innerHTML = hits.length
        ? hits.map((h, i) => itemHTML(h.t, i)).join('')
        : `<div class="sr-empty">No titles match “${esc(q)}”. Try browsing
             <a href="movies.html">Movies</a> or <a href="series.html">Series</a>.</div>`;
    }

    function highlight() {
      const items = $dd.querySelectorAll('.sr-item');
      items.forEach((el, i) => el.classList.toggle('kb-focus', i === kb));
      if (items[kb]) items[kb].scrollIntoView({ block: 'nearest' });
    }

    $input.addEventListener('input', render);
    $input.addEventListener('focus', () => { if ($input.value.trim()) render(); });
    $btn.addEventListener('click', () => { $input.focus(); render(); });
    $input.addEventListener('keydown', (e) => {
      const items = $dd.querySelectorAll('.sr-item');
      if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); kb = (kb + 1) % items.length; highlight(); }
      else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); kb = (kb - 1 + items.length) % items.length; highlight(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const pick = kb >= 0 ? hits[kb] : hits[0];
        if (pick) window.location.href = titleUrl(pick.t.key);
      } else if (e.key === 'Escape') close();
    });
    document.addEventListener('click', (e) => {
      if (!$input.parentElement.contains(e.target)) close();
    });
  }

  /* ---------- poster images that fail to load get a styled fallback ---------- */
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.classList.contains('poster-bg')) { img.remove(); return; }
    if (!img.classList.contains('poster')) return;
    const t = CATALOG.find((x) => img.src === artOf(x)) || { title: img.alt.replace(/ poster$/, ''), kind: 'movie' };
    const wrap = document.createElement('div');
    wrap.innerHTML = posterFallbackHTML(t);
    img.replaceWith(wrap.firstElementChild);
  }, true);

  document.addEventListener('DOMContentLoaded', mountChrome);
})();
