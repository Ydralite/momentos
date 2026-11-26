/**
 * PHOTO SAFE — recolha de dados para Google Sheets.
 *
 * Instalação (5 min):
 *  1. Cria uma Google Sheet nova (conta pessoal).
 *  2. Extensões > Apps Script. Apaga o conteúdo e cola este ficheiro. Guarda.
 *  3. Implementar > Nova implementação > tipo "Aplicação Web".
 *       Executar como: Eu   |   Quem tem acesso: Qualquer pessoa
 *  4. Autoriza, copia o URL que termina em /exec e cola-o em config.js (APPS_SCRIPT_URL).
 *  Se alterares este código depois: Implementar > Gerir implementações > editar > Versão: Nova versão.
 *
 * Folhas criadas automaticamente:
 *  - participantes: uma linha por pessoa (condição, perfil, totais, respostas)
 *  - publicacoes:   uma linha por pessoa x publicação (tempo, gosto, comentários, selo)
 * A página envia o estado completo várias vezes; cada envio atualiza as mesmas linhas (sem duplicados).
 */

var PARTICIPANT_HEADERS = [
  'session_id', 'created_at', 'updated_at', 'seq', 'test', 'study_version',
  'feed_ai_pct', 'stamps_arm', 'assignment', 'stage',
  'age_band', 'social_time',
  'posts_seen', 'feed_completed', 'feed_ms', 'likes', 'likes_ai', 'likes_real', 'comments_opened', 'stamp_taps',
  'quiz_completed', 'q1_sem_selo', 'q2_quer_selo', 'q3_confianca', 'q4_ver_origem', 'q5_texto',
  'device', 'viewport', 'user_agent', 'started_at',
  'q0_quantas_ia', 'ai_real'   // acrescentadas na v2: estimativa da pessoa vs. nº real de imagens IA
];

var POST_HEADERS = [
  'key', 'session_id', 'updated_at', 'test', 'feed_ai_pct', 'stamps_arm',
  'position', 'image_id', 'category', 'is_ai', 'stamp_shown',
  'seen', 'views', 'dwell_ms', 'dwell_raw_ms', 'first_seen_s',
  'liked', 'like_toggles', 'doubletap_likes', 'comments_opened', 'comments_ms', 'stamp_taps', 'stamp_ms'
];

var P_SHEET = 'participantes';
var POST_SHEET = 'publicacoes';

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var data = JSON.parse(e && e.postData && e.postData.contents || '{}');
    var s = data.session;
    var posts = Array.isArray(data.posts) ? data.posts : [];
    if (!s || !/^[A-Za-z0-9-]{8,64}$/.test(String(s.session_id || ''))) return json_({ ok: false, error: 'bad session' });
    if (posts.length > 30) return json_({ ok: false, error: 'too many posts' });

    lock.waitLock(25000);
    locked = true;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var pSheet = sheet_(ss, P_SHEET, PARTICIPANT_HEADERS);
    var postSheet = sheet_(ss, POST_SHEET, POST_HEADERS);
    var now = new Date();
    var sid = String(s.session_id);

    // ---- participantes ----
    var pRow = findRows_(pSheet, [sid])[sid];
    var createdAt = now;
    if (pRow) {
      var existing = pSheet.getRange(pRow, 1, 1, PARTICIPANT_HEADERS.length).getValues()[0];
      var storedSeq = Number(existing[PARTICIPANT_HEADERS.indexOf('seq')]) || 0;
      if (Number(s.seq) < storedSeq) return json_({ ok: true, stale: true });
      createdAt = existing[PARTICIPANT_HEADERS.indexOf('created_at')] || now;
    }
    var pValues = PARTICIPANT_HEADERS.map(function (h) {
      if (h === 'created_at') return createdAt;
      if (h === 'updated_at') return now;
      return clean_(s[h]);
    });
    if (pRow) pSheet.getRange(pRow, 1, 1, pValues.length).setValues([pValues]);
    else pSheet.getRange(pSheet.getLastRow() + 1, 1, 1, pValues.length).setValues([pValues]);

    // ---- publicações ----
    if (posts.length) {
      var rows = posts.map(function (p) {
        var key = sid + '|' + clean_(p.position);
        return POST_HEADERS.map(function (h) {
          if (h === 'key') return key;
          if (h === 'session_id') return sid;
          if (h === 'updated_at') return now;
          return clean_(p[h]);
        });
      });
      var keys = rows.map(function (r) { return r[0]; });
      var found = findRows_(postSheet, keys);
      var updates = [], inserts = [];
      rows.forEach(function (r) { if (found[r[0]]) updates.push({ row: found[r[0]], values: r }); else inserts.push(r); });

      // linhas da mesma sessão costumam ser contíguas: escrever num só bloco quando possível
      var contiguous = updates.length > 1 && updates.every(function (u, i) { return i === 0 || u.row === updates[i - 1].row + 1; });
      if (contiguous) {
        postSheet.getRange(updates[0].row, 1, updates.length, POST_HEADERS.length)
          .setValues(updates.map(function (u) { return u.values; }));
      } else {
        updates.forEach(function (u) { postSheet.getRange(u.row, 1, 1, POST_HEADERS.length).setValues([u.values]); });
      }
      if (inserts.length) postSheet.getRange(postSheet.getLastRow() + 1, 1, inserts.length, POST_HEADERS.length).setValues(inserts);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

/** GET ?action=counts -> nº de participantes (não-teste) por célula, para equilibrar a atribuição. */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action !== 'counts') return json_({ ok: true, service: 'photo-safe' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = sheet_(ss, P_SHEET, PARTICIPANT_HEADERS);
  var counts = {};
  var last = sh.getLastRow();
  if (last > 1) {
    var values = sh.getRange(2, 1, last - 1, PARTICIPANT_HEADERS.length).getValues();
    var iF = PARTICIPANT_HEADERS.indexOf('feed_ai_pct');
    var iA = PARTICIPANT_HEADERS.indexOf('stamps_arm');
    var iT = PARTICIPANT_HEADERS.indexOf('test');
    values.forEach(function (r) {
      var isTest = r[iT] === true || String(r[iT]).toUpperCase() === 'TRUE';
      if (isTest || r[iF] === '' || r[iA] === '') return;
      var k = Number(r[iF]) + '|' + String(r[iA]);
      counts[k] = (counts[k] || 0) + 1;
    });
  }
  return json_({ ok: true, counts: counts });
}

// ---------- auxiliares ----------
function sheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  } else {
    // acrescenta colunas novas ao cabeçalho de uma folha já existente
    var cur = sh.getRange(1, 1, 1, headers.length).getValues()[0];
    if (cur.join('|') !== headers.join('|')) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sh;
}

/** Devolve {chave: nº da linha} para as chaves pedidas, procurando na coluna A. */
function findRows_(sh, keys) {
  var out = {};
  var last = sh.getLastRow();
  if (last < 2) return out;
  var want = {};
  keys.forEach(function (k) { want[k] = true; });
  var col = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    var k = String(col[i][0]);
    if (want[k]) out[k] = i + 2;
  }
  return out;
}

/** Normaliza valores e impede fórmulas injetadas no texto livre. */
function clean_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean' || typeof v === 'number') return v;
  var s = String(v).slice(0, 1000);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
