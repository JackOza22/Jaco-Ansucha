# Jaco & Anuscha — portfolio site

Interactive joint portfolio for a homeschooling teaching couple. Plain HTML/CSS/JS
(no build step) with a Three.js armillary sphere and a live 3D exam-question demo.

## Concept

Everything orbits the learner. Green is Jaco (instructional design, 3D/AI, science,
sport). Maroon is Anuscha (curriculum, languages, mathematics, pastoral care). That
colour code repeats through bios, the classroom ledger, ExamStudio, the timeline
and the gallery — so the site *shows* two teachers, not one teacher and a helper.

Copy is written for **high-paying private households and agencies** (travel years,
two learners of different ages, live-in or live-out, relocation). It is not locked
to one job reference. To retarget a named brief, search `TAILOR` in `js/content.js`
and rewrite the `application` object only.

## Run locally

ES modules and media detection need `http://`, not `file://`.

```bash
cd project
python -m http.server 8000
```

Then open `http://localhost:8000`. Cursor Live Server on `project/index.html` also works.

## Edit copy

All words live in `js/content.js`. Do not hardcode sentences into `index.html` or `main.js`.

Jaco’s TEFL certificate and police clearance are listed as **held** (not in progress).

## Photos, videos, CVs

Drop files using these exact names:

- `assets/photos/jaco-portrait.jpg`
- `assets/photos/anuscha-portrait.jpg`
- Gallery files listed in the `gallery` array in `js/content.js`
- `assets/jaco-cv.pdf` and `assets/anuscha-cv.pdf` (Download CV links on the contact cards)

Placeholders swap out automatically. No code edits.

## GitHub Pages (free)

From the **repository root** (the folder that contains `project/`):

```bash
git init
git add .
git commit -m "Add Jaco and Anuscha teaching-couple portfolio"
git branch -M main
```

Create a GitHub repo (github.com/new), then:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

On GitHub: **Settings → Pages → Build and deployment → GitHub Actions**.
The workflow in `.github/workflows/pages.yml` publishes the `project/` folder.
Site URL: `https://YOUR_USER.github.io/YOUR_REPO/`

`.nojekyll` is already in `project/` so GitHub will not run Jekyll.

### Netlify (also free)

Drag the `project` folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
or connect the repo — `netlify.toml` already sets `publish = "project"`.

## Structure

```
project/index.html      Structure only
project/css/style.css   Tokens: moss = Jaco, oxblood = Anuscha, brass = shared
project/js/content.js   All copy — edit this first
project/js/orrery.js    3D subject sphere
project/js/studio.js    3D plant-labelling exam demo
project/js/main.js      Renders content, gallery, contact CVs
```
