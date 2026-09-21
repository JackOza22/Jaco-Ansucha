/**
 * main.js
 * -----------------------------------------------------------------------
 * Renders every section from js/content.js and wires interactions.
 * All copy comes from CONTENT — do not hardcode sentences here.
 * -----------------------------------------------------------------------
 */
import { initOrrery } from "./orrery.js?v=58";
import { initStudio } from "./studio.js?v=34";
import { initChamber } from "./chamber.js?v=53";
import { initCinematic } from "./cinematic.js?v=52";
import { initLearn } from "./learn.js?v=48";

const PHOTO_V = "v=57";
const photoSrc = (src) => (src && !src.includes("?") ? `${src}?${PHOTO_V}` : src);
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
};

function assetExists(path, kind = "image") {
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    window.setTimeout(() => done(false), 1200);
    if (kind === "video") {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => done(true);
      v.onerror = () => done(false);
      v.src = path;
      return;
    }
    const img = new Image();
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = path;
  });
}

function renderNav() {
  const nav = $("#topnav");
  CONTENT.nav.forEach(item => {
    const a = el("a", null, item.label);
    a.href = item.href;
    a.dataset.magnetic = "";
    nav.appendChild(a);
  });
  const toggle = $("#navToggle");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const links = [...nav.querySelectorAll("a")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  CONTENT.nav.forEach(item => {
    const sec = document.getElementById(item.href.slice(1));
    if (sec) io.observe(sec);
  });
}

function renderHero() {
  $("#heroEyebrow").textContent = CONTENT.hero.eyebrow;
  const h = CONTENT.hero;
  $("#heroHeading").innerHTML = `
    <span class="line-moss">${h.heading}</span>
    <span class="line-ox">${h.headingLine2 || ""}</span>
    <span>${h.headingLine3 || ""}</span>
  `;
  $("#heroSub").textContent = CONTENT.hero.sub;
  $("#heroScrollCue").textContent = CONTENT.hero.scrollCue;
  const cast = $("#heroCast");
  (CONTENT.hero.cast || []).forEach((member) => {
    const li = el("li", `hero-cast-item hero-cast-item--${member.person}`);
    li.innerHTML = `<strong>${member.name}</strong><span>${member.role}</span>`;
    cast.appendChild(li);
  });
  const pills = $("#heroPills");
  const app = CONTENT.application;
  [
    app.start,
    app.arrangement,
    app.learners
  ].forEach(label => {
    const li = el("li", "hero-pill", label);
    pills.appendChild(li);
  });
}

function renderOrrery() {
  const earth = CONTENT.earth || {};
  const night = $("#globeNightLabel");
  const day = $("#globeDayLabel");
  const caption = $("#globeCaption");
  if (night) night.textContent = earth.night || "Night";
  if (day) day.textContent = earth.day || "Day";
  if (caption) caption.textContent = earth.caption || "";
  const canvas = $("#orreryCanvas");
  const api = initOrrery(canvas);
  const slider = $("#globeDayNight");
  if (slider && api.setDayNight) {
    const sync = () => {
      api.lockSun?.(true);
      api.setDayNight(Number(slider.value) / 100);
    };
    slider.addEventListener("input", sync);
    slider.addEventListener("pointerdown", () => api.lockSun?.(true));
  }
  return api;
}

function wrapWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((w, i) => {
    const span = document.createElement("span");
    span.className = "word";
    span.style.setProperty("--i", String(i));
    span.textContent = w;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
}

function filmFound(n, total) {
  const tpl = (CONTENT.film && CONTENT.film.found) || "{n} / {total} labelled";
  return tpl.replace("{n}", n).replace("{total}", total);
}

async function renderPerson(containerId, person) {
  const container = $(`#${containerId}`);
  const hasPhoto = await assetExists(person.photoPlaceholder);
  const initials = person.name.split(" ").map(w => w[0]).slice(0, 2).join("");

  const photoInner = hasPhoto
    ? `<img src="${photoSrc(person.photoPlaceholder)}" alt="${person.name}">`
    : `<span>Add a portrait at<br><code>${person.photoPlaceholder}</code><br><em>${initials}</em></span>`;

  container.innerHTML = `
    <div class="cast-still">
      <div class="person-photo">
        ${photoInner}
        <div class="cast-grade" aria-hidden="true"></div>
        <div class="cast-leak" aria-hidden="true"></div>
        <div class="cast-sweep" aria-hidden="true"></div>
        <div class="cast-grain" aria-hidden="true"></div>
      </div>
      <div class="cast-title">
        <p class="cast-credit">${person.credit || person.role}</p>
        <h3 class="person-name">${person.name}</h3>
        <p class="person-role">${person.role}</p>
      </div>
    </div>
    <div class="cast-dossier">
      <p class="person-bio">${person.bio}</p>
      <div class="person-sub">
        <h4>Education &amp; certification</h4>
        <ul>${person.credentials.map(c => `<li>${c}</li>`).join("")}</ul>
      </div>
      <div class="person-sub">
        <h4>Languages</h4>
        <div class="person-langs">
          ${person.languages.map(l => `<span class="lang-pill">${l.name}, ${l.level}</span>`).join("")}
        </div>
      </div>
      <p class="person-interests">${person.interests}</p>
      <div class="person-sub">
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:${person.email}">${person.email}</a></li>
          <li>${person.phone}</li>
          <li>${person.location}</li>
          <li><a class="person-cv" href="${person.cv}" download>${CONTENT.closing.cvLabel}</a></li>
        </ul>
      </div>
    </div>
  `;
}

function renderProblem() {
  const p = CONTENT.problem;
  if (!p) return;
  $("#problemHeading").textContent = p.heading;
  wrapWords($("#problemHeading"));
  $("#problemLead").textContent = p.lead;
  $("#problemBody").textContent = p.body;
  const photos = $("#problemPhotos");
  if (photos && p.photos) {
    p.photos.forEach((photo) => {
      const figure = el("figure", "problem-photo");
      figure.innerHTML = `<img src="${photoSrc(photo.file)}" alt="${photo.alt || ""}" loading="lazy"><figcaption>${photo.caption || ""}</figcaption>`;
      photos.appendChild(figure);
    });
  }
}

function renderAlternative() {
  const a = CONTENT.alternative;
  if (!a) return;
  $("#alternativeHeading").textContent = a.heading;
  $("#alternativeIntro").textContent = a.intro;
  $("#alternativeBody").textContent = a.body;
  $("#alternativeClose").textContent = a.close;
  const pair = $("#workPair");
  a.photos.forEach((photo) => {
    const figure = el("figure", `work-shot work-shot--${photo.person}`);
    figure.innerHTML = `<img src="${photoSrc(photo.file)}" alt="${photo.alt}" loading="lazy"><figcaption>${photo.caption}</figcaption>`;
    pair.appendChild(figure);
  });
}

function renderTogether() {
  const t = CONTENT.together;
  if (!t) return;
  $("#togetherKicker").textContent = t.kicker;
  $("#togetherHeading").textContent = t.heading;
  wrapWords($("#togetherHeading"));
  const copy = $("#togetherCopy");
  t.paragraphs.forEach((para) => copy.appendChild(el("p", null, para)));
  const reel = $("#togetherReel");
  if (reel && t.reel) {
    const unique = t.reel;
    const loop = [...unique, ...unique];
    loop.forEach((still, i) => {
      const btn = el("button", "reel-still");
      btn.type = "button";
      btn.style.setProperty("--focus", still.focus || "center 20%");
      btn.setAttribute("aria-label", `View photo: ${still.alt || "photo"}`);
      btn.innerHTML = `
        <span class="reel-frame"><img src="${photoSrc(still.file)}" alt="" draggable="false"></span>
        <span class="reel-label">View</span>
        <span class="reel-preview"><img src="${photoSrc(still.file)}" alt="${still.alt || ""}" draggable="false"></span>
      `;
      btn.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("reel:open", {
          detail: { items: unique, index: i % unique.length }
        }));
      });
      reel.appendChild(btn);
    });
  }
}

function renderStats() {
  const row = $("#statsRow");
  if (!row || !CONTENT.stats) return;
  CONTENT.stats.forEach((stat, i) => {
    const tone = i % 2 === 0 ? "jaco" : "anuscha";
    const li = el("li", `stat stat--${tone}`);
    li.innerHTML = `<p class="stat-n" data-count="${stat.value}" data-suffix="${stat.suffix || ""}">0</p><p class="stat-label">${stat.label}</p>`;
    row.appendChild(li);
  });
}

function renderCredits() {
  const node = $("#creditsLine");
  if (!node || !CONTENT.credits) return;
  node.textContent = `${CONTENT.credits}  ·  ${CONTENT.credits}  ·  `;
}

function renderPeople() {
  const kicker = $("#peopleKicker");
  const heading = $("#peopleHeading");
  if (kicker) kicker.textContent = CONTENT.people.kicker || "";
  if (heading) heading.textContent = CONTENT.people.heading || "";
  return Promise.all([
    renderPerson("personJaco", CONTENT.people.jaco),
    renderPerson("personAnuscha", CONTENT.people.anuscha)
  ]);
}

function subjectPlate(id) {
  const plates = {
    sciences: `<svg viewBox="0 0 420 260" role="img" aria-label="A flask, a leaf, and an atom">
      <rect width="420" height="260" fill="#e4efe4"/>
      <circle cx="312" cy="92" r="62" fill="none" stroke="#3F5C44" stroke-width="1.6"/>
      <ellipse cx="312" cy="92" rx="62" ry="22" fill="none" stroke="#3F5C44" stroke-width="1.3"/>
      <ellipse cx="312" cy="92" rx="22" ry="62" fill="none" stroke="#6d8f74" stroke-width="1.3" transform="rotate(28 312 92)"/>
      <circle cx="374" cy="92" r="7" fill="#7A2E27"/>
      <circle cx="312" cy="30" r="6" fill="#A67C3D"/>
      <circle cx="268" cy="132" r="5" fill="#1c2228"/>
      <circle cx="312" cy="92" r="10" fill="#1c2228"/>
      <path d="M118 150c22-58 36-58 52 0" fill="#b7d7b0" stroke="#2f4a36" stroke-width="1.4"/>
      <path d="M144 92v58" stroke="#2f4a36" stroke-width="1.3"/>
      <path d="M144 118c-16 4-22 14-18 22M144 128c16-2 24 8 20 18" fill="none" stroke="#2f4a36" stroke-width="1.2"/>
      <path d="M48 168h92l-14 36H62z" fill="#f7f3ea" stroke="#1c2228" stroke-width="1.7"/>
      <path d="M62 168c8-34 56-34 64 0" fill="#cfe6dc" stroke="#3F5C44" stroke-width="1.3"/>
      <circle cx="86" cy="156" r="4" fill="#7A2E27"/>
      <circle cx="108" cy="146" r="3" fill="#A67C3D"/>
      <circle cx="74" cy="148" r="2.5" fill="#3F5C44"/>
      <rect x="0" y="222" width="420" height="38" fill="#3F5C44"/>
      <text x="24" y="246" fill="#f4efe6" font-size="13" letter-spacing="2.2" font-family="Georgia, serif">SEE IT, THEN TAKE IT APART</text>
    </svg>`,
    technology: `<svg viewBox="0 0 420 260" role="img" aria-label="A lesson screen and a network of steps">
      <rect width="420" height="260" fill="#e6eef3"/>
      <rect x="28" y="24" width="210" height="176" rx="10" fill="#f7f4ee" stroke="#1c2228" stroke-width="1.6"/>
      <rect x="44" y="40" width="96" height="10" rx="2" fill="#3F5C44"/>
      <rect x="44" y="60" width="178" height="7" rx="2" fill="#d5ddd8"/>
      <rect x="44" y="76" width="150" height="7" rx="2" fill="#d5ddd8"/>
      <rect x="44" y="100" width="84" height="48" rx="6" fill="#3F5C44"/>
      <rect x="138" y="100" width="84" height="48" rx="6" fill="#A67C3D"/>
      <rect x="44" y="160" width="178" height="22" rx="11" fill="#1c2228"/>
      <circle cx="292" cy="58" r="12" fill="#7A2E27"/>
      <circle cx="360" cy="40" r="9" fill="#3F5C44"/>
      <circle cx="382" cy="108" r="11" fill="#A67C3D"/>
      <circle cx="318" cy="132" r="8" fill="#1c2228"/>
      <circle cx="366" cy="168" r="7" fill="#7A2E27"/>
      <path d="M304 64l48-20M302 68l72 34M300 66l14 58M326 136l34 28" fill="none" stroke="#1c2228" stroke-width="1.4"/>
      <rect x="0" y="222" width="420" height="38" fill="#243044"/>
      <text x="24" y="246" fill="#f4efe6" font-size="13" letter-spacing="2.2" font-family="Georgia, serif">BUILD IT, AND USE IT WELL</text>
    </svg>`,
    history: `<svg viewBox="0 0 420 260" role="img" aria-label="A map route leading to a monument">
      <rect width="420" height="260" fill="#efe4d2"/>
      <path d="M24 22h250v182H24z" fill="#f8f1e3" stroke="#1c2228" stroke-width="1.5"/>
      <path d="M48 168c36-18 48-78 92-86 34-6 42 30 74 22 22-6 34-34 48-26" fill="none" stroke="#7A2E27" stroke-width="2.2"/>
      <circle cx="48" cy="168" r="6" fill="#3F5C44"/>
      <circle cx="262" cy="78" r="6" fill="#7A2E27"/>
      <path d="M300 176V96h46v80" fill="none" stroke="#1c2228" stroke-width="1.8"/>
      <path d="M286 96h74l-37-34z" fill="#A67C3D" stroke="#1c2228" stroke-width="1.4"/>
      <rect x="314" y="118" width="18" height="28" fill="#f7f3ea" stroke="#1c2228" stroke-width="1.2"/>
      <path d="M318 86h10M336 72v14" stroke="#7A2E27" stroke-width="1.3"/>
      <rect x="0" y="222" width="420" height="38" fill="#7A2E27"/>
      <text x="24" y="246" fill="#f4efe6" font-size="13" letter-spacing="2.2" font-family="Georgia, serif">GO THERE, THEN STUDY IT</text>
    </svg>`,
    languages: `<svg viewBox="0 0 420 260" role="img" aria-label="An open book and a pen">
      <rect width="420" height="260" fill="#f3ebe6"/>
      <path d="M36 36h150c10 22 10 90 0 118H36z" fill="#fbf7f2" stroke="#1c2228" stroke-width="1.6"/>
      <path d="M186 36h150c-10 22-10 90 0 118H186z" fill="#f6efe8" stroke="#1c2228" stroke-width="1.6"/>
      <path d="M186 36v118" stroke="#7A2E27" stroke-width="1.6"/>
      <path d="M56 64h108M56 82h96M56 100h104M56 118h70" stroke="#c9b8ae" stroke-width="1.8"/>
      <path d="M208 64h108M208 82h92M208 100h100M208 118h64" stroke="#c9b8ae" stroke-width="1.8"/>
      <path d="M348 48c22 6 28 36 12 54-8 10-6 16 4 26" fill="none" stroke="#1c2228" stroke-width="1.7"/>
      <path d="M360 128l-10 22h22z" fill="#7A2E27"/>
      <rect x="0" y="222" width="420" height="38" fill="#7A2E27"/>
      <text x="24" y="246" fill="#f4efe6" font-size="13" letter-spacing="2.2" font-family="Georgia, serif">READ IT, THEN WRITE IT</text>
    </svg>`,
    mathematics: `<svg viewBox="0 0 420 260" role="img" aria-label="A right triangle on a grid">
      <rect width="420" height="260" fill="#eef0ea"/>
      <g stroke="#d7dbd2" stroke-width="1">
        <path d="M28 28h250M28 62h250M28 96h250M28 130h250M28 164h250M28 198h250"/>
        <path d="M28 28v170M72 28v170M116 28v170M160 28v170M204 28v170M248 28v170M278 28v170"/>
      </g>
      <path d="M56 188l150-130 62 130z" fill="#f7f4ee" stroke="#1c2228" stroke-width="1.8"/>
      <path d="M188 188v-36h36" fill="none" stroke="#7A2E27" stroke-width="1.7"/>
      <circle cx="56" cy="188" r="5" fill="#3F5C44"/>
      <circle cx="206" cy="58" r="5" fill="#A67C3D"/>
      <circle cx="268" cy="188" r="5" fill="#7A2E27"/>
      <text x="300" y="108" fill="#1c2228" font-size="22" font-family="Georgia, serif">a² + b²</text>
      <text x="300" y="140" fill="#3F5C44" font-size="16" font-family="Georgia, serif">= c²</text>
      <rect x="0" y="222" width="420" height="38" fill="#3F5C44"/>
      <text x="24" y="246" fill="#f4efe6" font-size="13" letter-spacing="2.2" font-family="Georgia, serif">A REAL PROBLEM, THEN THE METHOD</text>
    </svg>`,
    theory: `<svg viewBox="0 0 420 260" role="img" aria-label="A canvas, a brush, and a palette">
      <rect width="420" height="260" fill="#f4eee6"/>
      <rect x="28" y="24" width="210" height="176" fill="#fbf7f1" stroke="#1c2228" stroke-width="1.6"/>
      <circle cx="104" cy="104" r="40" fill="#7A2E27"/>
      <rect x="124" y="72" width="78" height="78" fill="#A67C3D" opacity=".92"/>
      <path d="M64 150c36-14 70 16 112 6" fill="none" stroke="#3F5C44" stroke-width="4"/>
      <path d="M270 36c36 10 42 52 20 78-12 16-8 26 8 42" fill="none" stroke="#1c2228" stroke-width="1.8"/>
      <path d="M288 156l-18 32h36z" fill="#3F5C44"/>
      <circle cx="352" cy="64" r="16" fill="#7A2E27"/>
      <circle cx="382" cy="92" r="13" fill="#A67C3D"/>
      <circle cx="360" cy="124" r="13" fill="#3F5C44"/>
      <circle cx="334" cy="100" r="11" fill="#1c2228"/>
      <rect x="0" y="222" width="420" height="38" fill="#7A2E27"/>
      <text x="24" y="246" fill="#f4efe6" font-size="13" letter-spacing="2.2" font-family="Georgia, serif">MAKE IT, THEN LOOK AGAIN</text>
    </svg>`
  };
  return plates[id] || plates.sciences;
}

function renderCurriculum() {
  const list = $("#curriculumList");
  const detail = $("#curriculumDetail");
  const kicker = $("#curriculumKicker");
  const subjects = CONTENT.earth?.subjects || [];
  if (!list || !detail || !subjects.length) return;
  if (kicker) kicker.textContent = CONTENT.earth.kicker || "";
  const hint = $("#curriculumHint");
  if (hint) hint.textContent = CONTENT.earth.hint || "";
  const buttons = [];
  let selected = subjects[0].id;

  function show(id) {
    selected = id;
    buttons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.id === id)));
    const subject = subjects.find((s) => s.id === id);
    if (!subject) return;
    const person = CONTENT.people[subject.person];
    const first = person.name.split(" ")[0];
    detail.innerHTML = `
      <p class="curriculum-who curriculum-who--${subject.person}">Taught by ${first}</p>
      <h3>${subject.label}</h3>
      <p>${subject.description}</p>
      <figure class="subject-plate">${subjectPlate(subject.id)}</figure>
    `;
    detail.dataset.person = subject.person;
    detail.classList.remove("is-swap");
    void detail.offsetWidth;
    detail.classList.add("is-swap");
  }

  subjects.forEach((subject) => {
    const li = el("li");
    const btn = el("button", `curriculum-btn curriculum-btn--${subject.person}`);
    btn.type = "button";
    btn.dataset.id = subject.id;
    btn.dataset.person = subject.person;
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `<span class="legend-dot legend-dot--${subject.person}"></span>${subject.label}`;
    btn.addEventListener("click", () => {
      show(subject.id);
      document.dispatchEvent(new CustomEvent("film:clack"));
    });
    li.appendChild(btn);
    list.appendChild(li);
    buttons.push(btn);
  });
  show(selected);

  window.addEventListener("curriculum:step", (e) => {
    const dir = e.detail || 1;
    const i = Math.max(0, subjects.findIndex((s) => s.id === selected));
    show(subjects[(i + dir + subjects.length) % subjects.length].id);
  });
}

function renderRhythmVisual(visual) {
  if (!visual) return "";
  if (visual.kind === "frameworks") {
    const cards = (visual.cards || []).map((card, i) => `
      <article class="framework-card framework-card--${i}">
        <span>${card.code}</span>
        <strong>${card.name}</strong>
        ${card.note ? `<em>${card.note}</em>` : ""}
      </article>`).join("");
    const chips = (visual.chips || []).map((chip) => `<li>${chip}</li>`).join("");
    const plate = visual.plate
      ? `<figure class="lesson-plate"><img src="${photoSrc(visual.plate.file)}" alt="${visual.plate.alt || ""}"></figure>`
      : "";
    return `<div class="rhythm-stage" aria-hidden="true">
      <div class="lesson-visual lesson-visual--frameworks">
        ${plate}
        <div class="framework-board">${cards}</div>
        <ul class="framework-subjects">${chips}</ul>
      </div>
    </div>`;
  }
  if (visual.kind === "pair") {
    const pane = (side, tone) => `
      <figure class="lesson-pane lesson-pane--${tone}${side.fit === "contain" ? " lesson-pane--fit" : ""}">
        <img src="${photoSrc(side.file)}" alt="${side.alt || ""}" loading="lazy">
        <figcaption>
          <span>${side.kicker}</span>
          <strong>${side.title}</strong>
          <em>${side.note}</em>
        </figcaption>
      </figure>`;
    const proofs = (visual.proofs || []).map((shot) => `
      <figure class="lesson-proof">
        <img src="${photoSrc(shot.file)}" alt="${shot.alt || ""}" loading="lazy">
        <span>${shot.label}</span>
      </figure>`).join("");
    return `<div class="rhythm-stage" aria-hidden="true">
      <div class="lesson-visual lesson-visual--pair">
        ${pane(visual.left, "anuscha")}
        <p class="lesson-amp">&amp;</p>
        ${pane(visual.right, "jaco")}
        ${proofs ? `<div class="lesson-proofs">${proofs}</div>` : ""}
      </div>
    </div>`;
  }
  if (visual.kind === "continue") {
    const tiles = (visual.tiles || []).map((tile) => `
      <article class="lesson-tile">
        <strong>${tile.title}</strong>
        <span>${tile.note}</span>
      </article>`).join("");
    const still = visual.still || {};
    return `<div class="rhythm-stage" aria-hidden="true">
      <div class="lesson-visual lesson-visual--continue">
        <figure class="lesson-window">
          <img src="${photoSrc(still.file)}" alt="${still.alt || ""}" loading="lazy">
          <span class="lesson-play">${visual.badge || ""}</span>
        </figure>
        <div class="lesson-route"></div>
        <div class="lesson-tiles">${tiles}</div>
      </div>
    </div>`;
  }
  return "";
}

function renderClassroom() {
  const c = CONTENT.classroom;
  if ($("#classroomHeading")) $("#classroomHeading").textContent = c.heading;
  $("#classroomIntro").textContent = c.intro;
  $("#classroomJacoName").textContent = c.jacoTitle;
  $("#classroomAnuschaName").textContent = c.anuschaTitle;
  if ($("#classroomResult") && c.result) $("#classroomResult").textContent = c.result;

  const rhythm = $("#rhythm");
  CONTENT.classroom.rhythm.forEach(beat => {
    const li = el("li", `rhythm-beat rhythm-beat--${(beat.visual && beat.visual.kind) || "copy"}`);
    li.innerHTML = `
      <div class="rhythm-copy">
        <p class="rhythm-time">${beat.time}</p>
        <h3>${beat.title}</h3>
        <p>${beat.text}</p>
      </div>
      ${renderRhythmVisual(beat.visual)}
    `;
    rhythm.appendChild(li);
  });

  const renderRows = (targetId, rows) => {
    const target = $(`#${targetId}`);
    rows.forEach(row => {
      target.appendChild(el("div", "ledger-row", `<h4>${row.title}</h4><p>${row.text}</p>`));
    });
  };
  renderRows("classroomJacoRows", CONTENT.classroom.columns.jaco);
  renderRows("classroomAnuschaRows", CONTENT.classroom.columns.anuscha);
  renderCurriculum();
}

function renderStudio() {
  const s = CONTENT.studio;
  $("#studioEyebrow").textContent = s.eyebrow;
  $("#studioHeading").textContent = s.heading;
  $("#studioIntro").textContent = s.intro;
  const tasks = s.demo.tasks || [];
  let step = 0;
  $("#studioPrompt").textContent = tasks[0]?.ask || s.demo.prompt;
  $("#studioQuestion").textContent = s.demo.question;
  const score = $("#studioScore");
  const total = tasks.length || s.demo.parts.length;
  if (score) score.textContent = filmFound(0, total);

  const steps = $("#studioSteps");
  if (steps && s.steps) {
    s.steps.forEach((step, i) => {
      const li = el("li", `studio-step studio-step--${step.person}`);
      li.innerHTML = `<span class="studio-step-n">${String(i + 1).padStart(2, "0")}</span><h3>${step.title}</h3><p>${step.text}</p>`;
      steps.appendChild(li);
    });
  }

  const notes = $("#studioNotes");
  s.notes.forEach(note => {
    notes.appendChild(el("li", "studio-note", `<h3>${note.title}</h3><p>${note.text}</p>`));
  });

  const choices = $("#studioChoices");
  const detail = $("#studioDetail");
  const found = new Set();
  const buttons = new Map();

  s.demo.parts.forEach(part => {
    const li = el("li");
    const btn = el("button");
    btn.type = "button";
    btn.textContent = part.label;
    btn.addEventListener("click", () => grade(part.id));
    li.appendChild(btn);
    choices.appendChild(li);
    buttons.set(part.id, btn);
  });

  function showPart(part, extra) {
    detail.innerHTML = `<p class="studio-found">${part.label}</p><p>${part.fact}</p>${extra || ""}`;
  }

  function grade(id) {
    const part = s.demo.parts.find(p => p.id === id);
    const task = tasks[step];
    if (!part || !task) return;
    if (id !== task.id) {
      api.flash(id);
      buttons.forEach((btn, key) => btn.setAttribute("aria-pressed", String(key === id)));
      showPart(part, `<p class="studio-miss">Look again. ${task.ask}</p>`);
      return;
    }
    found.add(id);
    api.markFound(id);
    buttons.forEach((btn, key) => btn.setAttribute("aria-pressed", String(found.has(key))));
    step += 1;
    if (score) score.textContent = filmFound(found.size, total);
    const done = step >= tasks.length;
    showPart(part, done ? `<p class="studio-complete">${s.demo.complete}</p>` : "");
    $("#studioPrompt").textContent = done ? s.demo.prompt : tasks[step].ask;
  }

  const api = initStudio($("#studioCanvas"), s.demo, {
    onPick: grade,
    onHover(id) {
      const hover = $("#studioHover");
      if (!hover) return;
      const part = s.demo.parts.find(p => p.id === id);
      hover.textContent = part ? part.label : "";
    },
    onTrace(id) {
      const part = s.demo.parts.find(p => p.id === id);
      if (!part) return;
      detail.innerHTML = `<p class="studio-found">${part.label}</p><p>${s.demo.water}</p>`;
    }
  });
  const explodeBtn = $("#studioExplode");
  const waterBtn = $("#studioWater");
  const resetBtn = $("#studioReset");
  if (explodeBtn) {
    explodeBtn.addEventListener("click", () => {
      const open = api.toggleExplode();
      explodeBtn.textContent = open ? "Put back" : "Pull apart";
      explodeBtn.setAttribute("aria-pressed", String(open));
    });
  }
  if (waterBtn) waterBtn.addEventListener("click", () => api.traceWater());
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      api.resetView();
      if (explodeBtn) {
        explodeBtn.textContent = "Pull apart";
        explodeBtn.setAttribute("aria-pressed", "false");
      }
    });
  }
  detail.innerHTML = `<p class="studio-detail-hint">${s.demo.hint}</p>`;

  const room = s.classroom;
  const still = $("#classroomStillImg");
  if (room && still) {
    still.src = photoSrc(room.file);
    still.alt = room.alt;
    const cap = $("#classroomStillCap");
    if (cap) cap.textContent = room.caption;
  }
  if (CONTENT.learn) {
    const kicker = $("#learnKicker");
    const lead = $("#learnLead");
    if (kicker) kicker.textContent = CONTENT.learn.kicker;
    if (lead) lead.textContent = CONTENT.learn.lead;
    initLearn($("#learnApp"), $("#learnBg"), CONTENT.learn, still);
  }
  return api;
}

function renderChamber() {
  const c = CONTENT.chamber;
  if (!c) return null;
  if ($("#chamberKicker")) $("#chamberKicker").textContent = c.kicker;
  if ($("#chamberHeading")) $("#chamberHeading").textContent = c.heading;
  if ($("#chamberBody")) $("#chamberBody").textContent = c.body;
  if ($("#chamberHint")) $("#chamberHint").textContent = c.hint;
  const canvas = $("#chamberCanvas");
  if (!canvas) return null;

  const fact = $("#chamberFact");
  const modelsEl = $("#chamberModels");
  const explodeBtn = $("#chamberExplode");
  const assembleBtn = $("#chamberAssemble");
  if (explodeBtn) explodeBtn.textContent = c.explode || "Explode";
  if (assembleBtn) assembleBtn.textContent = c.assemble || "Assemble";

  function showFact(part, model) {
    if (!fact || !model) return;
    if (!part?.id) {
      fact.innerHTML = `<p class="chamber-subject">${model.subject}</p><h3>${model.label}</h3><p>${model.intro}</p>`;
      return;
    }
    fact.innerHTML = `<p class="chamber-subject">${model.subject}</p><h3>${part.label}</h3><p>${part.fact}</p>`;
  }

  const api = initChamber(canvas, c, showFact);

  function markModel(id) {
    modelsEl?.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.id === id));
    });
  }

  (c.models || []).forEach((m, i) => {
    const btn = el("button", "chamber-model");
    btn.type = "button";
    btn.textContent = m.label;
    btn.dataset.id = m.id;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-pressed", String(i === 0));
    btn.addEventListener("click", () => {
      api.setModel(m.id);
      markModel(m.id);
    });
    modelsEl?.appendChild(btn);
  });

  explodeBtn?.addEventListener("click", () => api.setExplode(true));
  assembleBtn?.addEventListener("click", () => api.setExplode(false));
  if (c.models?.[0]) showFact({ id: "" }, c.models[0]);

  document.addEventListener("chamber:step", (e) => {
    api.nextModel(e.detail || 1);
    markModel(api.getModelId());
  });
  return api;
}

function renderEdu() {
  const chips = CONTENT.edu?.chips || [];
  if (!chips.length) return;
  document.querySelectorAll("[data-edu]").forEach((sec) => {
    const field = el("div", "edu-field");
    field.setAttribute("aria-hidden", "true");
    chips.forEach((chip, i) => {
      const span = el("span", `edu-chip edu-chip--${chip.tone || "brass"}`, chip.label);
      span.style.setProperty("--d", `${(i * 1.85) % 11}s`);
      span.style.setProperty("--x", chip.x);
      span.style.setProperty("--y", chip.y);
      field.appendChild(span);
    });
    sec.prepend(field);
  });
}

function renderExperience() {
  const list = $("#timeline");
  CONTENT.experience.forEach(item => {
    const li = el("li", "tl-item");
    li.innerHTML = `
      <div class="tl-dates">${item.dates}</div>
      <div>
        <div class="tl-role-row">
          <span class="tl-dot tl-dot--${item.personTag}"></span>
          <span class="tl-role">${item.role}</span>
        </div>
        ${item.who ? `<p class="tl-who">${item.who}</p>` : ""}
        <div class="tl-org">${item.org}</div>
        <ul class="tl-bullets">${item.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderTestimonials() {
  $("#testimonialsIntro").textContent = CONTENT.testimonials.intro;
  const grid = $("#testimonialGrid");
  (CONTENT.testimonials.cards || []).forEach(card => {
    if (!grid) return;
    grid.appendChild(el(
      "article",
      `ref-card ref-card--${card.person}`,
      `<h3>${card.title}</h3><p>${card.text}</p>`
    ));
  });

  const faq = $("#faq");
  CONTENT.faq.forEach(item => {
    const details = el("details", "faq-item");
    details.innerHTML = `<summary>${item.q}</summary><p>${item.a}</p>`;
    faq.appendChild(details);
  });
}

async function renderGallery() {
  const intro = document.querySelector("#moments .moments-intro");
  if (intro && CONTENT.galleryIntro) intro.innerHTML = CONTENT.galleryIntro;
  const strip = document.getElementById("filmstrip");
  const tools = document.getElementById("galleryTools");
  const hero = document.getElementById("galleryHero");
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightboxImg");
  const vidEl = document.getElementById("lightboxVideo");
  const capEl = document.getElementById("lightboxCaption");
  const idxEl = document.getElementById("lightboxIndex");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  const closeBtn = document.getElementById("lightboxClose");
  if (!strip || !lightbox || !imgEl || !vidEl || !capEl) return;
  const reel = [];
  let current = 0;
  let filter = "all";
  let expanded = false;
  const previewLimit = 6;
  const moreBtn = el("button", "gallery-more");
  moreBtn.type = "button";
  moreBtn.hidden = true;
  strip.parentElement?.appendChild(moreBtn);
  moreBtn.addEventListener("click", () => {
    expanded = !expanded;
    applyFilter();
  });

  if (prevBtn) prevBtn.textContent = (CONTENT.film && CONTENT.film.prev) || "Prev";
  if (nextBtn) nextBtn.textContent = (CONTENT.film && CONTENT.film.next) || "Next";

  (CONTENT.galleryFilters || [
    { id: "all", label: "All" }
  ]).forEach((item, i) => {
    if (!tools) return;
    const btn = el("button", "gallery-filter");
    btn.type = "button";
    btn.textContent = item.label;
    btn.dataset.filter = item.id;
    btn.setAttribute("aria-pressed", String(i === 0));
    btn.addEventListener("click", () => {
      filter = item.id;
      expanded = false;
      tools.querySelectorAll(".gallery-filter").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      applyFilter();
      document.dispatchEvent(new CustomEvent("film:clack"));
    });
    tools.appendChild(btn);
  });
  if (tools && !tools.querySelector(".gallery-count")) {
    tools.appendChild(el("p", "gallery-count", ""));
  }

  function visibleReel() {
    if (filter === "all") return reel;
    return reel.filter((entry) => entry.item.person === filter);
  }

  function applyFilter() {
    let match = 0;
    strip.querySelectorAll(".postcard").forEach((card) => {
      const ok = filter === "all" || card.dataset.person === filter;
      if (!ok) {
        card.hidden = true;
        return;
      }
      match += 1;
      card.hidden = !expanded && match > previewLimit;
    });
    const vis = visibleReel();
    if (vis[0]) setHero(vis[0]);
    else if (hero) hero.hidden = true;
    const count = tools?.querySelector(".gallery-count");
    if (count) {
      count.textContent = !expanded && match > previewLimit
        ? `${previewLimit} of ${match}`
        : `${match} photo${match === 1 ? "" : "s"}`;
    }
    moreBtn.hidden = match <= previewLimit;
    moreBtn.textContent = expanded ? "Show fewer" : "More photos";
    moreBtn.setAttribute("aria-expanded", String(expanded));
  }

  function setHero(entry) {
    if (!hero || !entry) return;
    hero.hidden = false;
    hero.dataset.person = entry.item.person;
    const media = entry.item.type === "video"
      ? `<video src="${entry.path}" muted loop playsinline></video>`
      : `<img src="${entry.path}" alt="${entry.item.caption}">`;
    hero.innerHTML = `${media}<span>${entry.item.caption}</span>`;
    hero.querySelector("video")?.play().catch(() => {});
    hero.onclick = () => openAt(reel.indexOf(entry));
  }

  function openAt(i) {
    reelView = null;
    const vis = visibleReel();
    if (!vis.length) return;
    const inVis = vis.findIndex((entry) => entry === reel[i]);
    const next = inVis >= 0 ? vis[inVis] : vis[0];
    current = reel.indexOf(next);
    openLightbox(next.item, next.path);
  }

  let reelView = null;
  function showReel() {
    const item = reelView.items[reelView.index];
    openLightbox({ caption: item.alt || "Photo", type: "photo" }, photoSrc(item.file));
    if (idxEl) {
      idxEl.textContent = `${String(reelView.index + 1).padStart(2, "0")} / ${String(reelView.items.length).padStart(2, "0")}`;
    }
    if (prevBtn) prevBtn.hidden = reelView.items.length < 2;
    if (nextBtn) nextBtn.hidden = reelView.items.length < 2;
  }
  document.addEventListener("reel:open", (e) => {
    reelView = { items: e.detail.items, index: e.detail.index || 0 };
    showReel();
  });

  function step(dir) {
    if (reelView) {
      const n = reelView.items.length;
      reelView.index = (reelView.index + dir + n) % n;
      showReel();
      return;
    }
    const vis = visibleReel();
    if (!vis.length) return;
    let i = vis.findIndex((entry) => entry === reel[current]);
    if (i < 0) i = 0;
    const next = vis[(i + dir + vis.length) % vis.length];
    current = reel.indexOf(next);
    openLightbox(next.item, next.path);
  }

  function openLightbox(item, path) {
    capEl.textContent = item.caption;
    if (idxEl) {
      const vis = visibleReel();
      const n = Math.max(1, vis.findIndex((entry) => entry.item === item) + 1);
      idxEl.textContent = `${String(n).padStart(2, "0")} / ${String(vis.length).padStart(2, "0")}`;
      if (prevBtn) prevBtn.hidden = vis.length < 2;
      if (nextBtn) nextBtn.hidden = vis.length < 2;
    }
    strip.querySelectorAll(".postcard").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.path === path);
    });
    if (item.type === "video") {
      imgEl.hidden = true;
      vidEl.hidden = false;
      vidEl.src = path;
      vidEl.play().catch(() => {});
    } else {
      vidEl.pause();
      vidEl.removeAttribute("src");
      vidEl.hidden = true;
      imgEl.hidden = false;
      imgEl.src = path;
      imgEl.alt = item.caption;
    }
    lightbox.hidden = false;
    document.body.classList.add("is-lightbox");
    document.dispatchEvent(new CustomEvent("film:lightbox", { detail: { open: true } }));
    document.dispatchEvent(new CustomEvent("film:clack"));
  }
  function closeLightbox() {
    reelView = null;
    lightbox.hidden = true;
    document.body.classList.remove("is-lightbox");
    vidEl.pause();
    strip.querySelectorAll(".postcard").forEach((card) => card.classList.remove("is-active"));
    document.dispatchEvent(new CustomEvent("film:lightbox", { detail: { open: false } }));
  }
  window.addEventListener("gallery:step", (e) => {
    if (lightbox.hidden) return;
    step(e.detail || 1);
  });
  window.addEventListener("gallery:nudge", (e) => {
    const vis = visibleReel();
    if (!vis.length) return;
    let i = vis.findIndex((entry) => entry === reel[current]);
    if (i < 0) i = 0;
    const next = vis[(i + (e.detail || 1) + vis.length) % vis.length];
    setHero(next);
    current = reel.indexOf(next);
  });
  prevBtn?.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  nextBtn?.addEventListener("click", (e) => { e.stopPropagation(); step(1); });
  closeBtn?.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  for (const item of CONTENT.gallery) {
    const folder = item.type === "video" ? "assets/videos" : "assets/photos";
    const path = photoSrc(`${folder}/${item.file}`);
    const exists = item.type === "photo"
      ? true
      : await assetExists(path, "video");

    const card = el("button", `postcard postcard--${item.person}`);
    card.type = "button";
    card.dataset.person = item.person;
    card.dataset.path = path;
    const media = el("div", "postcard-media");

    if (exists && item.type === "photo") {
      media.innerHTML = `<img src="${path}" alt="${item.caption}" loading="lazy">`;
    } else if (exists && item.type === "video") {
      media.innerHTML = `<video src="${path}" muted loop playsinline preload="metadata"></video>
        <span class="postcard-play" aria-hidden="true">▶</span>`;
      const video = media.querySelector("video");
      card.addEventListener("mouseenter", () => video.play().catch(() => {}));
      card.addEventListener("pointermove", () => setHero(reel.find((r) => r.path === path)));
      card.addEventListener("mouseleave", () => video.pause());
    } else {
      media.innerHTML = `<span class="postcard-placeholder-label">${item.type === "video" ? "Video" : "Photo"} placeholder<br>Add <code>${path}</code></span>`;
    }

    card.appendChild(media);
    card.appendChild(el("div", "postcard-caption", item.caption));
    if (exists) {
      const index = reel.length;
      const entry = { item, path };
      reel.push(entry);
      card.addEventListener("pointerenter", () => setHero(entry));
      card.addEventListener("click", () => {
        if (card.dataset.dragged === "1") return;
        openAt(index);
      });
      if (index === 0) setHero(entry);
    }
    strip.appendChild(card);
  }
  applyFilter();

  const workPair = document.getElementById("workPair");
  workPair?.querySelectorAll("figure").forEach((figure) => {
    const img = figure.querySelector("img");
    if (!img) return;
    figure.classList.add("is-live");
    figure.addEventListener("click", () => {
      const match = reel.find((entry) => img.src.includes(entry.item.file));
      if (match) openAt(reel.indexOf(match));
    });
  });

  if (prevBtn) prevBtn.hidden = reel.length < 2;
  if (nextBtn) nextBtn.hidden = reel.length < 2;
}

function renderTravel() {
  const intro = $("#travelIntro");
  const row = $("#stampRow");
  if (!intro || !row || !CONTENT.travel) return;
  intro.textContent = CONTENT.travel.intro;
  CONTENT.travel.stamps.forEach((stamp, i) => {
    const li = el("li", "stamp-cell");
    const span = el("span", `stamp stamp--${stamp.person}`, stamp.label);
    span.dataset.person = stamp.person;
    span.dataset.magnetic = "";
    span.style.setProperty("--rot", `${(i % 2 === 0 ? -1 : 1) * (1 + (i % 3))}deg`);
    li.appendChild(span);
    row.appendChild(li);
  });
}

function renderClosing() {
  $("#closingLine").textContent = CONTENT.closing.line;
  wrapWords($("#closingLine"));
  $("#closingSub").textContent = CONTENT.closing.sub;

  function fillCard(node, person, modifier) {
    node.classList.add(`contact-card--${modifier}`);
    node.innerHTML = `
      <strong>${person.name}</strong>
      <a href="mailto:${person.email}">${person.email}</a>
      <span>${person.phone}</span>
      <a class="contact-cv" href="${person.cv}" download>${CONTENT.closing.cvLabel}</a>
    `;
  }
  fillCard($("#contactJaco"), CONTENT.people.jaco, "jaco");
  fillCard($("#contactAnuscha"), CONTENT.people.anuscha, "anuscha");
}

function decorateScenes() {
  (CONTENT.scenes || []).forEach((scene) => {
    const sec = document.getElementById(scene.id);
    if (!sec || sec.querySelector(".scene-kicker")) return;
    const heading = sec.querySelector("h2");
    const kicker = document.createElement(heading ? "span" : "p");
    kicker.className = heading ? "scene-kicker" : "scene-kicker scene-kicker--float";
    kicker.textContent = `${scene.n}  ${scene.title}`;
    if (heading) heading.prepend(kicker);
    else sec.prepend(kicker);
  });
}

document.title = CONTENT.meta.title;
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content", CONTENT.meta.description);

function releaseLoader() {
  document.body.classList.remove("is-loading");
  document.getElementById("loader")?.remove();
}

window.setTimeout(releaseLoader, 5000);

(async function boot() {
  try {
    renderNav();
    renderHero();
    const orrery = renderOrrery();
    renderProblem();
    renderAlternative();
    renderTogether();
    renderStats();
    renderClassroom();
    const studio = renderStudio();
    const chamber = renderChamber();
    renderEdu();
    renderExperience();
    renderTestimonials();
    renderTravel();
    renderClosing();
    renderCredits();
    decorateScenes();
    initCinematic({ orrery, studio, chamber });
    renderPeople().catch((err) => console.warn(err));
    renderGallery().catch((err) => console.warn(err));
  } catch (err) {
    console.error(err);
    releaseLoader();
  }
})();
