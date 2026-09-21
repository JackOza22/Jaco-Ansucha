/**
 * Interactive preview of the learner app. No names are shown.
 * The background is drawn on a canvas so it still moves when the
 * system asks pages to reduce CSS animation.
 */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

const ICONS = {
  week: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 3.5v3M16 3.5v3M4 9h16" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  lessons: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.5h9.5M5 12h14M5 17.5h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  assess: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 4.8V9h4.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  guide: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v5M12 8.2h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 3.5v3M16 3.5v3M8 13h3M13 13h3M8 16.5h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  progress: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17V8M10 17V5M15 17v-6M20 17V9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  resources: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="6" width="16" height="12" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 10h8M8 13.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  library: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5.5h4.2v13H6a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zm7.8 0H18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-4.2V5.5z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`
};

const SIDE_ICONS = ["week", "lessons", "assess", "guide", "calendar", "progress", "resources", "library"];

export function initLearn(root, canvas, data, still) {
  if (!root || !data) return;
  const subjects = data.subjects;
  const state = {
    subject: 0,
    lesson: 2,
    item: 3,
    q: 0,
    pick: null,
    result: null,
    correct: 0,
    asked: 0,
    side: 1,
    stars: 0,
    open: true,
    note: ""
  };

  const subjectOf = () => subjects[state.subject];
  const lessonOf = () => subjectOf().lessons[state.lesson];
  const itemOf = () => lessonOf().items[state.item] || lessonOf().items[0];

  function paint() {
    const subject = subjectOf();
    const lesson = lessonOf();
    const item = itemOf();
    const quiz = item.quiz || null;
    const question = quiz ? quiz.questions[state.q] : null;
    const totalQ = quiz ? quiz.questions.length : 0;
    const progress = quiz && state.asked ? Math.round((state.correct / totalQ) * 100) : (item.done ? 100 : 18);

    root.innerHTML = `
      <header class="lms-top">
        <div class="lms-brand" aria-hidden="true"><span></span></div>
        <label class="lms-subject">
          <span class="visually-hidden">Subject</span>
          <select id="lmsSubject" aria-label="Subject">
            ${subjects.map((s, i) => `<option value="${i}" ${i === state.subject ? "selected" : ""}>${esc(s.name)}</option>`).join("")}
          </select>
        </label>
        <p class="lms-who">Lessons <span>· ${esc(data.grade)}</span></p>
      </header>
      <nav class="lms-side" aria-label="App sections">
        <p class="lms-side-label">This Week</p>
        <ul>
          ${data.side.map((name, i) => `
            <li>
              <button type="button" class="lms-nav ${state.side === i ? "is-on" : ""}" data-side="${i}">
                ${ICONS[SIDE_ICONS[i]] || ""}
                <span>${esc(name)}</span>
              </button>
            </li>`).join("")}
        </ul>
      </nav>
      <aside class="lms-lessons" aria-label="Lessons">
        <div class="lms-lessons-bar">
          <button type="button" class="lms-back" id="lmsBack" aria-label="Lesson list">‹</button>
          <strong>Lessons</strong>
        </div>
        <ul>
          ${subject.lessons.map((les, i) => `
            <li class="${i === state.lesson ? "is-open" : ""}">
              <button type="button" class="lms-les ${i === state.lesson ? "is-on" : ""}" data-lesson="${i}">
                <b>${les.n}</b>
                <span>${esc(les.title)}${les.continued ? " (continued)" : ""}<small>${esc(les.range)}</small></span>
              </button>
              ${i === state.lesson ? `<ul class="lms-items">
                ${les.items.map((it, j) => `
                  <li>
                    <button type="button" class="lms-item ${j === state.item ? "is-on" : ""}" data-item="${j}">
                      <i class="lms-kind lms-kind--${esc(it.kind)}"></i>
                      <span>${esc(it.title)}</span>
                      ${it.done ? `<em aria-label="Done">●</em>` : `<em aria-hidden="true">○</em>`}
                    </button>
                  </li>`).join("")}
              </ul>` : ""}
            </li>`).join("")}
        </ul>
      </aside>
      <section class="lms-main" aria-live="polite">
        ${state.side === 1 ? mainLesson(lesson, item, quiz, question, totalQ, progress) : mainPanel(data.side[state.side])}
      </section>`;

    root.querySelector("#lmsSubject").addEventListener("change", (e) => {
      state.subject = Number(e.target.value);
      state.lesson = 0;
      state.item = 0;
      resetQuiz();
      paint();
    });
    root.querySelectorAll("[data-side]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.side = Number(btn.dataset.side);
        state.note = "";
        paint();
      });
    });
    root.querySelectorAll("[data-lesson]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = Number(btn.dataset.lesson);
        if (next === state.lesson && state.open) return;
        state.lesson = next;
        state.item = 0;
        state.side = 1;
        resetQuiz();
        paint();
      });
    });
    root.querySelectorAll("[data-item]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.item = Number(btn.dataset.item);
        state.side = 1;
        resetQuiz();
        paint();
      });
    });
    root.querySelector("#lmsBack")?.addEventListener("click", () => {
      root.classList.toggle("is-menu");
    });
    wireMain(quiz, question);
  }

  function resetQuiz() {
    state.q = 0;
    state.pick = null;
    state.result = null;
    state.correct = 0;
    state.asked = 0;
    state.note = "";
    state.stars = 0;
  }

  function mainLesson(lesson, item, quiz, question, totalQ, progress) {
    if (quiz && question) {
      const letters = ["A", "B", "C", "D"];
      return `
        <div class="lms-green">
          <b>${lesson.n}</b>
          <span>${esc(item.quiz.title)}</span>
          <time>${esc(lesson.range)}</time>
        </div>
        <div class="lms-body">
          <h3>${esc(quiz.title)}</h3>
          <p>${esc(quiz.instruction)}</p>
          <p class="lms-count">Question ${state.q + 1} of ${totalQ}</p>
          <p class="lms-prompt">${esc(quiz.prompt)}</p>
          <p class="lms-word">${esc(question.word)}</p>
          <div class="lms-options" role="radiogroup" aria-label="Answer">
            ${question.options.map((opt, i) => `
              <button type="button" class="lms-opt ${state.pick === i ? "is-on" : ""} ${state.result && i === question.answer ? "is-yes" : ""} ${state.result === "no" && state.pick === i && i !== question.answer ? "is-no" : ""}" data-opt="${i}" ${state.result ? "disabled" : ""}>
                <i>${letters[i]}</i> ${esc(opt)}
              </button>`).join("")}
          </div>
          <p class="lms-why" id="lmsWhy">${state.result ? esc(question.why) : ""}</p>
          <div class="lms-actions">
            ${state.result && state.q < totalQ - 1 ? `<button type="button" class="lms-submit" id="lmsNext">Next question</button>` : ""}
            ${state.result && state.q === totalQ - 1 ? `<button type="button" class="lms-submit" id="lmsAgain">Try the set again</button>` : ""}
            ${!state.result ? `<button type="button" class="lms-submit" id="lmsSubmit" ${state.pick === null ? "disabled" : ""}>Submit</button>` : ""}
          </div>
        </div>
        ${footer(progress, quiz)}`;
    }
    return `
      <div class="lms-green">
        <b>${lesson.n}</b>
        <span>${esc(item.title)}</span>
        <time>${esc(lesson.range)}</time>
      </div>
      <div class="lms-body">
        <h3>${esc(item.title)}</h3>
        <p class="lms-read">${esc(item.text || "")}</p>
        <div class="lms-actions">
          <button type="button" class="lms-submit" id="lmsRead">${item.done ? "Marked complete" : "Mark as complete"}</button>
        </div>
      </div>
      ${footer(item.done ? 100 : 40, null)}`;
  }

  function footer(progress, quiz) {
    const stars = [1, 2, 3, 4, 5].map((n) => `<button type="button" class="lms-star ${n <= state.stars ? "is-on" : ""}" data-star="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("");
    return `
      <footer class="lms-foot">
        <p><i class="lms-status"></i> Status: ${progress >= 100 ? "Complete" : "Incomplete"}</p>
        <div class="lms-bar" aria-hidden="true"><span style="width:${progress}%"></span></div>
        <div class="lms-rate"><span>Rate this resource</span><span class="lms-stars">${stars}</span></div>
        <button type="button" class="lms-report" id="lmsReport">Report a problem</button>
        <p class="lms-note">${esc(state.note)}</p>
        <div class="lms-turn">
          <button type="button" id="lmsPrev" ${state.lesson === 0 ? "disabled" : ""}>Prev.</button>
          <button type="button" id="lmsNextLes">Next lesson</button>
        </div>
      </footer>`;
  }

  function mainPanel(name) {
    const blurbs = {
      "This Week": "This week’s lessons sit in the list. Open Lessons to start the one that is due.",
      "Assessments": "Assessments open when a unit is finished. In a live class they are marked by the teacher, not by a public scoreboard.",
      "Guidance Sessions": "A guidance session is a short check-in with the teacher. Times are set with the family, not shown on this preview.",
      "Calendar": "The calendar holds lesson dates and travel days. Nothing here is a real booking.",
      "Progress and Reports": "Progress stays with the family. This preview does not store a name, a score, or a report.",
      "Resources": "Resources are the files the teacher attaches to a lesson: a reading, a diagram, a worked example.",
      "Library": "The library is the shelf of past lessons. A learner can reopen one without starting the week again."
    };
    return `
      <div class="lms-green"><b></b><span>${esc(name)}</span><time>Preview</time></div>
      <div class="lms-body lms-panel">
        <h3>${esc(name)}</h3>
        <p class="lms-read">${esc(blurbs[name] || "This part of the app is shown as a preview.")}</p>
        <div class="lms-actions"><button type="button" class="lms-submit" id="lmsToLessons">Back to lessons</button></div>
      </div>
      ${footer(0, null)}`;
  }

  function wireMain(quiz, question) {
    root.querySelectorAll("[data-opt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.pick = Number(btn.dataset.opt);
        paint();
      });
    });
    root.querySelector("#lmsSubmit")?.addEventListener("click", () => {
      if (state.pick === null || !question) return;
      state.result = state.pick === question.answer ? "yes" : "no";
      state.asked += 1;
      if (state.result === "yes") state.correct += 1;
      paint();
    });
    root.querySelector("#lmsNext")?.addEventListener("click", () => {
      state.q += 1;
      state.pick = null;
      state.result = null;
      paint();
    });
    root.querySelector("#lmsAgain")?.addEventListener("click", () => {
      resetQuiz();
      paint();
    });
    root.querySelector("#lmsRead")?.addEventListener("click", () => {
      itemOf().done = true;
      paint();
    });
    root.querySelector("#lmsReport")?.addEventListener("click", () => {
      state.note = state.note ? "" : "Noted in this preview only. Nothing is sent.";
      paint();
    });
    root.querySelectorAll("[data-star]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.stars = Number(btn.dataset.star);
        paint();
      });
    });
    root.querySelector("#lmsPrev")?.addEventListener("click", () => stepLesson(-1));
    root.querySelector("#lmsNextLes")?.addEventListener("click", () => stepLesson(1));
    root.querySelector("#lmsToLessons")?.addEventListener("click", () => {
      state.side = 1;
      paint();
    });
  }

  function stepLesson(dir) {
    const lessons = subjectOf().lessons;
    const next = state.lesson + dir;
    if (next < 0 || next >= lessons.length) return;
    state.lesson = next;
    state.item = 0;
    state.side = 1;
    resetQuiz();
    paint();
  }

  paint();
  startField(canvas);
  driftStill(still);
}

function startField(canvas) {
  if (!canvas) return;
  const stage = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const orbs = Array.from({ length: 7 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 80 + Math.random() * 180,
    hue: i % 2 ? 168 : 198,
    s: 0.15 + Math.random() * 0.35,
    p: Math.random() * Math.PI * 2
  }));
  const specks = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    v: 0.012 + Math.random() * 0.03,
    a: 0.25 + Math.random() * 0.55
  }));
  let raf = 0;
  let running = true;

  function resize() {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(t) {
    if (!running) return;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#070b18";
    ctx.fillRect(0, 0, w, h);
    orbs.forEach((o, i) => {
      const x = (o.x + Math.sin(t * 0.00015 * o.s + o.p) * 0.08) * w;
      const y = (o.y + Math.cos(t * 0.00012 * o.s + o.p) * 0.06) * h;
      const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
      g.addColorStop(0, `hsla(${o.hue + Math.sin(t * 0.0002 + i)}, 80%, 62%, .38)`);
      g.addColorStop(1, "hsla(220, 40%, 8%, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
    specks.forEach((s) => {
      s.y -= s.v * 0.0016;
      if (s.y < -0.02) s.y = 1.02;
      ctx.fillStyle = `rgba(232, 244, 255, ${s.a})`;
      ctx.fillRect(s.x * w, s.y * h, 1.6, 1.6);
    });
    const beam = ctx.createLinearGradient(0, 0, w, h);
    beam.addColorStop(0, "rgba(20, 180, 190, .0)");
    beam.addColorStop(0.5, `rgba(40, 210, 220, ${0.05 + Math.sin(t * 0.0004) * 0.03})`);
    beam.addColorStop(1, "rgba(20, 40, 90, 0)");
    ctx.fillStyle = beam;
    ctx.fillRect(0, 0, w, h);
    raf = requestAnimationFrame(frame);
  }

  resize();
  raf = requestAnimationFrame(frame);
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState !== "hidden";
    if (running) raf = requestAnimationFrame(frame);
    else cancelAnimationFrame(raf);
  });
}

function driftStill(img) {
  if (!img) return;
  let raf = 0;
  const tick = (t) => {
    const x = Math.sin(t * 0.00008) * 1.6;
    const y = Math.cos(t * 0.00006) * 1.2;
    img.style.transform = `scale(1.08) translate(${x}%, ${y}%)`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") cancelAnimationFrame(raf);
  });
}
