/* الدليل اليمني الشامل للأدوية — نسخة الويب
   لا خادم، لا تسجيل دخول، لا تتبّع. البيانات ملفات JSON محلية تُحمَّل
   من مجلد data/؛ الأساسية أولاً، وملفات الجولة الثانية عند الحاجة فقط. */
'use strict';

/* ================= أدوات ================= */
const $ = (s, r) => (r || document).querySelector(s);
const view = $('#view');

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }

/* نفس التطبيع في التطبيق الأصلي: أحرف صغيرة، NFKC، حذف التشكيل،
   أإآ→ا، ى→ي، ة→ه، دمج الفراغات. */
function normalize(s) {
  let t = (s || '').toLowerCase();
  t = t.normalize('NFKC');
  let out = '';
  for (const ch of t) {
    const cp = ch.codePointAt(0);
    if ((cp >= 0x064B && cp <= 0x065F) || cp === 0x0670 || ch === 'ـ') continue;
    if (ch === 'أ' || ch === 'إ' || ch === 'آ') out += 'ا';
    else if (ch === 'ى') out += 'ي';
    else if (ch === 'ة') out += 'ه';
    else out += ch;
  }
  return out.trim().replace(/\s+/g, ' ');
}

/* ================= أيقونات SVG ================= */
const ICONS = {
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M2 22h20"/><path d="M9 6h1M14 6h1M9 10h1M14 10h1M9 14h1M14 14h1M10 22v-4h4v4"/>',
  dollar: '<circle cx="12" cy="12" r="10"/><path d="M16.5 8.5c-.7-1-1.8-1.5-4.5-1.5s-3.6.7-3.6 2.1c0 3 8.2 1.5 8.2 4.4 0 1.4-1.4 2.1-4.1 2.1s-3.7-.5-4.5-1.5"/><path d="M12 5.5v13"/>',
  flask: '<path d="M10 2v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2"/><path d="M8.5 2h7"/><path d="M7 15h10"/>',
  interaction: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  shield: '<path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10Z"/><path d="m9 11.5 2 2 4-4"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  molecule: '<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="m6.8 6.8 3.4 3.4M17.2 6.8l-3.4 3.4M6.8 17.2l3.4-3.4M17.2 17.2l-3.4-3.4"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>',
  bottle: '<path d="M10 2h4"/><path d="M11 2v4.5L8 9v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9l-3-2.5V2"/><path d="M8 13h8"/>',
  sachet: '<rect x="3" y="8" width="12" height="13" rx="2" transform="rotate(-8 9 14)"/><rect x="10" y="3" width="12" height="13" rx="2" transform="rotate(10 16 9)"/>',
  tablets: '<rect x="2" y="9" width="11" height="7" rx="3.5" transform="rotate(-30 7.5 12.5)"/><rect x="11" y="9" width="11" height="7" rx="3.5" transform="rotate(30 16.5 12.5)"/>'
};
function icon(name, size) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="' + (size || 20) + '" height="' + (size || 20) + '" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}
function packIcon(pack) {
  const p = (pack || '').toLowerCase();
  if (p.indexOf('sachet') !== -1) return icon('sachet', 32);
  if (p.indexOf('ml') !== -1) return icon('bottle', 32);
  return icon('tablets', 32);
}

/* ================= الأقسام ================= */
const SECTIONS = [
  { key: 'agencies', title: 'الوكالات الدوائية', desc: 'قائمة الوكلاء المسجّلين في قاعدة البيانات — اضغط على أي وكيل لعرض أصنافه.', icon: 'building' },
  { key: 'priced', title: 'الأصناف المسعرة', desc: 'فهرس الأصناف المسجلة في قاعدة البيانات — اضغط على أي صنف لعرض تفاصيله.', icon: 'dollar' },
  { key: 'indications', title: 'دواعي الاستعمال', desc: 'دواعي الاستعمال المعتمدة من قاعدة بيانات التطبيق — اضغط على أي اسم علمي لعرض أصنافه.', icon: 'flask' },
  { key: 'interactions', title: 'التفاعلات الدوائية', desc: 'افحص التفاعل بين دوائين بالاسم العلمي.', icon: 'interaction' },
  { key: 'adverse', title: 'الآثار الجانبية', desc: 'الآثار الجانبية المسجلة مع عدد الأدوية المرتبطة بكل أثر.', icon: 'shield' },
  { key: 'diseases', title: 'فئة الأمراض', desc: 'فئات الأمراض مع عدد الأدوية المرتبطة بكل فئة.', icon: 'heart' },
  { key: 'directory', title: 'الدليل الطبي', desc: 'الدليل الطبي — قائمة الشركات المسجّلة في قاعدة البيانات، اضغط على أي شركة لعرض أصنافها.', icon: 'book' },
  { key: 'scientific', title: 'فئة الاسم العلمي', desc: 'فئات الأسماء العلمية مرتبة أبجدياً من قاعدة الأدوية — اضغط على أي اسم لعرض أصنافه.', icon: 'molecule' },
  { key: 'prescriptions', title: 'وصفة', desc: 'لا توجد بيانات وصفات في قاعدة البيانات.', icon: 'clipboard' }
];
function sectionMeta(key) {
  return SECTIONS.find(s => s.key === key) || SECTIONS[8];
}

/* ================= الحالة والبيانات ================= */
const state = {
  core: null,            // { scientific, drugs, proxies, companies, classById, classesBySci, sciById, proxyById, compById }
  haystacks: [],         // [[drug, normalizedHaystack]]
  extra: {},             // groupName -> true when loaded
  infoBySci: null, interNames: null, interIdByName: null,
  sciToInter: null, pairPosts: null, postsBySci: null,
  diseases: null, diseaseSciIds: null, sciDiseases: null,
  effects: null, effectSciIds: null, sciEffects: null,
  pregCat: null, pregBySci: null,
  searchQuery: '',
  sectionQuery: '',
  listShown: 100,
  pickA: null, pickB: null
};

async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error('تعذر تحميل ' + path + ' (' + r.status + ')');
  return r.json();
}

/* صفوف الربط: resultResponse عادةً قائمة، لكن بعض الصفوف في
   البيانات الأصلية قيمتها نص "NOT_DATA" — نعاملها كقائمة فارغة. */
function respRows(l) {
  const r = l.resultResponse;
  return Array.isArray(r) ? r : [];
}

async function loadCore() {
  const [scientific, d1, d2, d3, d4, proxies, companies, classes, classLinks] = await Promise.all([
    loadJSON('data/scientific.json'),
    loadJSON('data/drugs_1.json'), loadJSON('data/drugs_2.json'),
    loadJSON('data/drugs_3.json'), loadJSON('data/drugs_4.json'),
    loadJSON('data/proxy.json'), loadJSON('data/company.json'),
    loadJSON('data/classes.json'), loadJSON('data/class_links.json')
  ]);
  const drugs = d1.concat(d2, d3, d4);
  const sciById = {}, proxyById = {}, compById = {}, classById = {};
  scientific.forEach(s => { sciById[s.idScien] = s; });
  proxies.forEach(p => { proxyById[p.proxyId] = p; });
  companies.forEach(c => { compById[c.idproduct] = c; });
  classes.forEach(c => { classById[c.classId] = c; });
  const classesBySci = {};
  classLinks.forEach(l => {
    respRows(l).forEach(r => {
      const c = classById[r.classId];
      if (!c) return;
      (classesBySci[l.scientificId] = classesBySci[l.scientificId] || []).push(c);
    });
  });
  state.core = { scientific, drugs, proxies, companies, sciById, proxyById, compById, classesBySci };
  state.haystacks = drugs.map(d => {
    const s = sciById[d.idScien];
    return [d, normalize([d.drugName_en, d.drugName_ar, s ? s.scientificName_en : '', s ? s.scientificName_ar : '', d.pack].join(' '))];
  });
  $('#topbarNote').textContent = fmt(drugs.length) + ' دواء • ' + fmt(scientific.length) + ' اسم علمي • ' + fmt(proxies.length) + ' وكيل';
}

/* تحميل كسول لمجموعات الجولة الثانية — كل مجموعة مرة واحدة فقط. */
async function ensureExtra(group) {
  if (state.extra[group]) return;
  state.extra[group] = 'loading';
  try {
  if (group === 'info') {
    const info = await loadJSON('data/info.json');
    state.infoBySci = {};
    info.forEach(r => { if (r.scientificId) state.infoBySci[r.scientificId] = r; });
  } else if (group === 'diseases') {
    const [disease, links] = await Promise.all([loadJSON('data/disease.json'), loadJSON('data/disease_links.json')]);
    state.diseases = disease.filter(d => d.diseaseId && (d.diseaseEn || d.diseaseAr));
    state.diseaseSciIds = {}; state.sciDiseases = {};
    links.forEach(l => {
      respRows(l).forEach(r => {
        if (!r.diseaseId || !l.scientificId) return;
        (state.diseaseSciIds[r.diseaseId] = state.diseaseSciIds[r.diseaseId] || new Set()).add(l.scientificId);
        const list = (state.sciDiseases[l.scientificId] = state.sciDiseases[l.scientificId] || []);
        if (list.indexOf(r.diseaseId) === -1) list.push(r.diseaseId);
      });
    });
  } else if (group === 'effects') {
    const [eff, c1, c2] = await Promise.all([
      loadJSON('data/side_effects.json'),
      loadJSON('data/side_effects_links_1.json'), loadJSON('data/side_effects_links_2.json')
    ]);
    state.effects = eff.filter(e => e.effectsId);
    state.effectSciIds = {}; state.sciEffects = {};
    c1.concat(c2).forEach(l => {
      respRows(l).forEach(r => {
        if (!r.effectsId || !l.scientificId) return;
        (state.effectSciIds[r.effectsId] = state.effectSciIds[r.effectsId] || new Set()).add(l.scientificId);
        const list = (state.sciEffects[l.scientificId] = state.sciEffects[l.scientificId] || []);
        if (list.indexOf(r.effectsId) === -1) list.push(r.effectsId);
      });
    });
  } else if (group === 'interactions') {
    const [inter, links] = await Promise.all([loadJSON('data/interactions.json'), loadJSON('data/interactions_links.json')]);
    state.interNames = {}; state.interIdByName = {};
    inter.forEach(r => {
      if (!r.interactionsId) return;
      state.interNames[r.interactionsId] = r;
      const en = (r.interactionsEn || '').trim().toLowerCase();
      if (en && !(en in state.interIdByName)) state.interIdByName[en] = r.interactionsId;
    });
    state.sciToInter = {}; state.pairPosts = {}; state.postsBySci = {};
    links.forEach(l => {
      const sciId = l.scientificId, groupId = l.interactionsId;
      if (sciId && groupId) state.sciToInter[sciId] = groupId;
      respRows(l).forEach(p => {
        const id1 = p.interactions1Id, id2 = p.interactions2Id;
        if (!id1 || !id2) return;
        const post = { other: id1 === groupId ? id2 : id1, serious: p.seriousInteractions, textAr: p.postInteractionsAr || '', textEn: p.postInteractionsEn || '' };
        if (sciId) (state.postsBySci[sciId] = state.postsBySci[sciId] || []).push(post);
        const key = (id1 < id2 ? id1 + ':' + id2 : id2 + ':' + id1);
        (state.pairPosts[key] = state.pairPosts[key] || []).push(post);
      });
    });
  } else if (group === 'pregnancy') {
    const [preg, links] = await Promise.all([loadJSON('data/pregnancy.json'), loadJSON('data/pregnancy_links.json')]);
    state.pregCat = {};
    preg.forEach(r => { if (r.pregnancyCategory) state.pregCat[r.pregnancyId] = r.pregnancyCategory; });
    state.pregBySci = {};
    links.forEach(l => {
      const sciId = l.scientificId;
      if (!sciId || state.pregBySci[sciId]) return;
      let au = null, us = null;
      respRows(l).forEach(d => {
        const cat = state.pregCat[d.pregnancyId];
        if (!cat) return;
        if (d.globalSystem === 'AU' && au === null) au = cat;
        if (d.globalSystem === 'US' && us === null) us = cat;
      });
      const v = au ? 'AU: ' + au : (us ? 'US: ' + us : null);
      if (v) state.pregBySci[sciId] = v;
    });
  }
  state.extra[group] = true;
  } catch (e) {
    delete state.extra[group];
    throw e;
  }
}

/* نسخة آمنة لا ترمي أبداً — الفشل يعني بيانات ناقصة لا صفحة عالقة. */
async function ensureExtraSafe(group) {
  try { await ensureExtra(group); } catch (e) { /* تبقى المجموعة غير محملة */ }
}

/* تسمية الخطورة من نص المنشور أولاً، ثم من علامة 1–4. */
function seriousLabel(post) {
  const en = post.textEn || '';
  if (/contraindicated/i.test(en)) return 'ممنوع الجمع';
  if (/serious/i.test(en)) return 'خطير';
  if (/caution|monitor/i.test(en)) return 'يستدعي الحذر والمراقبة';
  if (/minor/i.test(en)) return 'طفيف';
  if (post.serious === 1) return 'ممنوع الجمع';
  if (post.serious === 2) return 'خطير';
  if (post.serious === 3) return 'يستدعي الحذر والمراقبة';
  if (post.serious === 4) return 'طفيف';
  return null;
}

/* ================= مساعدات عرض ================= */
function drugNameAr(d) { return (d.drugName_ar || '').trim() || d.drugName_en || ''; }
function sciNameAr(s) { return s ? ((s.scientificName_ar || '').trim() || s.scientificName_en || '') : ''; }
function sortedByAr(list, getAr, getEn) {
  return list.slice().sort((a, b) => {
    const x = (getAr(a) || getEn(a) || ''), y = (getAr(b) || getEn(b) || '');
    return x.localeCompare(y, 'ar');
  });
}

function drugCard(d) {
  const s = state.core.sciById[d.idScien];
  const sAr = sciNameAr(s), sEn = s ? (s.scientificName_en || '') : '';
  return '<article class="drug-card">' +
    '<div class="drug-main">' +
      '<div class="drug-label">الاسم التجاري</div>' +
      '<div class="drug-name-ar">' + esc(drugNameAr(d)) + '</div>' +
      '<div class="drug-name-en" dir="ltr" style="text-align:right">' + esc(d.drugName_en || '') + '</div>' +
      '<div class="drug-sci">' +
        '<div class="drug-label">الاسم العلمي</div>' +
        '<div class="sci-ar">' + esc(sAr) + '</div>' +
        '<div class="sci-en" dir="ltr" style="text-align:right">' + esc(sEn) + '</div>' +
      '</div>' +
      '<div class="drug-actions">' +
        '<button class="btn-more" data-act="details" data-id="' + d.id + '">تفاصيل أكثر</button>' +
        '<button class="btn-similar" data-act="similar" data-id="' + d.id + '">أصناف مشابهة</button>' +
      '</div>' +
    '</div>' +
    '<div class="pack-box"><div class="pack-label">العبوة</div>' + packIcon(d.pack) +
      '<div class="pack-val">' + esc((d.pack || '').trim() || 'غير متوفر') + '</div></div>' +
  '</article>';
}

function bindCardActions(root) {
  root.querySelectorAll('[data-act]').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.act === 'details') go('#/drug/' + b.dataset.id);
      else go('#/drug/' + b.dataset.id + '?similar=1');
    });
  });
}

function go(hash) { location.hash = hash; }

function navHTML(active) {
  let h = '<div class="nav-label">الرئيسية</div>' +
    '<button class="nav-item' + (active === 'home' ? ' active' : '') + '" data-nav="#/">' + icon('home') + ' الرئيسية</button>' +
    '<div class="nav-label">الأقسام</div>';
  SECTIONS.forEach(s => {
    h += '<button class="nav-item' + (active === s.key ? ' active' : '') + '" data-nav="#/section/' + s.key + '">' +
      icon(s.icon) + ' ' + esc(s.title) + '</button>';
  });
  return h;
}

/* ================= الصفحة الرئيسية ================= */
function renderHome() {
  const c = state.core;
  $('#mainNav').innerHTML = navHTML('home');
  view.innerHTML =
    '<section class="hero">' +
      '<div class="hero-reason">Dr. Reason</div>' +
      '<h1>الدليل اليمني الشامل للأدوية</h1>' +
      '<p>مرجعك الدوائي — ابحث بالاسم التجاري أو العلمي، بالعربية أو الإنجليزية.</p>' +
      '<div class="hero-stats">' +
        '<div><b>' + fmt(c.drugs.length) + '</b><br><span>دواء مسعّر</span></div>' +
        '<div><b>' + fmt(c.scientific.length) + '</b><br><span>اسم علمي</span></div>' +
        '<div><b>' + fmt(c.proxies.length) + '</b><br><span>وكيل دوائي</span></div>' +
        '<div><b>' + fmt(c.companies.length) + '</b><br><span>شركة منتجة</span></div>' +
      '</div>' +
    '</section>' +
    '<div class="action-bar"><span class="ab-text">نسخة الويب — تعمل بدون تثبيت، في أي متصفح</span>' +
      '<button data-goto="#/section/diseases">فئة الأمراض</button>' +
      '<button data-goto="#/section/interactions">فحص التفاعلات</button>' +
      '<button data-goto="#/section/priced">كل الأصناف</button>' +
    '</div>' +
    '<section class="search-card">' +
      '<p class="eyebrow">بحث سريع ودقيق</p><h2>ابحث عن دواء</h2>' +
      '<div class="search-row">' +
        '<input id="searchBox" type="search" placeholder="اكتب اسم الدواء…" value="' + esc(state.searchQuery) + '" autocomplete="off">' +
        '<button id="searchBtn">بحث</button>' +
      '</div>' +
      '<p class="search-hint">اكتب الاسم العلمي أو التجاري، بالعربية أو الإنجليزية — تظهر النتائج أثناء الكتابة.</p>' +
    '</section>' +
    '<div id="searchResults"></div>' +
    '<div id="homeTiles">' +
      '<div class="features">' +
        '<div class="feature f1"><h3>بحث سريع ودقيق</h3><p>ابحث بالاسم التجاري أو العلمي، بالعربية أو الإنجليزية، وتظهر النتائج أثناء الكتابة.</p></div>' +
        '<div class="feature f2"><h3>يعمل في كل مكان</h3><p>افتحه من أي هاتف أو كمبيوتر، من المتصفح مباشرة — بدون تثبيت وبدون حساب.</p></div>' +
        '<div class="feature f3"><h3>بيانات كاملة</h3><p>' + fmt(c.drugs.length) + ' صنفاً دوائياً مسعراً، مع الوكيل والشركة المنتجة ودواعي الاستعمال.</p></div>' +
      '</div>' +
      '<div class="tiles">' + SECTIONS.map(s =>
        '<button class="tile" data-goto="#/section/' + s.key + '">' +
          '<span class="tile-ic">' + icon(s.icon, 26) + '</span>' +
          '<h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p>' +
        '</button>').join('') +
      '</div>' +
    '</div>';

  view.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
  const box = $('#searchBox');
  let timer = null;
  box.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.searchQuery = box.value.trim(); runSearch(); }, 200);
  });
  box.addEventListener('keydown', e => { if (e.key === 'Enter') { state.searchQuery = box.value.trim(); runSearch(); } });
  $('#searchBtn').addEventListener('click', () => { state.searchQuery = box.value.trim(); runSearch(); });
  if (state.searchQuery) runSearch();
}

function runSearch() {
  const box = $('#searchResults');
  const tiles = $('#homeTiles');
  if (!box) return;
  const q = normalize(state.searchQuery);
  if (q.length < 2) {
    box.innerHTML = '';
    if (tiles) tiles.style.display = '';
    return;
  }
  if (tiles) tiles.style.display = 'none';
  const matches = [];
  for (const [d, hay] of state.haystacks) {
    if (hay.indexOf(q) !== -1) { matches.push(d); if (matches.length >= 50) break; }
  }
  if (!matches.length) {
    box.innerHTML = '<div class="empty-state"><h3>لم نجد نتائج مطابقة</h3><p>جرّب البحث باسم علمي أو تجاري بالعربية أو الإنجليزية.</p></div>';
    return;
  }
  box.innerHTML = '<div class="results-head"><h2>النتائج</h2><span>عرض أول ' + matches.length + ' نتيجة</span></div>' +
    '<div class="drug-list">' + matches.map(drugCard).join('') + '</div>';
  bindCardActions(box);
}

/* ================= الأقسام ================= */
function sectionRows(key) {
  const c = state.core;
  if (key === 'agencies') return sortedByAr(c.proxies, p => p.proxyName_ar, p => p.proxyName_en)
    .map(p => ({ id: p.proxyId, title: (p.proxyName_ar || '').trim() || p.proxyName_en || '', sub: p.proxyName_en || '' }));
  if (key === 'directory') return sortedByAr(c.companies, x => x.companyName_ar, x => x.companyName_en)
    .map(x => ({ id: x.idproduct, title: (x.companyName_ar || '').trim() || x.companyName_en || '', sub: [x.companyName_en, x.country_ar].filter(Boolean).join(' — ') }));
  if (key === 'scientific') return sortedByAr(c.scientific, s => s.scientificName_ar, s => s.scientificName_en)
    .map(s => ({ id: s.idScien, title: sciNameAr(s), sub: s.scientificName_en || '' }));
  if (key === 'indications') return sortedByAr(c.scientific.filter(s => (s.theUse_ar || '').trim() || (s.theUse_en || '').trim()), s => s.scientificName_ar, s => s.scientificName_en)
    .map(s => ({ id: s.idScien, title: sciNameAr(s), sub: (s.theUse_ar || s.theUse_en || '').split('\n')[0] }));
  if (key === 'diseases') return (state.diseases || []).slice().sort((a, b) => sciNameAr({ scientificName_ar: a.diseaseAr, scientificName_en: a.diseaseEn }).localeCompare(sciNameAr({ scientificName_ar: b.diseaseAr, scientificName_en: b.diseaseEn }), 'ar'))
    .map(d => ({ id: d.diseaseId, title: (d.diseaseAr || '').trim() || d.diseaseEn || '', sub: d.diseaseEn || '', count: (state.diseaseSciIds[d.diseaseId] || new Set()).size }));
  if (key === 'adverse') return (state.effects || []).slice().sort((a, b) => ((a.sideEffectsAr || a.sideEffectsEn) || '').localeCompare((b.sideEffectsAr || b.sideEffectsEn) || '', 'ar'))
    .map(e => ({ id: e.effectsId, title: (e.sideEffectsAr || '').trim() || e.sideEffectsEn || '', sub: e.sideEffectsEn || '', count: (state.effectSciIds[e.effectsId] || new Set()).size }));
  return [];
}

async function renderSection(key, rowId) {
  const meta = sectionMeta(key);
  $('#mainNav').innerHTML = navHTML(key);
  if (key === 'interactions') { renderInteractions(); return; }
  if (key === 'prescriptions') {
    view.innerHTML = '<div class="section-head"><button class="back-btn" data-goto="#/">‹ الرئيسية</button><h2>' + esc(meta.title) + '</h2></div>' +
      '<div class="placeholder"><h3>لا توجد بيانات للوصفات</h3><p>لا توجد بيانات وصفات في قاعدة البيانات، لذلك لا يمكن عرض وصفات هنا.<br>هذه الواجهة جاهزة لربط البيانات الأصلية عند توفرها — ولم نضع أي بيانات مختلقة.</p></div>';
    view.querySelector('[data-goto]').addEventListener('click', () => go('#/'));
    return;
  }
  if (key === 'diseases') await ensureExtraSafe('diseases');
  if (key === 'adverse') await ensureExtraSafe('effects');
  if (rowId != null) { renderSectionDrugs(key, Number(rowId)); return; }

  view.innerHTML = '<div class="section-head"><button class="back-btn" data-goto="#/">‹ الرئيسية</button><h2>' + esc(meta.title) + '</h2><span class="cnt" id="secCount"></span></div>' +
    '<div id="secBody"><div class="loading"><div class="spin"></div>جاري تجهيز القائمة…</div></div>';
  view.querySelector('[data-goto]').addEventListener('click', () => go('#/'));

  if (key === 'priced') {
    const drugs = sortedByAr(state.core.drugs, d => d.drugName_ar, d => d.drugName_en);
    renderDrugListPage(meta.title, drugs, 'الأصناف المسعرة', key);
    return;
  }
  const rows = sectionRows(key);
  const searchable = (key === 'diseases' || key === 'adverse');
  state.sectionQuery = '';
  state.listShown = 100;
  view.querySelector('#secBody').innerHTML =
    (searchable ? '<div class="section-search"><input id="secSearch" type="search" placeholder="ابحث في القائمة…" autocomplete="off"></div>' : '') +
    '<div class="row-list" id="rowList"></div>' +
    '<div id="rowMore"></div>';
  const drawRows = () => {
    const q = normalize(state.sectionQuery);
    const filtered = q.length < 2 ? rows : rows.filter(r => normalize(r.title + ' ' + r.sub).indexOf(q) !== -1);
    $('#secCount').textContent = fmt(filtered.length) + ' عنصر';
    const shown = filtered.slice(0, state.listShown);
    $('#rowList').innerHTML = shown.map(r =>
      '<button class="row-item" data-row="' + r.id + '"><span class="row-t"><span class="row-title">' + esc(r.title) + '</span>' +
      (r.sub ? '<br><span class="row-sub">' + esc(r.sub) + '</span>' : '') + '</span>' +
      (r.count != null && r.count > 0 ? '<span class="count-badge">' + fmt(r.count) + '</span>' : '') +
      '</button>').join('') || '<div class="empty-state"><h3>لا توجد عناصر مطابقة</h3></div>';
    $('#rowList').querySelectorAll('[data-row]').forEach(b => b.addEventListener('click', () => go('#/section/' + key + '/' + b.dataset.row)));
    $('#rowMore').innerHTML = filtered.length > state.listShown
      ? '<button class="more-btn" id="moreRows">عرض المزيد (' + fmt(filtered.length - state.listShown) + ' متبقية)</button>' : '';
    const mb = $('#moreRows');
    if (mb) mb.addEventListener('click', () => { state.listShown += 100; drawRows(); });
  };
  drawRows();
  const ss = $('#secSearch');
  if (ss) ss.addEventListener('input', () => { state.sectionQuery = ss.value.trim(); state.listShown = 100; drawRows(); });
}

function renderDrugListPage(title, drugs, label, key) {
  state.listShown = 100;
  const body = $('#secBody');
  $('#secCount').textContent = fmt(drugs.length) + ' دواء';
  const draw = () => {
    const shown = drugs.slice(0, state.listShown);
    body.innerHTML = '<div class="drug-list">' + shown.map(drugCard).join('') + '</div>' +
      (drugs.length > state.listShown ? '<button class="more-btn" id="moreDrugs">عرض المزيد (' + fmt(drugs.length - state.listShown) + ' متبقية)</button>' : '');
    bindCardActions(body);
    const mb = $('#moreDrugs');
    if (mb) mb.addEventListener('click', () => { state.listShown += 100; draw(); });
  };
  draw();
}

function renderSectionDrugs(key, rowId) {
  const meta = sectionMeta(key);
  const c = state.core;
  let title = '', drugs = [];
  if (key === 'agencies') {
    const p = c.proxyById[rowId];
    title = p ? ((p.proxyName_ar || '').trim() || p.proxyName_en || '') : '';
    drugs = c.drugs.filter(d => d.proxyId === rowId);
  } else if (key === 'directory') {
    const x = c.compById[rowId];
    title = x ? ((x.companyName_ar || '').trim() || x.companyName_en || '') : '';
    drugs = c.drugs.filter(d => d.idproduct === rowId);
  } else if (key === 'scientific' || key === 'indications') {
    const s = c.sciById[rowId];
    title = sciNameAr(s);
    drugs = c.drugs.filter(d => d.idScien === rowId);
  } else if (key === 'diseases') {
    const d = (state.diseases || []).find(x => x.diseaseId === rowId);
    title = d ? ((d.diseaseAr || '').trim() || d.diseaseEn || '') : '';
    const ids = state.diseaseSciIds[rowId] || new Set();
    drugs = c.drugs.filter(d => ids.has(d.idScien));
  } else if (key === 'adverse') {
    const e = (state.effects || []).find(x => x.effectsId === rowId);
    title = e ? ((e.sideEffectsAr || '').trim() || e.sideEffectsEn || '') : '';
    const ids = state.effectSciIds[rowId] || new Set();
    drugs = c.drugs.filter(d => ids.has(d.idScien));
  }
  drugs = sortedByAr(drugs, d => d.drugName_ar, d => d.drugName_en).slice(0, 50);
  view.innerHTML = '<div class="section-head"><button class="back-btn" data-goto="#/section/' + key + '">‹ القائمة</button><h2>' + esc(title) + '</h2><span class="cnt">' + fmt(drugs.length) + ' دواء</span></div>' +
    (drugs.length
      ? '<div class="drug-list">' + drugs.map(drugCard).join('') + '</div>'
      : '<div class="empty-state"><h3>لا توجد أصناف مسجلة هنا</h3></div>');
  view.querySelector('[data-goto]').addEventListener('click', () => go('#/section/' + key));
  bindCardActions(view);
}

/* ================= تفاصيل الدواء ================= */
async function renderDrug(id, openSimilar) {
  const c = state.core;
  const d = c.drugs.find(x => x.id === id);
  $('#mainNav').innerHTML = navHTML('home');
  if (!d) {
    view.innerHTML = '<div class="empty-state"><h3>الدواء غير موجود</h3><p><a href="#/">عودة للرئيسية</a></p></div>';
    return;
  }
  const s = c.sciById[d.idScien];
  const proxy = c.proxyById[d.proxyId];
  const comp = c.compById[d.idproduct];
  const classes = c.classesBySci[d.idScien] || [];
  const useAr = (s && (s.theUse_ar || '').trim()) ? s.theUse_ar : (s ? s.theUse_en : '');

  view.innerHTML = '<div class="details"><div class="loading"><div class="spin"></div>جاري تجهيز التفاصيل…</div></div>';
  await Promise.all([ensureExtraSafe('info'), ensureExtraSafe('pregnancy'), ensureExtraSafe('diseases')]);
  const info = state.infoBySci ? state.infoBySci[d.idScien] : null;
  const indAr = info && (info.indicationsAr || '').trim() ? info.indicationsAr : useAr;
  const diseases = (state.sciDiseases && state.sciDiseases[d.idScien]) || [];
  const preg = state.pregBySci ? state.pregBySci[d.idScien] : null;

  let h = '<div class="details">' +
    '<a class="back-chip" href="#/">‹ النتائج</a>' +
    '<div class="d-en" dir="ltr" style="text-align:right">' + esc(d.drugName_en || '') + '</div>' +
    '<h1>' + esc(drugNameAr(d)) + '</h1>' +
    '<div class="detail-pack">العبوة: <b>' + esc((d.pack || '').trim() || 'غير متوفر') + '</b></div>';

  if ((d.price || '').trim()) {
    h += '<div class="d-section"><h3>السعر</h3><p class="price-line">' + esc(d.price.trim()) + ' <span class="cur">ريال يمني</span></p></div>';
  }
  if (proxy) h += '<div class="d-section"><h3>الوكيل</h3><p>' + esc((proxy.proxyName_ar || '').trim() || proxy.proxyName_en || '') + '</p></div>';
  if (comp) h += '<div class="d-section"><h3>الشركة المنتجة</h3><p>' + esc((comp.companyName_ar || '').trim() || comp.companyName_en || '') + (comp.country_ar ? ' — ' + esc(comp.country_ar) : '') + '</p></div>';
  if (s) h += '<div class="d-section"><h3>الاسم العلمي</h3><p dir="ltr" style="text-align:right">' + esc(s.scientificName_en || '') + '</p><p>' + esc(s.scientificName_ar || '') + '</p></div>';
  if (classes.length || (info && diseases.length)) {
    h += '<div class="d-section"><h3>الفئة</h3><div class="chips">' +
      classes.filter(x => (x.classAr || x.classEn || '').trim()).map(x => '<span class="chip">' + esc((x.classAr || '').trim() || x.classEn) + '</span>').join('') +
      (info ? diseases.map(did => {
        const dd = (state.diseases || []).find(x => x.diseaseId === did);
        return dd ? '<span class="chip">' + esc((dd.diseaseAr || '').trim() || dd.diseaseEn) + '</span>' : '';
      }).join('') : '') +
      '</div></div>';
  }
  if ((indAr || '').trim()) h += '<div class="d-section"><h3>دواعي الاستعمال</h3><p>' + esc(indAr) + '</p></div>';

  if (info) {
    const ar = f => (info[f + 'Ar'] || '').trim() ? info[f + 'Ar'] : (info[f + 'En'] || '');
    if ((info.chemicalComposition || '').trim()) h += '<div class="d-section"><h3>التركيبة الكيميائية</h3><p class="ltr">' + esc(info.chemicalComposition) + '</p></div>';
    if (ar('mechanismOfAction').trim()) h += '<div class="d-section"><h3>آلية العمل</h3><p>' + esc(ar('mechanismOfAction')) + '</p></div>';
    const dosageParts = [];
    if ((info.dosageAr || info.dosageEn || '').trim()) dosageParts.push(['الجرعة العامة', ar('dosage')]);
    if (ar('adults').trim()) dosageParts.push(['البالغون', ar('adults')]);
    if (ar('children').trim()) dosageParts.push(['الأطفال', ar('children')]);
    if (ar('theElderly').trim()) dosageParts.push(['كبار السن', ar('theElderly')]);
    if (dosageParts.length) {
      h += '<div class="d-section"><h3>الجرعة</h3>' + dosageParts.map(p => '<p><b>' + esc(p[0]) + ':</b><br>' + esc(p[1]) + '</p>').join('') + '</div>';
    }
    if (ar('warnings').trim()) h += '<div class="d-section"><h3>التحذيرات والاحتياطات</h3><p>' + esc(ar('warnings')) + '</p></div>';
    if (preg) h += '<div class="d-section"><h3>فئة الحمل</h3><p><b>' + esc(preg) + '</b></p></div>';
    h += '<details class="rich" id="collEffects"><summary>عرض الآثار الجانبية</summary><div class="rich-body" id="effectsBody">جاري التحميل…</div></details>';
    h += '<details class="rich" id="collInter"><summary>عرض التفاعلات</summary><div class="rich-body" id="interBody">جاري التحميل…</div></details>';
  }

  const similar = c.drugs.filter(x => x.idScien === d.idScien && x.id !== d.id).slice(0, 50);
  h += '<h3 class="similar-title">أصناف مشابهة</h3>' +
    (similar.length
      ? '<div class="drug-list">' + similar.map(drugCard).join('') + '</div>'
      : '<div class="empty-state"><p>لا توجد أصناف مشابهة مسجّلة لهذا الاسم العلمي.</p></div>');
  h += '</div>';
  view.innerHTML = h;
  bindCardActions(view);

  if (openSimilar) {
    const el = view.querySelector('.similar-title');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  if (info) {
    fillCollapsibles(d.idScien);
  }
}

async function fillCollapsibles(sciId) {
  try { await ensureExtra('effects'); } catch (e) { /* يبقى نص التحميل */ }
  const eb = $('#effectsBody');
  if (eb) {
    const ids = (state.sciEffects && state.sciEffects[sciId]) || [];
    const names = ids.map(id => (state.effects || []).find(x => x.effectsId === id)).filter(Boolean)
      .map(x => (x.sideEffectsAr || '').trim() || x.sideEffectsEn);
    eb.innerHTML = names.length
      ? names.map(n => '<div class="rich-item">' + esc(n) + '</div>').join('')
      : 'لا توجد بيانات مسجلة';
  }
  try { await ensureExtra('interactions'); } catch (e) { /* يبقى نص التحميل */ }
  const ib = $('#interBody');
  if (ib) {
    const posts = (state.postsBySci && state.postsBySci[sciId]) || [];
    ib.innerHTML = posts.length
      ? posts.slice(0, 50).map(p => {
          const other = state.interNames ? state.interNames[p.other] : null;
          const name = other ? ((other.interactionsAr || '').trim() || other.interactionsEn || '') : '';
          const label = seriousLabel(p);
          return '<div class="rich-item">' +
            (label ? '<div class="sev">' + esc(label) + '</div>' : '') +
            (name ? '<div><b>' + esc(name) + '</b></div>' : '') +
            '<div>' + esc((p.textAr || '').trim() || p.textEn || '') + '</div></div>';
        }).join('') + (posts.length > 50 ? '<div class="rich-item">عرض أول 50 من ' + fmt(posts.length) + ' تفاعلاً مسجلاً</div>' : '')
      : 'لا توجد بيانات مسجلة';
  }
}

/* ================= فاحص التفاعلات ================= */
function renderInteractions() {
  $('#mainNav').innerHTML = navHTML('interactions');
  view.innerHTML =
    '<div class="section-head"><button class="back-btn" data-goto="#/">‹ الرئيسية</button><h2>التفاعلات الدوائية</h2></div>' +
    '<div class="checker">' +
      '<p style="margin-top:0">اختر دوائين بالاسم العلمي لفحص التفاعل بينهما. التفاعلات المعروضة هي المسجلة في قاعدة البيانات فقط — وما ليس مسجلاً يظهر كرسالة صريحة، لا كإجابة مختلقة.</p>' +
      '<div class="pickers">' +
        '<div class="pick-field"><label>الاسم العلمي الأول</label><div class="pick-box" id="pickA">اختر دواء…</div></div>' +
        '<button class="swap-btn" id="swapBtn">⇄ تبديل</button>' +
        '<div class="pick-field"><label>الاسم العلمي الثاني</label><div class="pick-box" id="pickB">اختر دواء…</div></div>' +
      '</div>' +
      '<button class="check-btn" id="checkBtn" disabled>فحص التفاعل</button>' +
      '<div id="checkResult"></div>' +
    '</div>';
  view.querySelector('[data-goto]').addEventListener('click', () => go('#/'));
  const refresh = () => {
    $('#pickA').textContent = state.pickA ? sciNameAr(state.pickA) : 'اختر دواء…';
    $('#pickB').textContent = state.pickB ? sciNameAr(state.pickB) : 'اختر دواء…';
    $('#checkResult').innerHTML = '';
  };
  $('#pickA').addEventListener('click', () => openPicker(true, refresh));
  $('#pickB').addEventListener('click', () => openPicker(false, refresh));
  $('#swapBtn').addEventListener('click', () => {
    const t = state.pickA; state.pickA = state.pickB; state.pickB = t; refresh();
  });
  $('#checkBtn').addEventListener('click', onCheck);
  ensureExtra('interactions').then(() => {
    const b = $('#checkBtn');
    if (b) b.disabled = false;
  }).catch(() => {
    const r = $('#checkResult');
    if (r) r.innerHTML = '<div class="empty-note">تعذّر تحميل بيانات التفاعلات — تحقق من الاتصال وأعد تحميل الصفحة.</div>';
  });
}

function openPicker(isFirst, onPick) {
  const rows = sortedByAr(state.core.scientific, s => s.scientificName_ar, s => s.scientificName_en)
    .map(s => ({ id: s.idScien, title: sciNameAr(s), sub: s.scientificName_en || '' }));
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = '<div class="modal" role="dialog" aria-label="اختر دواء">' +
    '<div class="modal-head"><input id="pickerSearch" type="search" placeholder="ابحث بالاسم العلمي…" autocomplete="off"><button class="modal-close" id="pickerClose" aria-label="إغلاق">×</button></div>' +
    '<div class="modal-list" id="pickerList"></div></div>';
  document.body.appendChild(back);
  const list = $('#pickerList', back);
  const draw = q0 => {
    const q = normalize(q0);
    const filtered = q.length < 2 ? rows : rows.filter(r => normalize(r.title + ' ' + r.sub).indexOf(q) !== -1);
    list.innerHTML = filtered.slice(0, 100).map(r =>
      '<button class="row-item" data-pick="' + r.id + '"><span class="row-t"><span class="row-title">' + esc(r.title) + '</span><br><span class="row-sub">' + esc(r.sub) + '</span></span></button>').join('')
      || '<div class="empty-state"><h3>لا توجد نتائج مطابقة</h3></div>';
    list.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
      const s = state.core.sciById[Number(b.dataset.pick)];
      if (s) { if (isFirst) state.pickA = s; else state.pickB = s; }
      back.remove();
      onPick();
    }));
  };
  draw('');
  $('#pickerSearch', back).addEventListener('input', e => draw(e.target.value.trim()));
  $('#pickerClose', back).addEventListener('click', () => back.remove());
  back.addEventListener('click', e => { if (e.target === back) back.remove(); });
}

function onCheck() {
  const r = $('#checkResult');
  const a = state.pickA, b = state.pickB;
  if (!a) { r.innerHTML = '<div class="empty-note">اختر الدواء الأول أولاً.</div>'; return; }
  if (!state.postsBySci) { r.innerHTML = '<div class="empty-note">بيانات التفاعلات لم تكتمل بعد — انتظر لحظة ثم أعد المحاولة.</div>'; return; }
  if (!b) {
    const posts = state.postsBySci[a.id] || [];
    if (!posts.length) { r.innerHTML = '<div class="empty-note">لا توجد تفاعلات مسجلة لهذا الدواء في قاعدة البيانات.</div>'; return; }
    r.innerHTML = postsHTML('تفاعلات ' + sciNameAr(a), posts);
    return;
  }
  const idA = state.sciToInter[a.id] || state.interIdByName[(a.scientificName_en || '').trim().toLowerCase()];
  const idB = state.sciToInter[b.id] || state.interIdByName[(b.scientificName_en || '').trim().toLowerCase()];
  if (!idA || !idB) {
    r.innerHTML = '<div class="empty-note">لا يمكن مطابقة أحد الدوائين مع جدول التفاعلات، ولا يوجد تفاعل مسجل بينهما في قاعدة البيانات.</div>';
    return;
  }
  const key = (idA < idB ? idA + ':' + idB : idB + ':' + idA);
  const posts = state.pairPosts[key] || [];
  if (!posts.length) {
    r.innerHTML = '<div class="empty-note">لا يوجد تفاعل مسجل بين الدوائين في قاعدة البيانات.</div>';
    return;
  }
  r.innerHTML = postsHTML('التفاعل بين ' + sciNameAr(a) + ' و ' + sciNameAr(b), posts);
}

function postsHTML(title, posts) {
  const shown = posts.slice(0, 50);
  return '<h3 class="result-title">' + esc(title) + '</h3>' +
    shown.map(p => {
      const label = seriousLabel(p);
      return '<div class="post-card">' +
        (label ? '<div class="sev">' + esc(label) + '</div>' : '') +
        '<p>' + esc((p.textAr || '').trim() || p.textEn || '') + '</p></div>';
    }).join('') +
    (posts.length > shown.length ? '<p style="text-align:center;color:var(--muted);font-size:13px">عرض أول ' + shown.length + ' من ' + fmt(posts.length) + ' تفاعلاً مسجلاً</p>' : '');
}

/* ================= التوجيه والتشغيل ================= */
function parseHash() {
  const h = (location.hash || '#/').replace(/^#/, '');
  const [path, query] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  return { parts, params: new URLSearchParams(query || '') };
}

async function render() {
  if (!state.core) return;
  const { parts, params } = parseHash();
  closeSidebar();
  if (parts.length === 0) { renderHome(); return; }
  if (parts[0] === 'section' && parts[1]) {
    if (parts[1] === 'interactions') { renderInteractions(); return; }
    await renderSection(parts[1], parts[2] || null);
    return;
  }
  if (parts[0] === 'drug' && parts[1]) {
    await renderDrug(Number(parts[1]), params.get('similar') === '1');
    return;
  }
  renderHome();
}

function closeSidebar() { $('#sidebar').classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#mainNav').addEventListener('click', e => {
    const b = e.target.closest('[data-nav]');
    if (b) { closeSidebar(); go(b.dataset.nav); }
  });
  window.addEventListener('hashchange', render);
  loadCore().then(() => {
    render();
  }).catch(err => {
    view.innerHTML = '<div class="empty-state"><h3>تعذّر تحميل البيانات</h3><p>' + esc(err.message || '') + '</p><p>تحقق من الاتصال بالإنترنت ثم أعد تحميل الصفحة. ملفات البيانات في مجلد data/ بجانب هذه الصفحة.</p></div>';
    $('#topbarNote').textContent = 'تعذّر التحميل';
  });
});
