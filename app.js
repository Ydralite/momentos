/* PHOTO SAFE — estudo de feed. Sem dependências. */
(() => {
  'use strict';

  const C = window.STUDY_CONFIG || {};
  const MANIFEST = Array.isArray(window.PHOTO_MANIFEST) ? window.PHOTO_MANIFEST : [];
  const params = new URLSearchParams(location.search);
  const isLocal = location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
  const ENDPOINT = (isLocal && params.get('endpoint')) || C.APPS_SCRIPT_URL || '';
  const OVERRIDE_FEED = params.get('feed');
  const OVERRIDE_STAMPS = params.get('stamps');
  const TEST = params.has('test') || isLocal || !!OVERRIDE_FEED || !!OVERRIDE_STAMPS;
  const DEBUG = params.has('debug');
  const DONE_KEY = 'photosafe_done_' + (C.STUDY_VERSION || 'v1');

  const $ = (s, el = document) => el.querySelector(s);
  const now = () => performance.now();

  // ---------- utilitários ----------
  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (a) => a[rnd(a.length)];
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (a, n) => shuffle(a.slice()).slice(0, n);
  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = rnd(16); return (c === 'x' ? r : (r & 3) | 8).toString(16);
    });
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignorar */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* ignorar */ } }
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function colorFor(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360; return `hsl(${h} 45% 55%)`; }

  // ---------- conteúdo (PT-PT) ----------
  const CONTENT = window.POST_CONTENT || {};
  const NAMES_FALLBACK = ['ana.martins', 'joao.ferreira_', 'rita.sousa', 'migueldcosta', 'ines_lopes', 'tiago.rocha',
    'catarina.mp', 'pedro_alves', 'sofia.reis', 'diogo.santos', 'mariana.fc', 'ricardo.pinto', 'beatriz.gomes',
    'andre_mendes', 'carla.nunes', 'nuno.teixeira', 'joana.silva_', 'bruno.moreira', 'leonor.ac', 'hugo.correia',
    'marta.v', 'goncalo.r', 'filipa.dias', 'rui.carvalho', 'teresa.b', 'vasco.lima'];
  const USERNAMES = (Array.isArray(window.POST_NAMES) && window.POST_NAMES.length >= 12)
    ? window.POST_NAMES.map(n => String(n).trim()).filter(Boolean) : NAMES_FALLBACK;
  function initials(name) {
    const parts = name.replace(/[._]/g, ' ').trim().split(/\s+/);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
  function contentFor(img) {
    const c = CONTENT[img.src] || CONTENT[img.pair];
    if (c && c.caption) return { caption: c.caption, comments: (c.comments || []).slice(0, 3) };
    return { caption: pick(CAPTIONS[img.category] || ['']), comments: sample(COMMENTS, 3) };
  }
  const CAPTIONS = {
    animais: ['Domingo preguiçoso 🐾', 'O verdadeiro dono da casa', 'Quem resiste a esta cara?', 'Hora da sesta'],
    comida: ['Jantar de hoje', 'Valeu cada garfada', 'Receita nova, aprovada ✅', 'Mesa posta 😋'],
    natureza: ['Precisava disto', 'Ar puro 🌿', 'Fim de semana fora da cidade', 'O sítio perfeito para desligar'],
    pessoas: ['Bons momentos', 'Com quem importa ❤️', 'Dias assim', 'Recordações'],
    cidade: ['Perdido pelas ruas', 'Postal de hoje', 'Volto já 📍', 'Explorar sem pressa']
  };
  const COMMENTS = ['Que espetáculo 😍', 'Adoro!', 'Lindo 👏', 'Que inveja 😅', 'Top 🔥', 'Uau', 'Que bom 😊',
    'Perfeito', '❤️❤️', 'Boa!', 'Isto sim 🙌', 'Que giro!', 'Partilha mais!', 'Fantástico', 'Mesmo bom', 'Adorei isto'];
  const AGO = ['2 h', '3 h', '5 h', '1 d', '2 d'];

  const ICON = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="stroke" d="M12 20.3s-7.1-4.4-9.2-8.6C1.2 8.4 3 4.8 6.6 4.6c2.2-.1 4 1.2 5.4 3 1.4-1.8 3.2-3.1 5.4-3 3.6.2 5.4 3.8 3.8 7.1-2.1 4.2-9.2 8.6-9.2 8.6z" fill="none" stroke="#1f1f1f" stroke-width="1.9" stroke-linejoin="round"/><path class="fill" d="M12 20.3s-7.1-4.4-9.2-8.6C1.2 8.4 3 4.8 6.6 4.6c2.2-.1 4 1.2 5.4 3 1.4-1.8 3.2-3.1 5.4-3 3.6.2 5.4 3.8 3.8 7.1-2.1 4.2-9.2 8.6-9.2 8.6z" fill="#ed4956"/></svg>',
    heartSolid: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.1-4.4-9.2-8.6C1.2 8.4 3 4.8 6.6 4.6c2.2-.1 4 1.2 5.4 3 1.4-1.8 3.2-3.1 5.4-3 3.6.2 5.4 3.8 3.8 7.1-2.1 4.2-9.2 8.6-9.2 8.6z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 16.6A8.6 8.6 0 1 0 17 20.1L21.3 21z" fill="none" stroke="#1f1f1f" stroke-width="1.9" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 4.5 5.4v5.8c0 4.7 3.2 8.8 7.5 10.3 4.3-1.5 7.5-5.6 7.5-10.3V5.4z" fill="currentColor"/><path d="m8.4 12.1 2.5 2.5 4.8-5" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function stampEl(isStatic) {
    const b = el(isStatic ? 'span' : 'button', 'stamp' + (isStatic ? ' static' : ''));
    if (!isStatic) b.type = 'button';
    b.innerHTML = ICON.shield;
    b.appendChild(el('span', 'brand', C.STAMP_BRAND || 'PHOTO SAFE'));
    b.appendChild(document.createTextNode(' · ' + (C.STAMP_LABEL || 'Feita por humano')));
    return b;
  }

  // ---------- estado ----------
  const S = {
    session_id: uuid(),
    seq: 0,
    stage: 'intro',
    started_at: new Date().toISOString(),
    assignment: null,      // {feed, stamps, method}
    profile: {},
    posts: [],             // publicações montadas
    track: [],             // métricas por publicação
    feedStart: null, feedEnd: null,
    active: -1, activeStart: null,
    sheet: null,           // {type, i, start}
    quiz: {},
    quizDone: false
  };

  // ---------- desenho experimental ----------
  function buildFeed(aiPct, arm) {
    const cats = C.CATEGORIES, per = C.PER_CATEGORY, n = C.POSTS_PER_FEED;
    const nAI = Math.round(n * aiPct / 100);
    // agrupar por par (real-x-n e ai-x-n): nunca mostrar as duas versões ao mesmo participante
    const pairs = {};
    for (const c of cats) {
      const groups = {};
      MANIFEST.filter(m => m.category === c).forEach(m => {
        const key = m.pair || m.id;
        (groups[key] = groups[key] || {})[m.ai ? 'ai' : 'real'] = m;
      });
      pairs[c] = Object.values(groups);
    }
    // escolher, por categoria, k pares com versão IA e (per - k) pares com versão real, todos distintos
    function canFill(c, k) {
      const ps = pairs[c];
      const aiOnly = ps.filter(p => p.ai && !p.real).length;
      const realOnly = ps.filter(p => p.real && !p.ai).length;
      const both = ps.filter(p => p.ai && p.real).length;
      // os pares completos cobrem o que falta de cada lado, sem repetir pares
      return Math.max(0, k - aiOnly) + Math.max(0, per - k - realOnly) <= both;
    }
    const valid = [];
    (function rec(i, acc, sum) {
      if (i === cats.length) { if (sum === nAI) valid.push(acc.slice()); return; }
      for (let k = 0; k <= per; k++) {
        if (!canFill(cats[i], k)) continue;
        acc.push(k); rec(i + 1, acc, sum + k); acc.pop();
      }
    })(0, [], 0);
    if (!valid.length) throw new Error('Imagens insuficientes no manifest para um feed com ' + aiPct + '% IA.');
    const alloc = pick(valid);
    let imgs = [];
    cats.forEach((c, i) => {
      const k = alloc[i];
      const ps = shuffle(pairs[c].slice());
      // primeiro os pares que só têm uma versão (para não desperdiçar os completos), depois os completos
      const aiOnly = ps.filter(p => p.ai && !p.real), realOnly = ps.filter(p => p.real && !p.ai), both = ps.filter(p => p.ai && p.real);
      const aiPick = aiOnly.slice(0, k);
      const realPick = realOnly.slice(0, per - k);
      const rest = both.slice();
      while (aiPick.length < k) aiPick.push(rest.shift());
      while (realPick.length < per - k) realPick.push(rest.shift());
      imgs = imgs.concat(aiPick.map(p => p.ai), realPick.map(p => p.real));
    });
    shuffle(imgs);

    const stamped = new Set();
    if (arm === 'B') {
      const reals = imgs.filter(m => !m.ai);
      sample(reals, Math.round(reals.length * C.STAMP_SHARE)).forEach(m => stamped.add(m.id));
    }
    const authors = sample(USERNAMES, imgs.length);
    return imgs.map((img, i) => {
      const others = USERNAMES.filter(u => u !== authors[i]);
      const content = contentFor(img);
      const commenters = sample(others, content.comments.length);
      return {
        position: i + 1, img, stamp: stamped.has(img.id), user: authors[i],
        caption: content.caption,
        comments: content.comments.map((t, j) => ({ user: commenters[j], text: t, ago: pick(AGO) }))
      };
    });
  }

  async function fetchCounts(ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(ENDPOINT + (ENDPOINT.includes('?') ? '&' : '?') + 'action=counts', { signal: ctl.signal });
      const j = await r.json();
      return j && j.counts ? j.counts : null;
    } finally { clearTimeout(t); }
  }

  async function assign() {
    const feeds = C.FEEDS, arms = C.STAMP_ARMS;
    if (OVERRIDE_FEED || OVERRIDE_STAMPS) {
      const f = feeds.includes(Number(OVERRIDE_FEED)) ? Number(OVERRIDE_FEED) : pick(feeds);
      const a = arms.includes(OVERRIDE_STAMPS) ? OVERRIDE_STAMPS : pick(arms);
      return { feed: f, stamps: a, method: 'override' };
    }
    const cells = [];
    feeds.forEach(f => arms.forEach(a => cells.push([f, a])));
    if (ENDPOINT) {
      try {
        const counts = await fetchCounts(3000);
        if (counts) {
          const c = (f, a) => Number(counts[f + '|' + a] || 0);
          const min = Math.min(...cells.map(([f, a]) => c(f, a)));
          const [f, a] = pick(cells.filter(([f2, a2]) => c(f2, a2) === min));
          return { feed: f, stamps: a, method: 'balanced' };
        }
      } catch (e) { /* cai para aleatório */ }
    }
    const [f, a] = pick(cells);
    return { feed: f, stamps: a, method: 'random' };
  }

  // ---------- registo / envio ----------
  function liveDwell(i) {
    const t = S.track[i];
    return t.dwell_raw_ms + (S.active === i && S.activeStart != null ? now() - S.activeStart : 0);
  }
  function liveSheet(i, type) {
    const t = S.track[i];
    const base = type === 'comments' ? t.comments_ms : t.stamp_ms;
    return base + (S.sheet && S.sheet.i === i && S.sheet.type === type && S.sheet.start != null ? now() - S.sheet.start : 0);
  }

  function snapshot() {
    const a = S.assignment || {};
    const posts = S.posts.map((p, i) => {
      const t = S.track[i];
      const raw = Math.round(liveDwell(i));
      return {
        session_id: S.session_id, test: TEST, feed_ai_pct: a.feed, stamps_arm: a.stamps,
        position: p.position, image_id: p.img.src || p.img.id, category: p.img.category, is_ai: !!p.img.ai,
        stamp_shown: p.stamp, seen: t.seen, views: t.views,
        dwell_ms: Math.min(raw, C.DWELL_CAP_MS), dwell_raw_ms: raw,
        first_seen_s: t.first_seen_s, liked: t.liked, like_toggles: t.like_toggles,
        doubletap_likes: t.doubletap_likes, comments_opened: t.comments_opened,
        comments_ms: Math.round(liveSheet(i, 'comments')), stamp_taps: t.stamp_taps,
        stamp_ms: Math.round(liveSheet(i, 'stamp'))
      };
    });
    const liked = posts.filter(p => p.liked);
    const feedMs = S.feedStart == null ? 0 : Math.round((S.feedEnd || now()) - S.feedStart);
    S.seq += 1;
    return {
      session: {
        session_id: S.session_id, seq: S.seq, test: TEST, study_version: C.STUDY_VERSION,
        feed_ai_pct: a.feed, stamps_arm: a.stamps, assignment: a.method, stage: S.stage,
        age_band: S.profile.age_band || '', social_time: S.profile.social_time || '',
        posts_seen: posts.filter(p => p.seen).length, feed_completed: S.feedEnd != null, feed_ms: feedMs,
        likes: liked.length, likes_ai: liked.filter(p => p.is_ai).length, likes_real: liked.filter(p => !p.is_ai).length,
        comments_opened: posts.reduce((s, p) => s + p.comments_opened, 0),
        stamp_taps: posts.reduce((s, p) => s + p.stamp_taps, 0),
        quiz_completed: S.quizDone,
        q0_quantas_ia: S.quiz.q0 || '', ai_real: S.posts.filter(p => p.img.ai).length,
        q1_sem_selo: S.quiz.q1 || '', q2_quer_selo: S.quiz.q2 || '', q3_confianca: S.quiz.q3 || '',
        q4_ver_origem: S.quiz.q4 || '', q5_texto: S.quiz.q5 || '',
        device: (matchMedia('(pointer: coarse)').matches ? 'touch' : 'desktop'),
        viewport: innerWidth + 'x' + innerHeight,
        user_agent: (navigator.userAgent || '').slice(0, 250),
        started_at: S.started_at
      },
      posts
    };
  }

  let inflight = false, dirty = false, sendTimer = null;
  function logLocal(snap) { window.__photosafe = window.__photosafe || []; window.__photosafe.push(snap); if (DEBUG) console.log('[photosafe]', snap); }

  async function sendNow() {
    if (S.stage === 'intro') return;
    if (inflight) { dirty = true; return; }
    const snap = snapshot();
    logLocal(snap);
    if (!ENDPOINT) return;
    inflight = true; dirty = false;
    try {
      await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(snap) });
    } catch (e) { /* tentar de novo no próximo envio */ }
    inflight = false;
    if (dirty) sendNow();
  }
  function sendSoon(ms = 700) { clearTimeout(sendTimer); sendTimer = setTimeout(sendNow, ms); }
  function sendBeaconNow() {
    if (S.stage === 'intro') return;
    const snap = snapshot();
    logLocal(snap);
    if (!ENDPOINT) return;
    const body = JSON.stringify(snap);
    let ok = false;
    try { ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain;charset=utf-8' })); } catch (e) { ok = false; }
    if (!ok) { try { fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body }); } catch (e) { /* nada */ } }
  }

  // ---------- ecrãs ----------
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
    window.scrollTo(0, 0);
  }
  function fail(msg) { $('#error-text').textContent = msg; show('screen-error'); }

  // ---------- feed: render ----------
  function renderFeed() {
    const box = $('#feed-scroll');
    box.textContent = '';
    S.posts.forEach((p, i) => {
      const sec = el('section', 'post'); sec.dataset.i = i;
      const inner = el('div', 'post-inner');

      const head = el('header', 'post-head');
      const av = el('div', 'avatar', initials(p.user)); av.style.background = colorFor(p.user);
      const who = el('div', 'who');
      who.appendChild(el('div', 'uname', p.user));
      if (p.stamp) {
        const st = stampEl(false);
        st.addEventListener('click', (e) => { e.stopPropagation(); openStamp(i); });
        who.appendChild(st);
      }
      head.append(av, who, el('span', 'more', '···'));

      const media = el('div', 'media');
      const img = el('img'); img.src = p.img.file; img.alt = ''; img.draggable = false;
      img.decoding = 'async';
      const burst = el('div', 'burst'); burst.innerHTML = ICON.heartSolid;
      media.append(img, burst);
      if (DEBUG) media.appendChild(el('div', 'debug-tag', (p.img.ai ? 'IA' : 'REAL') + ' · ' + p.img.id + (p.stamp ? ' · selo' : '')));
      attachDoubleTap(media, i, burst);

      const actions = el('div', 'actions');
      const likeBtn = el('button', 'icon-btn like'); likeBtn.type = 'button'; likeBtn.setAttribute('aria-label', 'Gosto');
      likeBtn.innerHTML = ICON.heart;
      likeBtn.addEventListener('click', () => toggleLike(i));
      const comBtn = el('button', 'icon-btn'); comBtn.type = 'button'; comBtn.setAttribute('aria-label', 'Comentários');
      comBtn.innerHTML = ICON.comment;
      comBtn.addEventListener('click', () => openComments(i));
      actions.append(likeBtn, comBtn);

      const cap = el('div', 'caption'); cap.appendChild(el('b', null, p.user)); cap.appendChild(document.createTextNode(p.caption));
      const vc = el('button', 'view-comments', `Ver os ${p.comments.length} comentários`); vc.type = 'button';
      vc.addEventListener('click', () => openComments(i));

      inner.append(head, media, actions, cap, vc);
      sec.appendChild(inner);
      box.appendChild(sec);
      p._likeBtn = likeBtn;
    });

    const end = el('section', 'end-card'); end.dataset.end = '1';
    const card = el('div', 'card');
    card.appendChild(el('h2', null, 'Chegaste ao fim do feed 🎉'));
    card.appendChild(el('p', null, 'Faltam só 6 perguntas rápidas.'));
    const btn = el('button', 'btn primary', 'Continuar'); btn.type = 'button';
    btn.addEventListener('click', startQuiz);
    card.appendChild(btn);
    end.appendChild(card);
    box.appendChild(end);
  }

  function setLikeUI(i, pop) {
    const b = S.posts[i]._likeBtn;
    b.classList.toggle('on', S.track[i].liked);
    b.setAttribute('aria-pressed', S.track[i].liked ? 'true' : 'false');
    if (pop) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  }
  function toggleLike(i) {
    const t = S.track[i];
    t.liked = !t.liked; t.like_toggles += 1;
    setLikeUI(i, true); sendSoon();
  }
  function attachDoubleTap(media, i, burst) {
    let last = 0;
    media.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const t = Date.now();
      if (t - last < 320) {
        last = 0;
        burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go');
        const tr = S.track[i];
        tr.doubletap_likes += 1;
        if (!tr.liked) { tr.liked = true; tr.like_toggles += 1; setLikeUI(i, true); }
        sendSoon();
      } else last = t;
    });
    media.addEventListener('dblclick', (e) => e.preventDefault());
  }

  // ---------- folhas ----------
  function openSheet(type, i, title, buildBody) {
    closeSheet(true);
    S.sheet = { type, i, start: document.hidden ? null : now() };
    $('#sheet-title').textContent = title;
    const body = $('#sheet-body'); body.textContent = '';
    buildBody(body);
    $('#sheet').hidden = false; $('#sheet-backdrop').hidden = false;
  }
  function closeSheet(silent) {
    if (!S.sheet) return;
    const { type, i, start } = S.sheet;
    if (start != null) {
      const d = now() - start;
      if (type === 'comments') S.track[i].comments_ms += d; else S.track[i].stamp_ms += d;
    }
    S.sheet = null;
    $('#sheet').hidden = true; $('#sheet-backdrop').hidden = true;
    if (!silent) sendSoon();
  }
  function openComments(i) {
    S.track[i].comments_opened += 1;
    const p = S.posts[i];
    openSheet('comments', i, 'Comentários', (body) => {
      p.comments.forEach(c => {
        const row = el('div', 'comment');
        const av = el('div', 'avatar', initials(c.user)); av.style.background = colorFor(c.user);
        const txt = el('div');
        const line = el('div', 'comment-text'); line.appendChild(el('b', null, c.user)); line.appendChild(document.createTextNode(c.text));
        txt.append(line, el('div', 'comment-meta', c.ago));
        row.append(av, txt); body.appendChild(row);
      });
    });
    sendSoon();
  }
  function fmtDate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  function openStamp(i) {
    S.track[i].stamp_taps += 1;
    const img = S.posts[i].img;
    openSheet('stamp', i, 'Credencial de conteúdo', (body) => {
      const box = el('div', 'prov');
      const st = el('div', 'prov-status'); st.innerHTML = ICON.shield;
      st.appendChild(document.createTextNode('Verificada pelo ' + (C.STAMP_BRAND || 'PHOTO SAFE')));
      box.appendChild(st);
      const rows = [['Origem', 'Captada por câmara'], ['Dispositivo', img.device || 'Smartphone']];
      const d = fmtDate(img.captured); if (d) rows.push(['Data de captura', d]);
      rows.push(['Edições', 'Nenhuma registada'], ['Ferramentas de IA', 'Nenhuma']);
      rows.forEach(([k, v]) => { const r = el('div', 'prov-row'); r.append(el('span', null, k), el('span', null, v)); box.appendChild(r); });
      box.appendChild(el('p', 'prov-note', 'A credencial mostra a origem técnica da imagem. Não garante que aquilo que a imagem mostra é verdade.'));
      body.appendChild(box);
    });
    sendSoon();
  }

  // ---------- feed: medição ----------
  function setActive(i) {
    if (S.active === i) return;
    if (S.active >= 0 && S.activeStart != null) S.track[S.active].dwell_raw_ms += now() - S.activeStart;
    S.active = i;
    S.activeStart = (i >= 0 && !document.hidden) ? now() : null;
    if (i >= 0) {
      const t = S.track[i];
      t.views += 1;
      if (!t.seen) { t.seen = true; t.first_seen_s = Math.round((now() - S.feedStart) / 100) / 10; }
      $('#progress-bar').style.width = ((i + 1) / S.posts.length * 100) + '%';
      if (i > 0) $('#swipe-hint').classList.add('gone');
    }
    sendSoon();
  }

  function startFeed() {
    S.stage = 'feed';
    S.track = S.posts.map(() => ({ seen: false, views: 0, dwell_raw_ms: 0, first_seen_s: '', liked: false,
      like_toggles: 0, doubletap_likes: 0, comments_opened: 0, comments_ms: 0, stamp_taps: 0, stamp_ms: 0 }));
    renderFeed();
    if (!matchMedia('(pointer: coarse)').matches) $('#swipe-hint').textContent = 'Usa a roda do rato ou ↓ para avançar';
    show('screen-feed');
    S.feedStart = now();
    const box = $('#feed-scroll');
    box.scrollTop = 0; box.focus({ preventScroll: true });

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const isEnd = e.target.dataset.end === '1';
        const idx = isEnd ? -1 : Number(e.target.dataset.i);
        if (e.intersectionRatio >= C.VISIBLE_THRESHOLD) {
          if (isEnd) {
            setActive(-1);
            if (S.feedEnd == null) { S.feedEnd = now(); S.stage = 'fim_feed'; $('#progress-bar').style.width = '100%'; sendSoon(100); }
          } else setActive(idx);
        } else if (!isEnd && S.active === idx) {
          setActive(-1);
        }
      }
    }, { root: box, threshold: [0, C.VISIBLE_THRESHOLD, 1] });
    box.querySelectorAll('.post, .end-card').forEach(s => io.observe(s));
    S._io = io;

    box.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); box.scrollBy({ top: box.clientHeight, behavior: 'smooth' }); }
      if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); box.scrollBy({ top: -box.clientHeight, behavior: 'smooth' }); }
    });
    sendNow();
  }

  // pausa quando a página fica escondida
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (S.active >= 0 && S.activeStart != null) { S.track[S.active].dwell_raw_ms += now() - S.activeStart; S.activeStart = null; }
      if (S.sheet && S.sheet.start != null) {
        const d = now() - S.sheet.start;
        if (S.sheet.type === 'comments') S.track[S.sheet.i].comments_ms += d; else S.track[S.sheet.i].stamp_ms += d;
        S.sheet.start = null;
      }
      sendBeaconNow();
    } else {
      if (S.active >= 0 && S.activeStart == null && (S.stage === 'feed' || S.stage === 'fim_feed')) S.activeStart = now();
      if (S.sheet && S.sheet.start == null) S.sheet.start = now();
    }
  });
  window.addEventListener('pagehide', sendBeaconNow);

  $('#sheet-close').addEventListener('click', () => closeSheet());
  $('#sheet-backdrop').addEventListener('click', () => closeSheet());

  // ---------- questionário ----------
  const QUESTIONS = [
    { id: 'q0', type: 'number', max: () => S.posts.length, thenIntro: true,
      text: () => `Antes de mais: das ${S.posts.length} imagens que acabaste de ver, quantas achas que foram geradas por IA?` },
    { id: 'q1', type: 'choice', text: 'Uma fotografia sem selo PHOTO SAFE é…', shuffleFirst: 3,
      options: [['provavelmente_falsa', 'Provavelmente falsa ou manipulada'], ['gerada_ia', 'Provavelmente gerada por IA'],
        ['nao_verificada', 'Não verificada — pode ser real ou gerada por IA'], ['nao_sei', 'Não sei']] },
    { id: 'q2', type: 'choice', text: () => `Gostarias de ver o selo «${C.STAMP_LABEL}» nas fotografias do teu feed?`,
      options: [['1', 'Definitivamente não'], ['2', 'Provavelmente não'], ['3', 'Indiferente'], ['4', 'Provavelmente sim'], ['5', 'Definitivamente sim']] },
    { id: 'q3', type: 'choice', text: () => `O selo «${C.STAMP_LABEL}» mudaria a confiança que tens numa fotografia?`,
      options: [['1', 'Confiaria muito menos'], ['2', 'Confiaria um pouco menos'], ['3', 'Igual'], ['4', 'Confiaria um pouco mais'], ['5', 'Confiaria muito mais']] },
    { id: 'q4', type: 'choice', text: 'Tocarias no selo para ver a origem da fotografia (câmara, edições, ferramentas de IA)?',
      options: [['muitas_vezes', 'Muitas vezes'], ['as_vezes', 'Às vezes'], ['nunca', 'Nunca']] },
    { id: 'q5', type: 'text', text: () => `Numa frase: o que mudaria para ti um selo «${C.STAMP_LABEL}»?`, optional: true }
  ];

  function startQuiz() {
    closeSheet(true);
    setActive(-1);
    if (S.feedEnd == null) S.feedEnd = now();
    if (S._io) S._io.disconnect();
    S.stage = 'quiz';
    sendNow();
    renderQuestion(0);
    show('screen-quiz');
  }

  function renderQuizIntro(nextK) {
    const card = $('#quiz-card'); card.textContent = '';
    card.appendChild(el('div', 'quiz-progress', 'Antes das próximas perguntas'));
    card.appendChild(el('h2', null, 'O que é o PHOTO SAFE?'));
    card.appendChild(el('p', null, 'O PHOTO SAFE é uma proposta para mostrar a origem das imagens nas redes sociais. Quando uma fotografia tem uma credencial verificável — por exemplo, foi captada por uma câmara e não foi alterada — aparece um selo como este:'));
    const demo = el('div', 'stamp-demo'); demo.appendChild(stampEl(true)); card.appendChild(demo);
    card.appendChild(el('p', null, 'O selo mostra de onde vem a imagem. Não garante que aquilo que ela mostra é verdade.'));
    const b = el('button', 'btn primary', 'Continuar'); b.type = 'button';
    b.addEventListener('click', () => renderQuestion(nextK));
    card.appendChild(b);
  }

  function renderQuestion(k) {
    const q = QUESTIONS[k];
    const card = $('#quiz-card'); card.textContent = '';
    card.appendChild(el('div', 'quiz-progress', `Pergunta ${k + 1} de ${QUESTIONS.length}`));
    card.appendChild(el('h2', null, typeof q.text === 'function' ? q.text() : q.text));
    const next = () => {
      sendSoon(150);
      if (k + 1 >= QUESTIONS.length) finish();
      else if (q.thenIntro) renderQuizIntro(k + 1);
      else renderQuestion(k + 1);
    };

    if (q.type === 'number') {
      const g = el('div', 'choice-group num-grid');
      const max = typeof q.max === 'function' ? q.max() : q.max;
      for (let v = 0; v <= max; v++) {
        const b = el('button', 'choice', String(v)); b.type = 'button';
        if (S.quiz[q.id] === String(v)) b.classList.add('selected');
        b.addEventListener('click', () => {
          S.quiz[q.id] = String(v);
          g.querySelectorAll('.choice').forEach(x => x.classList.toggle('selected', x === b));
          setTimeout(next, 220);
        });
        g.appendChild(b);
      }
      card.appendChild(g);
    } else if (q.type === 'choice') {
      const g = el('div', 'choice-group');
      // baralhar a ordem das primeiras opções (uma vez por pessoa) para evitar viés de posição
      if (q.shuffleFirst && !q._order) q._order = shuffle(q.options.slice(0, q.shuffleFirst)).concat(q.options.slice(q.shuffleFirst));
      (q._order || q.options).forEach(([v, label]) => {
        const b = el('button', 'choice', label); b.type = 'button';
        if (S.quiz[q.id] === v) b.classList.add('selected');
        b.addEventListener('click', () => {
          S.quiz[q.id] = v;
          g.querySelectorAll('.choice').forEach(x => x.classList.toggle('selected', x === b));
          setTimeout(next, 220);
        });
        g.appendChild(b);
      });
      card.appendChild(g);
    } else {
      const ta = el('textarea'); ta.maxLength = 500; ta.placeholder = 'Escreve aqui (opcional)'; ta.value = S.quiz[q.id] || '';
      card.appendChild(ta);
      const send = el('button', 'btn primary', 'Enviar'); send.type = 'button';
      send.addEventListener('click', () => { S.quiz[q.id] = ta.value.trim().slice(0, 500); next(); });
      const skip = el('button', 'btn ghost', 'Saltar'); skip.type = 'button';
      skip.addEventListener('click', () => { S.quiz[q.id] = ''; next(); });
      card.append(send, skip);
    }
  }

  function finish() {
    S.quizDone = true;
    S.stage = 'concluido';
    sendNow();
    if (!TEST) lsSet(DONE_KEY, '1');
    renderReveal();
    show('screen-reveal');
  }

  function renderReveal() {
    const card = $('#reveal-card'); card.textContent = '';
    const nAI = S.posts.filter(p => p.img.ai).length;
    const likedAI = S.posts.filter((p, i) => p.img.ai && S.track[i].liked).length;
    const likedReal = S.posts.filter((p, i) => !p.img.ai && S.track[i].liked).length;
    card.appendChild(el('h1', null, 'Obrigado por participares! 🙏'));
    card.appendChild(el('p', 'reveal-stat', `Das ${S.posts.length} imagens que viste, ${nAI} foram geradas por IA.`));
    if (S.quiz.q0 !== undefined && S.quiz.q0 !== '') {
      const g = Number(S.quiz.q0), d = Math.abs(g - nAI);
      card.appendChild(el('p', null, d === 0 ? `Achavas que eram ${g}. Acertaste em cheio! 🎯`
        : `Achavas que eram ${g}. Falhaste por ${d}.`));
    }
    card.appendChild(el('p', null, `Deste gosto a ${likedAI} ${likedAI === 1 ? 'imagem gerada' : 'imagens geradas'} por IA e a ${likedReal} ${likedReal === 1 ? 'fotografia real' : 'fotografias reais'}.`));
    const grid = el('div', 'reveal-grid');
    S.posts.forEach((p, i) => {
      const f = el('figure'); const im = el('img'); im.src = p.img.file; im.alt = '';
      f.appendChild(im);
      f.appendChild(el('figcaption', p.img.ai ? 'ai' : '', p.img.ai ? 'IA' : 'Real'));
      if (S.track[i].liked) f.appendChild(el('span', 'liked', '♥'));
      grid.appendChild(f);
    });
    card.appendChild(grid);
    const lg = el('div', 'legend'); lg.append(el('span', null, '♥ = deste gosto'));
    card.appendChild(lg);
    card.appendChild(el('p', 'small', 'Este estudo faz parte de um trabalho do Executive MBA do ISCTE sobre o PHOTO SAFE, uma proposta para tornar visível a origem das imagens nas redes sociais.'));
    if (S.assignment && S.assignment.stamps === 'B') {
      card.appendChild(el('p', 'small', 'Os selos PHOTO SAFE que viste foram simulados para este estudo.'));
    }
    card.appendChild(el('p', null, 'Por favor, não contes a quem ainda não participou — estragaria o teste 🤫'));
  }

  // ---------- arranque ----------
  async function boot() {
    if (params.has('reset')) lsDel(DONE_KEY);
    if (!TEST && lsGet(DONE_KEY)) { show('screen-done-before'); return; }
    if (!MANIFEST.length) { fail('Faltam as imagens (manifest.js vazio).'); return; }
    show('screen-intro');

    const startBtn = $('#btn-start');
    try {
      S.assignment = await assign();
      S.posts = buildFeed(S.assignment.feed, S.assignment.stamps);
    } catch (e) { fail(e.message || String(e)); return; }
    // pré-carregar as imagens enquanto a pessoa responde ao perfil
    S.posts.forEach(p => { const im = new Image(); im.src = p.img.file; });
    startBtn.disabled = false; startBtn.textContent = 'Aceito e quero começar';
    startBtn.addEventListener('click', () => { S.stage = 'perfil'; show('screen-profile'); });

    const profBtn = $('#btn-profile');
    document.querySelectorAll('#screen-profile .choice-group').forEach(g => {
      g.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
        S.profile[g.dataset.field] = b.dataset.value;
        g.querySelectorAll('.choice').forEach(x => x.classList.toggle('selected', x === b));
        profBtn.disabled = !(S.profile.age_band && S.profile.social_time);
      }));
    });
    profBtn.addEventListener('click', startFeed);
  }

  if (DEBUG) window.__buildFeed = buildFeed; // só para testes
  boot();
})();
