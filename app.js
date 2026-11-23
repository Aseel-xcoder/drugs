/* الدليل اليمني الشامل للأدوية — نسخة الويب
   واجهة مطابقة للتطبيق الأصلي v7.10 (نفس التخطيطات والألوان والأيقونات
   من res/layout و res/drawable): ترويسة فيروزية، بطاقة بحث تتداخل
   فوقها، شبكة الأقسام التسع، بطاقات نتائج مدمجة، تفاصيل بأقسام زرقاء.
   لا خادم، لا تسجيل دخول، لا تتبّع. البيانات ملفات JSON محلية تُحمَّل
   من مجلد data/؛ الأساسية أولاً، وملفات الجولة الثانية عند الحاجة فقط. */
'use strict';

/* ================= أدوات ================= */
const $ = (s, r) => (r || document).querySelector(s);

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

/* ================= أيقونات SVG — منسوخة من res/drawable الأصلية =================
   stroke باللون الحالي، ما عدا bottle_filled (مملوءة). */
const ICONS = {
  pill: { vb: 24, d: '<path d="M9.8 3.8a6.3 6.3 0 0 1 9 8.9l-6.2 6.2a6.3 6.3 0 1 1-8.9-8.9z"/><path d="M8.5 9.1l6.5 6.5"/>' },
  search: { vb: 24, d: '<path d="M17.5 10.8a6.7 6.7 0 1 0-13.4 0a6.7 6.7 0 1 0 13.4 0"/><path d="M16 16l5 5"/>' },
  building: { vb: 24, d: '<path d="M4 21V5l8-2v18M12 10h8v11M2 21h20M7 7h2M7 11h2M7 15h2M16 13h1M16 17h1"/>' },
  dollar: { vb: 24, d: '<path d="M12 2v20m5-16H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M3 8h2"/>' },
  flask: { vb: 24, d: '<path d="M8 3h8M10 3v7l-6 9a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-6-9V3M7 16h10"/>' },
  interaction: { vb: 24, d: '<path d="M4 7h15l-4-4M20 17H5l4 4M19 7l-4 4M5 17l4-4"/>' },
  shield: { vb: 24, d: '<path d="m12 2 8.5 4v6c0 5.5-3.5 8.5-8.5 10-5-1.5-8.5-4.5-8.5-10V6L12 2Z"/><path d="M12 8v5M12 17h.01"/>' },
  heart: { vb: 24, d: '<path d="M20.5 8.7c0 5.2-8.5 10.8-8.5 10.8S3.5 13.9 3.5 8.7a4.8 4.8 0 0 1 8.5-2.9 4.8 4.8 0 0 1 8.5 2.9Z"/><path d="m5 12 3-0.1 1.8-3 3.1 6 2.1-3H19"/>' },
  book: { vb: 24, d: '<path d="M12 5c-3-2-6.7-2.2-10-1v15c3.3-1.2 7-1 10 1 3-2 6.7-2.2 10-1V4c-3.3-1.2-7-.9-10 1ZM12 5v15M5 8h4M15 8h4"/>' },
  molecule: { vb: 24, d: '<path d="M3.2 7.2a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M16.6 5.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M9.5 13a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0"/><path d="M17 20a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M2.7 20a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="m7 8.4 3 3M14.1 11l3.3-4m-4 8 4.4 3.5M10 15l-4 3"/>' },
  clipboard: { vb: 24, d: '<path d="M6.5 4h11a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-11a2 2 0 0 1 -2-2V6a2 2 0 0 1 2-2Z"/><path d="M9 4V2h6v2M8 10h8m-8 4h8m-8 4h5"/>' },
  arrow: { vb: 24, d: '<path d="M20 12H4m6-6-6 6 6 6"/>' },
  info: { vb: 24, d: '<path d="M21 12a9 9 0 1 0-18 0a9 9 0 1 0 18 0"/><path d="M12 11v6M12 7h.01"/>' },
  layers: { vb: 24, d: '<path d="M12 3l9 5-9 5-9-5 9-5Z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>' },
  chevron: { vb: 24, d: '<path d="M15 6l-6 6 6 6"/>' },
  bottle_filled: { vb: 48, fill: true, d: '<path d="M17 5h14v6H17z"/><path d="M19 11v5c-5 3-6 6-6 10v15c0 2 1.5 3 3 3h16c2 0 3-1 3-3V26c0-4-1-7-6-10v-5"/><path d="M13 25h22v12H13z"/>' },
  sachet: { vb: 48, d: '<path d="M6 38 V7 Q6 4 9 4 H28 Q31 4 31 7 V9"/><path d="M17.5 9 H38.5 Q41 9 41 11.5 V38.5 Q41 41 38.5 41 H17.5 Q15 41 15 38.5 V11.5 Q15 9 17.5 9 Z"/><path d="M20 12.5 H36 Q37.5 12.5 37.5 14 V36 Q37.5 37.5 36 37.5 H20 Q18.5 37.5 18.5 36 V14 Q18.5 12.5 20 12.5 Z"/><path d="M18.5 30 Q24 25.5 28 30 Q32 34.5 37.5 29.5 L37.5 36 L18.5 36 Z"/>' },
  tablets: { vb: 48, d: '<path d="M9.73 15.48 L17.9 8.12 A7 7 0 0 1 27.79 8.64 L27.79 8.64 A7 7 0 0 1 27.27 18.52 L19.1 25.88 A7 7 0 0 1 9.21 25.36 L9.21 25.36 A7 7 0 0 1 9.73 15.48 Z"/><path d="M42.26 23.5 A13 8 -30 0 1 19.74 36.5 A13 8 -30 0 1 42.26 23.5 Z"/><path d="M13 11l9.5 10"/><path d="M20 32c8 3 15 1 22-7"/>' }
};
function icon(name, size) {
  const ic = ICONS[name] || ICONS.pill;
  const s = size || 20;
  if (ic.fill) {
    return '<svg viewBox="0 0 ' + ic.vb + ' ' + ic.vb + '" fill="currentColor" stroke="none" width="' + s + '" height="' + s + '" aria-hidden="true">' + ic.d + '</svg>';
  }
  return '<svg viewBox="0 0 ' + ic.vb + ' ' + ic.vb + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="' + s + '" height="' + s + '" aria-hidden="true">' + ic.d + '</svg>';
}
/* أيقونة شكل العبوة — نفس منطق التطبيق: sachet أولاً، ثم ml قارورة، وإلا حبتان. */
function packIcon(pack) {
  const p = (pack || '').toLowerCase();
  if (p.indexOf('sachet') !== -1) return icon('sachet', 32);
  if (p.indexOf('ml') !== -1) return icon('bottle_filled', 32);
  return icon('tablets', 32);
}

/* ================= الأقسام التسع — بنفس ترتيب وألوان التطبيق ================= */
const SECTIONS = [
  { key: 'agencies', title: 'الوكالات الدوائية', icon: 'building', tile: 'bg-blue' },
  { key: 'priced', title: 'الأصناف المسعرة', icon: 'dollar', tile: 'bg-cyan' },
  { key: 'indications', title: 'دواعي الاستعمال', icon: 'flask', tile: 'bg-violet' },
  { key: 'interactions', title: 'التفاعلات الدوائية', icon: 'interaction', tile: 'bg-teal' },
  { key: 'adverse', title: 'الآثار الجانبية', icon: 'shield', tile: 'bg-coral' },
  { key: 'diseases', title: 'فئة الأمراض', icon: 'heart', tile: 'bg-rose' },
  { key: 'directory', title: 'الدليل الطبي', icon: 'book', tile: 'bg-indigo' },
  { key: 'scientific', title: 'فئة الاسم العلمي', icon: 'molecule', tile: 'bg-mint' },
  { key: 'prescriptions', title: 'وصفة', icon: 'clipboard', tile: 'bg-amber' }
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
  searching: false,
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
function go(hash) { location.hash = hash; }

/* شارة تيليجرام — نفس أيقونة التطبيق (قرص #229ED9 + سهم أبيض). */
const TELEGRAM_SVG = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#229ED9"/><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" fill="#fff" transform="translate(0.5 0) scale(0.9)"/></svg>';

/* ================= بطاقة نتيجة مدمجة — مطابقة item_result_card.xml ================= */
function drugCard(d) {
  const s = state.core.sciById[d.idScien];
  const sAr = sciNameAr(s), sEn = s ? (s.scientificName_en || '') : '';
  const pack = (d.pack || '').trim() || 'غير متوفر';
  return '<article class="drug-card" data-drug="' + d.id + '">' +
    '<div class="card-top">' +
      '<div class="drug-main">' +
        '<div class="drug-label">الاسم التجاري</div>' +
        '<div class="drug-name-ar">' + esc(drugNameAr(d)) + '</div>' +
        (d.drugName_en ? '<div class="drug-name-en" dir="ltr" style="text-align:right">' + esc(d.drugName_en) + '</div>' : '') +
        '<div class="drug-sci">' +
          '<div class="drug-label">الاسم العلمي</div>' +
          '<div class="sci-ar">' + esc(sAr) + '</div>' +
          (sEn ? '<div class="sci-en" dir="ltr" style="text-align:right">' + esc(sEn) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="card-divider"></div>' +
      '<div class="pack-box"><div class="pack-label">العبوة</div>' + packIcon(d.pack) +
        '<div class="pack-val">' + esc(pack) + '</div></div>' +
    '</div>' +
    '<div class="drug-actions">' +
      '<button class="btn-more" data-act="details" data-id="' + d.id + '">' + icon('info', 16) + 'تفاصيل أكثر</button>' +
      '<button class="btn-similar" data-act="similar" data-id="' + d.id + '">' + icon('layers', 16) + 'أصناف مشابهة</button>' +
    '</div>' +
  '</article>';
}

function bindCardActions(root) {
  root.querySelectorAll('[data-act]').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      if (b.dataset.act === 'details') go('#/drug/' + b.dataset.id);
      else go('#/drug/' + b.dataset.id + '?similar=1');
    });
  });
  /* الضغط على البطاقة نفسها يفتح التفاصيل — كما في التطبيق. */
  root.querySelectorAll('.drug-card[data-drug]').forEach(c => {
    c.addEventListener('click', () => go('#/drug/' + c.dataset.drug));
  });
}

/* ================= البحث — نفس سلوك MainActivity =================
   التركيز على الحقل يدخل وضع البحث (الترويسة تختفي والبطاقة ترتفع
   للأعلى والشبكة تختفي)؛ الكتابة تبحث لحظياً؛ زر «الرئيسية» يعيد. */
function setSearching(on) {
  state.searching = on;
  document.body.classList.toggle('searching', on);
  if (!on) { renderHome(); return; }
  runSearch();
}
function enterSearch() {
  if (!state.searching) setSearching(true);
  else runSearch();
}
function showHome() {
  const box = $('#searchBox');
  if (box) box.blur();
  setSearching(false);
}

function runSearch() {
  const view = $('#view');
  const q = normalize(state.searchQuery);
  if (q.length < 2) {
    /* وضع البحث بلا حروف كافية — حالة «ابحث عن دوائك» في التطبيق. */
    view.innerHTML = '<div class="empty-state"><div class="empty-ic">' + icon('pill', 34) + '</div>' +
      '<h3>ابحث عن دوائك</h3><p>اكتب الاسم العلمي أو التجاري، بالعربية أو الإنجليزية.</p></div>';
    return;
  }
  const matches = [];
  for (const [d, hay] of state.haystacks) {
    if (hay.indexOf(q) !== -1) { matches.push(d); if (matches.length >= 50) break; }
  }
  if (!matches.length) {
    view.innerHTML = '<div class="empty-state"><div class="empty-ic">' + icon('search', 34) + '</div>' +
      '<h3>لم نجد نتائج مطابقة</h3><p>جرّب البحث باسم علمي أو تجاري بالعربية أو الإنجليزية.</p></div>';
    return;
  }
  /* بلا عنوان «النتائج» وبلا عدّاد — البطاقات تظهر مباشرة، كما في التطبيق. */
  view.innerHTML = '<div class="drug-list">' + matches.map(drugCard).join('') + '</div>';
  bindCardActions(view);
}

/* ================= الصفحة الرئيسية ================= */
function renderHome() {
  const c = state.core;
  const view = $('#view');
  if (state.searching) { runSearch(); return; }
  view.innerHTML =
    '<div class="sections-head">' +
      '<div class="sec-titles"><div class="sec-kicker">خدمات الدليل</div>' +
      '<div class="sec-title">استكشف الأقسام</div></div>' +
      '<span class="sec-count">٩ أقسام</span>' +
    '</div>' +
    '<div class="features-surface">' +
      '<div class="features-watermark">' + icon('pill', 200) + '</div>' +
      '<div class="tiles">' + SECTIONS.map(s =>
        '<button class="tile" data-goto="#/section/' + s.key + '">' +
          '<span class="tile-ic ' + s.tile + '">' + icon(s.icon, 29) + '</span>' +
          '<h3>' + esc(s.title) + '</h3>' +
        '</button>').join('') +
      '</div>' +
    '</div>' +
    '<div class="reason-badge-wrap">' +
      '<a class="reason-badge" href="https://t.me/Med_tips_and_tricks" target="_blank" rel="noopener">' +
        TELEGRAM_SVG + 'Done by Dr. Reason</a>' +
    '</div>';
  view.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
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

/* ترويسة الصفحة الفرعية — مطابقة activity_section/activity_interaction:
   شريط متدرج فيه «خدمات الدليل» + العنوان + زر الرئيسية (+ زر القائمة
   عند عرض أصناف صف). */
function pageHead(title, withListBack, listBackHref) {
  return '<div class="page-head">' +
    '<div class="ph-titles"><div class="ph-kicker">خدمات الدليل</div>' +
    '<div class="ph-title">' + esc(title) + '</div></div>' +
    (withListBack ? '<button class="ph-btn list" data-goto="' + listBackHref + '">' + icon('arrow', 18) + 'القائمة</button>' : '') +
    '<button class="ph-btn home" data-goto="#/">' + icon('arrow', 18) + 'الرئيسية</button>' +
  '</div>';
}
function bindPageHeadBtns(root) {
  root.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
}

async function renderSection(key, rowId) {
  const meta = sectionMeta(key);
  const view = $('#view');
  if (key === 'interactions') { renderInteractions(); return; }
  if (key === 'prescriptions') {
    view.innerHTML = pageHead(meta.title, false) +
      '<div class="placeholder"><div class="ph-ic">' + icon('clipboard', 49) + '</div>' +
      '<h3>لا توجد بيانات للوصفات</h3>' +
      '<p>لا توجد بيانات وصفات في قاعدة البيانات، لذلك لا يمكن عرض وصفات هنا.<br>هذه الواجهة جاهزة لربط البيانات الأصلية عند توفرها — ولم نضع أي بيانات مختلقة.</p>' +
      '<span class="flag">واجهة جاهزة لربط البيانات الأصلية</span></div>';
    bindPageHeadBtns(view);
    return;
  }
  if (key === 'diseases') await ensureExtraSafe('diseases');
  if (key === 'adverse') await ensureExtraSafe('effects');
  if (rowId != null) { renderSectionDrugs(key, Number(rowId)); return; }

  view.innerHTML = pageHead(meta.title, false) +
    '<div id="secBody"><div class="loading"><div class="spin"></div>جاري تجهيز القائمة…</div></div>';
  bindPageHeadBtns(view);

  if (key === 'priced') {
    const drugs = sortedByAr(state.core.drugs, d => d.drugName_ar, d => d.drugName_en);
    renderDrugListPage(drugs);
    return;
  }
  const rows = sectionRows(key);
  const searchable = (key === 'diseases' || key === 'adverse');
  state.sectionQuery = '';
  state.listShown = 100;
  $('#secBody').innerHTML =
    (searchable ? '<div class="section-search"><input id="secSearch" type="search" placeholder="ابحث في القائمة…" autocomplete="off"></div>' : '') +
    '<div class="section-count" id="secCount"></div>' +
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
      '<span class="chev">' + icon('chevron', 24) + '</span></button>').join('') ||
      '<div class="empty-state"><h3>لا توجد عناصر مطابقة</h3></div>';
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

function renderDrugListPage(drugs) {
  state.listShown = 100;
  const body = $('#secBody');
  const draw = () => {
    const shown = drugs.slice(0, state.listShown);
    body.innerHTML = '<div class="section-count">' + fmt(drugs.length) + ' دواء</div>' +
      '<div class="drug-list">' + shown.map(drugCard).join('') + '</div>' +
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
  const view = $('#view');
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
  view.innerHTML = pageHead(title || meta.title, true, '#/section/' + key) +
    '<div class="section-count">' + fmt(drugs.length) + ' دواء</div>' +
    (drugs.length
      ? '<div class="drug-list">' + drugs.map(drugCard).join('') + '</div>'
      : '<div class="empty-state"><h3>لا توجد أصناف مسجلة هنا</h3></div>');
  bindPageHeadBtns(view);
  bindCardActions(view);
}

/* ================= تفاصيل الدواء — مطابقة activity_details.xml =================
   الترتيب الأصلي: الاسم (إنجليزي ثم عربي) → العبوة+الوحدة → السعر →
   الوكيل → الشركة → الاسم العلمي → الفئة → [فئة الأمراض، التركيبة،
   آلية العمل] → دواعي الاستعمال → [الجرعة، التحذيرات، فئة الحمل،
   الآثار الجانبية والتفاعلات القابلان للطي] → أصناف مشابهة. */
function dSection(title, inner) {
  return '<div class="d-section"><h3>' + esc(title) + '</h3>' + inner + '</div>';
}

async function renderDrug(id, openSimilar) {
  const c = state.core;
  const view = $('#view');
  const d = c.drugs.find(x => x.id === id);
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
  const na = 'غير متوفر';

  let h = '<div class="details">' +
    '<div class="details-head"><div class="details-title">تفاصيل العلاج</div>' +
    '<a class="back-chip" href="#/">' + icon('arrow', 18) + 'النتائج</a></div>' +
    '<div class="d-name-en" dir="ltr" style="text-align:right">' + esc(d.drugName_en || drugNameAr(d)) + '</div>' +
    '<div class="d-name-ar">' + esc(drugNameAr(d)) + '</div>' +
    '<div class="divider"></div>' +
    '<div class="detail-pack"><b>العبوة :</b> ' + esc((d.pack || '').trim() || na) +
    '    <b>الوحدة :</b> ' + esc((d.unit || '').trim() || na) + '</div>';

  h += dSection('السعر', '<p class="d-value price">' +
    ((d.price || '').trim() ? esc(d.price.trim()) + ' ريال يمني' : na) + '</p>');
  h += dSection('الوكيل', '<p class="d-value">' +
    esc(proxy ? ((proxy.proxyName_ar || '').trim() || proxy.proxyName_en || '') : na) + '</p>');
  h += dSection('الشركة المنتجة', '<p class="d-value">' +
    esc(comp ? ((comp.companyName_ar || '').trim() || comp.companyName_en || '') + (comp.country_ar ? ' (' + comp.country_ar + ')' : '') : na) + '</p>');
  h += dSection('الاسم العلمي',
    '<p class="d-value" dir="ltr" style="text-align:right">' + esc(s ? (s.scientificName_en || na) : na) + '</p>' +
    '<p class="d-value">' + esc(s ? (s.scientificName_ar || na) : na) + '</p>');

  const classNames = classes.map(x => (x.classAr || '').trim() || x.classEn || '').filter(Boolean);
  h += dSection('الفئة', classNames.length
    ? '<div class="chips">' + classNames.map(n => '<span class="chip">' + esc(n) + '</span>').join('') + '</div>'
    : '<p class="d-value">' + na + '</p>');

  if (info) {
    const diseaseNames = diseases.map(did => {
      const dd = (state.diseases || []).find(x => x.diseaseId === did);
      return dd ? ((dd.diseaseAr || '').trim() || dd.diseaseEn || '') : '';
    }).filter(Boolean);
    if (diseaseNames.length) {
      h += dSection('فئة الأمراض', '<div class="chips">' +
        diseaseNames.map(n => '<span class="chip">' + esc(n) + '</span>').join('') + '</div>');
    }
    if ((info.chemicalComposition || '').trim()) {
      h += dSection('التركيبة الكيميائية', '<p class="d-value ltr">' + esc(info.chemicalComposition.trim()) + '</p>');
    }
    const ar = f => (info[f + 'Ar'] || '').trim() ? info[f + 'Ar'] : (info[f + 'En'] || '');
    if (ar('mechanismOfAction').trim()) {
      h += dSection('آلية العمل', '<p class="d-value">' + esc(ar('mechanismOfAction')) + '</p>');
    }
  }

  h += dSection('دواعي الاستعمال', '<p class="d-value">' +
    esc((indAr || '').trim() ? indAr.replace(/\r\n/g, '\n').replace(/\r/g, '\n') : 'لا تتوفر دواعي استعمال موثقة لهذا الصنف في قاعدة البيانات.') + '</p>');

  if (info) {
    const ar = f => (info[f + 'Ar'] || '').trim() ? info[f + 'Ar'] : (info[f + 'En'] || '');
    const dosageParts = [];
    if ((info.dosageAr || info.dosageEn || '').trim()) dosageParts.push(['', ar('dosage')]);
    if (ar('adults').trim()) dosageParts.push(['البالغون', ar('adults')]);
    if (ar('children').trim()) dosageParts.push(['الأطفال', ar('children')]);
    if (ar('theElderly').trim()) dosageParts.push(['كبار السن', ar('theElderly')]);
    if (dosageParts.length) {
      h += dSection('الجرعة', dosageParts.map(p =>
        (p[0] ? '<p class="dose-label">' + esc(p[0]) + '</p>' : '') +
        '<p class="d-value">' + esc(p[1]) + '</p>').join(''));
    }
    if (ar('warnings').trim()) {
      h += dSection('التحذيرات والاحتياطات', '<p class="d-value">' + esc(ar('warnings')) + '</p>');
    }
    if (preg) {
      h += dSection('فئة الحمل', '<p class="d-value">' + esc(preg) + '</p>');
    }
    h += '<div class="coll"><button class="coll-head" type="button" data-coll="effects">عرض الآثار الجانبية ‹</button>' +
      '<div class="coll-body" id="effectsBody" hidden>جاري التحميل…</div></div>';
    h += '<div class="coll"><button class="coll-head" type="button" data-coll="inter">عرض التفاعلات ‹</button>' +
      '<div class="coll-body" id="interBody" hidden>جاري التحميل…</div></div>';
  }

  const similar = c.drugs.filter(x => x.idScien === d.idScien && x.id !== d.id).slice(0, 50);
  h += '<div class="d-section"><h3>أصناف مشابهة</h3>' +
    (similar.length
      ? '<div class="similar-list drug-list">' + similar.map(drugCard).join('') + '</div>'
      : '<p class="similar-empty">لا توجد أصناف مشابهة مسجّلة لهذا الاسم العلمي.</p>') +
    '</div>';
  h += '</div>';
  view.innerHTML = h;
  bindCardActions(view);
  view.querySelectorAll('.coll-head').forEach(b => {
    b.addEventListener('click', () => {
      const body = b.parentElement.querySelector('.coll-body');
      const open = body.hidden;
      body.hidden = !open;
      b.textContent = b.textContent.replace(open ? '‹' : '›', open ? '›' : '‹');
    });
  });

  if (openSimilar) {
    const el = view.querySelector('.d-section:last-child h3');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
  if (info) fillCollapsibles(d.idScien);
}

async function fillCollapsibles(sciId) {
  try { await ensureExtra('effects'); } catch (e) { /* يبقى نص التحميل */ }
  const eb = $('#effectsBody');
  if (eb) {
    const ids = (state.sciEffects && state.sciEffects[sciId]) || [];
    const names = ids.map(id => (state.effects || []).find(x => x.effectsId === id)).filter(Boolean)
      .map(x => (x.sideEffectsAr || '').trim() || x.sideEffectsEn);
    eb.innerHTML = names.length
      ? names.map(n => '<div class="fx-item">• ' + esc(n) + '</div>').join('')
      : 'لا توجد بيانات مسجلة';
  }
  try { await ensureExtra('interactions'); } catch (e) { /* يبقى نص التحميل */ }
  const ib = $('#interBody');
  if (ib) {
    const posts = (state.postsBySci && state.postsBySci[sciId]) || [];
    ib.innerHTML = posts.length
      ? posts.slice(0, 50).map(p => {
          const label = seriousLabel(p);
          return '<div class="inter-post">' +
            (label ? '<div class="sev">' + esc(label) + '</div>' : '') +
            '<p>' + esc((p.textAr || '').trim() || p.textEn || '') + '</p></div>';
        }).join('') + (posts.length > 50 ? '<p class="more-note">عرض أول 50 من ' + fmt(posts.length) + ' تفاعلاً مسجلاً</p>' : '')
      : 'لا توجد بيانات مسجلة';
  }
}

/* ================= فاحص التفاعلات — مطابقة activity_interaction.xml ================= */
function renderInteractions() {
  const view = $('#view');
  view.innerHTML = pageHead('التفاعلات الدوائية', false) +
    '<p style="margin:0 0 4px;font-size:14.5px;color:var(--muted)">اختر دوائين بالاسم العلمي لفحص التفاعل بينهما. التفاعلات المعروضة هي المسجلة في قاعدة البيانات فقط — وما ليس مسجلاً يظهر كرسالة صريحة، لا كإجابة مختلقة.</p>' +
    '<label class="checker-label" style="margin-top:14px">الاسم العلمي الأول</label>' +
    '<div class="pick-box" id="pickA">اختر دواء…</div>' +
    '<button class="swap-btn" id="swapBtn" type="button">⇄ تبديل</button>' +
    '<label class="checker-label">الاسم العلمي الثاني</label>' +
    '<div class="pick-box" id="pickB">اختر دواء…</div>' +
    '<button class="check-btn" id="checkBtn" type="button" disabled>فحص التفاعل</button>' +
    '<div class="check-result" id="checkResult"></div>';
  bindPageHeadBtns(view);
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
    (posts.length > shown.length ? '<p class="more-note">عرض أول ' + shown.length + ' من ' + fmt(posts.length) + ' تفاعلاً مسجلاً</p>' : '');
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
  /* الصفحات الفرعية (قسم/تفاصيل/فاحص) بلا ترويسة وبلا بطاقة بحث — كما في التطبيق. */
  document.body.classList.toggle('subpage', parts.length > 0);
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

document.addEventListener('DOMContentLoaded', () => {
  const box = $('#searchBox');
  let timer = null;
  box.addEventListener('focus', enterSearch);
  box.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.searchQuery = box.value.trim(); runSearch(); }, 200);
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter') { state.searchQuery = box.value.trim(); enterSearch(); }
  });
  $('#searchTrigger').addEventListener('click', () => {
    state.searchQuery = box.value.trim();
    enterSearch();
    box.focus();
  });
  $('#homeFromSearch').addEventListener('click', showHome);
  window.addEventListener('hashchange', render);
  loadCore().then(() => {
    render();
  }).catch(err => {
    $('#view').innerHTML = '<div class="empty-state"><h3>تعذّر تحميل البيانات</h3><p>' + esc(err.message || '') + '</p><p>تحقق من الاتصال بالإنترنت ثم أعد تحميل الصفحة. ملفات البيانات في مجلد data/ بجانب هذه الصفحة.</p></div>';
  });
});

/* تثبيت كتطبيق (PWA): service worker يخبّئ الموقع فيعمل دون اتصال
   بعد أول زيارة، ويتيح «تثبيت التطبيق» من متصفح كروم. */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
