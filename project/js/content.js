/**
 * CONTENT.js
 * -----------------------------------------------------------------------
 * Every word of copy on the site lives here. Edit this file to change
 * text, you should not need to touch index.html or the JS logic.
 *
 * TAILOR, search this word. The `application` object is the only block
 * you should rewrite when aiming at one family or agency brief. The rest
 * of the site stays a universal teaching-couple portfolio.
 *
 * Colour code: moss = Jaco, oxblood = Anuscha, brass = shared.
 * -----------------------------------------------------------------------
 */

const CONTENT = {

  meta: {
    title: "Jaco & Anuscha, Governess and Instructional Designer",
    description: "Two educators. Two disciplines. No fixed address. A complete education, built around your child."
  },

  nav: [
    { href: "#problem", label: "The problem" },
    { href: "#classroom", label: "How it works" },
    { href: "#people", label: "About us" },
    { href: "#studio", label: "The app" },
    { href: "#chamber", label: "The lab" },
    { href: "#together", label: "Together" },
    { href: "#moments", label: "Moments" },
    { href: "#contact", label: "Contact" }
  ],

  /* TAILOR, rewrite this object for a named family or job reference.
     Leave it as-is for a broad portfolio (Duke & Duchess, similar agencies,
     live-in or live-out, one child or two, settled home or a travel year). */
  application: {
    eyebrow: "Governess · Instructional Designer",
    start: "Available January 2027",
    arrangement: "Live-in or live-out, as the household needs",
    schedule: "Full-time, 5/2 rhythm, flexible on travel days",
    travel: "No fixed address: worldschooling, travel years, and settled home classrooms",
    relocate: "Open to relocation",
    learners: "Built around one child, or two, at different stages"
  },

  overture: {
    kicker: "Picture start",
    mark: "J & A",
    line: "Two educators. Two disciplines. No fixed address."
  },

  scenes: [
    { id: "model", n: "01", title: "NO FIXED ADDRESS" },
    { id: "problem", n: "02", title: "THE PROBLEM" },
    { id: "alternative", n: "03", title: "THE ALTERNATIVE" },
    { id: "classroom", n: "04", title: "HOW IT WORKS" },
    { id: "people", n: "05", title: "ABOUT US" },
    { id: "studio", n: "06", title: "THE APP" },
    { id: "chamber", n: "07", title: "THE LAB" },
    { id: "together", n: "08", title: "TOGETHER" },
    { id: "experience", n: "09", title: "THE RECORD" },
    { id: "moments", n: "10", title: "FIELD NOTES" },
    { id: "contact", n: "11", title: "END TITLES" }
  ],

  film: {
    skip: "Skip",
    soundOn: "Sound on",
    soundOff: "Sound off",
    chapters: "Chapters",
    close: "Close",
    keys: "← → lessons  ·  C chapters  ·  M sound  ·  Space hold",
    paused: "Hold",
    take: "Take 01",
    found: "{n} / {total} labelled",
    prev: "Prev",
    next: "Next",
    stageLabel: "Cinematic Earth. Scroll to the limb. Drag to turn. Night and day on the slider."
  },

  stats: [
    { value: 2, suffix: "", label: "Disciplines in one partnership" },
    { value: 5, suffix: "+", label: "Years of teaching across diverse classrooms" },
    { value: 3, suffix: "+", label: "Years co-educating in the same house" },
    { value: 5, suffix: "", label: "Languages between us" }
  ],

  credits: "Anuscha van Niekerk · Governess · Jaco van Dyk · Instructional Designer · Two educators · Two disciplines · No fixed address · EdTech studio · Built to travel · TEFL · Police clearance certificate · Paediatric first aid · Available January 2027",

  hero: {
    eyebrow: "Governess and instructional designer · January 2027",
    heading: "Two educators.",
    headingLine2: "Two disciplines.",
    headingLine3: "No fixed address.",
    sub: "A complete education, built around your child.",
    scrollCue: "Scroll toward the limb · drag to turn",
    cast: [
      { person: "anuscha", name: "Anuscha van Niekerk", role: "Governess" },
      { person: "jaco", name: "Jaco van Dyk", role: "Instructional Designer (EdTech)" }
    ]
  },

  earth: {
    caption: "The classroom is the world.",
    night: "Night",
    day: "Day",
    kicker: "Who teaches what",
    hint: "Choose a discipline. Moss is Jaco, oxblood is Anuscha.",
    subjects: [
      {
        id: "sciences",
        label: "Natural Sciences",
        person: "jaco",
        lat: -3, lon: -60,
        description: "Hands-on science: models, demonstration, experiments and video, including interactive 3D diagrams the learner can turn and take apart.",
        image: { file: "assets/photos/lesson-models.jpg", alt: "A hands-on models lesson at the table" }
      },
      {
        id: "technology",
        label: "Technology and AI literacy",
        person: "jaco",
        lat: 37, lon: -122,
        description: "Children learn to build apps using AI so they stay up to date with a competitive industry, and they learn to use AI responsibly. AI is not used to do the work for anyone. The custom exam studio has bilingual papers and 3D questions, plus device upkeep and child-safe technology wherever the family is.",
        image: { file: "assets/photos/jaco-working.jpeg", alt: "Jaco working at the computer" }
      },
      {
        id: "history",
        label: "History & place",
        person: "jaco",
        lat: 29.9, lon: 31.2,
        description: "Museum and destination based history: researched and filmed in advance, so a monument or landscape becomes a structured project, and a sick day never means falling behind."
      },
      {
        id: "languages",
        label: "Language and Literature",
        person: "anuscha",
        lat: 48.8, lon: 2.3,
        description: "Parts of speech, grammar, poetry and non-fiction reading will assist in the theories of language whereas essays, journaling and comprehension activities will focus on creative writing and critical thinking."
      },
      {
        id: "mathematics",
        label: "Mathematics",
        person: "anuscha",
        lat: 51.5, lon: -0.1,
        description: "Mathematics made meaningful by solving real life problems and finding creative ways to get around problems."
      },
      {
        id: "theory",
        label: "Fine arts",
        person: "anuscha",
        lat: -26.2, lon: 28.0,
        description: "Fine art is used to express emotion and creativity. It also assists in cognitive development through pattern recognition, spatial reasoning and executive function practice."
      }
    ]
  },

  problem: {
    heading: "Technology changed how children learn. Most education hasn’t caught up.",
    lead: "Schools move slowly by design. Tutors are rarely trained to build technology. And most EdTech apps are built for millions of children at once, which means they’re built for none of them in particular.",
    body: "Parents are left choosing between two compromises: a traditional education that hasn’t adapted to how children learn today, or a mass-market app that was never built for your child to begin with.",
    photos: [
      { file: "assets/photos/classroom.jpg", alt: "An empty classroom with desks facing a chalkboard and a map", caption: "The classroom" },
      { file: "assets/photos/educational-app.jpg", alt: "A preview of the educational app, with a lesson and a practice question", caption: "The educational app" }
    ]
  },

  alternative: {
    heading: "A third option: one partnership, built entirely around your child.",
    intro: "A partnership that combines what each side normally does alone: the daily teaching and understanding of your child, and the technology to make that learning interactive, adaptive, and personal.",
    body: "Every lesson plan is written for your child specifically. Every tool, every interactive app, every 3D model is built around how they learn, not adjusted from a template built for millions of other children.",
    close: "The result is something most families have never had access to: the depth of a private education, with the technology of an EdTech studio, in a single relationship that travels with your family wherever you go. We are a governess and an instructional designer, working as one. Not a school. Not a platform.",
    photos: [
      { file: "assets/photos/anuscha-working.jpeg", alt: "Anuscha writing a lesson by hand beside her planning screen", caption: "Anuscha, the lesson, on paper and in the plan", person: "anuscha" },
      { file: "assets/photos/jaco-working.jpeg", alt: "Jaco at his desk building learning materials", caption: "Jaco, the tools, built at the same table", person: "jaco" }
    ]
  },

  people: {
    kicker: "Scene 05 · Cast",
    heading: "About us",
    jaco: {
      name: "Jaco van Dyk",
      color: "moss",
      role: "Instructional Designer (EdTech)",
      email: "jacovandyk2205@gmail.com",
      phone: "+27 79 052 7026",
      location: "Gauteng, South Africa",
      photoPlaceholder: "assets/photos/jaco-portrait.jpg",
      credit: "Instructional designer",
      cv: "assets/jaco-cv.pdf",
      bio: "Jaco brings a background in instructional design and multimedia, built through years of designing interactive learning modules, 3D visualisation, and video-based content for professional eLearning clients. Since 2023 he has worked as Senior Multimedia Designer at The Boiler Room, building interactive courses, real-time 3D environments, and production pipelines used in commercial training and education. Alongside this, he has co-educated directly with Anuscha since May 2023, teaching Natural Sciences, Technology, and History through models, demonstration, and video, while joining school trips and practical lessons in person, from museum visits to field investigations. Where Anuscha builds the lesson plan around the child’s learning style, Jaco builds the tools and experiences that bring it to life: interactive 3D models the child can rotate and explore, a custom digital exam app he built and maintains, and filmed lessons that let learning continue if a child is unwell. His approach is simple: a child understands something faster once they can see it, touch it, or take it apart. The explanation follows from there, not the other way around. Like Anuscha, Jaco holds the same standard of discretion in a private household, with the trust of the family he has worked alongside for more than three years.",
      credentials: [
        "Diploma, 3D Animation & Visual Effects, Open Window Institute, 2018",
        "Valid passport",
        "Instructional design practice since 2018",
        "Senior Multimedia Designer, The Boiler Room, 2023 to present",
        "Real-time 3D (Unreal Engine) and custom production pipelines",
        "TEFL Certificate, Udemy, 2026",
        "Police Clearance Certificate, 2026",
        "Driving permit, Category C1, eligible in the UK and Europe"
      ],
      languages: [
        { name: "English", level: "Fluent" },
        { name: "Afrikaans", level: "Fluent" },
        { name: "French", level: "Currently learning" }
      ],
      interests: "Mixed martial arts & self-defence · outdoor activities & sport · photography & videography · 3D and AI-assisted design · documentary storytelling · different cultures & local history"
    },
    anuscha: {
      name: "Anuscha van Niekerk",
      color: "oxblood",
      role: "Governess",
      email: "anuschaza@gmail.com",
      phone: "+27 84 690 8856",
      location: "Gauteng, South Africa",
      photoPlaceholder: "assets/photos/anuscha-portrait.jpg",
      credit: "Governess",
      cv: "assets/anuscha-cv.pdf",
      bio: "Anuscha holds a Bachelor of Education in Foundation Phase Teaching, giving her the theoretical grounding and terminology to read, interpret, and apply any curriculum framework rather than simply following one. Alongside her degree she trained in child psychology and counselling, and has spent her career teaching in homeschooling environments where she was responsible for children’s academic progress, pacing, and assessment. Currently she is a governess who delivers a complete homeschooling curriculum for a Grade 5 learner alongside Jaco. She manages every subject, milestone, and progress report, while supporting the child’s emotional development in close co-ordination with therapists and specialists. Her approach regularly extends beyond the lesson plan: museum visits, theatre excursions, and other real-world experiences that turn academic material into something lived, not just studied. Before working privately, she spent three years teaching in a homeschooling academy while studying for her bachelor’s degree, with direct experience of children with ADHD, dyslexia, and autism who needed a more personalised approach. Across every setting the focus has been the same: meeting a child where they are, and building the lesson plan around them. In every role, and especially in a live-in private setting, discretion and the family’s privacy remain a priority.",
      credentials: [
        "Bachelor of Education, Foundation Phase Teaching, STADIO Higher Education, 2021 to 2025",
        "State Teaching License",
        "Valid passport",
        "TEFL Certificate, The TEFL Academy, 2018",
        "Counselling and Child Psychology, Udemy, 2019",
        "Paediatric First Aid, Pretorius Institute of Medical Excellence, 2025",
        "Police Clearance Certificate, 2026",
        "Driving permit, Category B, eligible in the UK and Europe",
        "Completed the Davis Dyslexia Program under Jan Viljoen (Dyslexia Correction Practitioner, studied in the UK)"
      ],
      languages: [
        { name: "English", level: "Fluent" },
        { name: "Afrikaans", level: "Fluent" },
        { name: "isiZulu", level: "Conversational" },
        { name: "French", level: "Currently learning" },
        { name: "Chinese", level: "Beginner" }
      ],
      interests: "Painting, sketching, arts & crafts, guitar, singing, reading, swimming, ice skating, hiking, camping, river rafting, educational games, new food, animals"
    }
  },

  classroom: {
    heading: "One curriculum. Two disciplines, applied every step of the way.",
    intro: "Every program starts with the curriculum you choose. From there, we plan every lesson together, but each of us brings a different discipline to how that lesson is built and delivered.",
    jacoTitle: "Instructional Designer",
    anuschaTitle: "Governess",
    rhythm: [
      {
        time: "Curriculum",
        title: "You choose the framework",
        text: "CAPS, IB, Cambridge, or IEB. Anuscha can read, interpret and apply it, rather than simply following a script. Jaco translates the lesson plan made with Anuscha into their educational app by creating custom teaching and learning tools.",
        visual: {
          kind: "frameworks",
          plate: { file: "assets/photos/classroom.jpg", alt: "An empty classroom" },
          cards: [
            { code: "CAPS", name: "South Africa", note: "National curriculum" },
            { code: "IB", name: "International", note: "Diploma programme" },
            { code: "Cambridge", name: "International", note: "Exam pathway" },
            { code: "IEB", name: "South Africa", note: "Independent exams" }
          ],
          chips: ["Science", "History", "Maths", "Languages", "Art"]
        }
      },
      {
        time: "Two disciplines",
        title: "The plan, then the experience",
        text: "She shapes the lesson around educational psychology and how this child learns. He turns it into something the child can see, build, visit, or take apart, including while travelling.",
        visual: {
          kind: "pair",
          left: {
            kicker: "Governess",
            title: "The plan",
            note: "Psychology, pacing, the child",
            file: "assets/photos/anuscha-working.jpeg",
            alt: "Anuscha writing a lesson beside her planning screen",
            fit: "cover"
          },
          right: {
            kicker: "EdTech",
            title: "The experience",
            note: "The lesson, on the app",
            file: "assets/photos/educational-app.jpg",
            alt: "A lesson open in the educational app",
            fit: "contain"
          },
          proofs: [
            { file: "assets/photos/lesson-models.jpg", alt: "Hands-on models at the lesson table", label: "Hands-on" },
            { file: "assets/photos/jaco-archery.jpg", alt: "Jaco at archery practice", label: "Practice" },
            { file: "assets/photos/anuscha-hike.jpg", alt: "Learning on the trail", label: "The field" }
          ]
        }
      }
    ],
    columns: {
      jaco: [
        {
          title: "Instructional Designer",
          text: "Homeschool teaching with a focus on the hands-on side of learning: physical education, building projects, field investigations, museum and destination based history, and hands-on science experiments. He takes each lesson plan and turns it into an interactive experience, capturing attention, building curiosity, and making the practice work (worksheets, essays, assignments) mobile and engaging, especially while travelling."
        }
      ],
      anuscha: [
        {
          title: "Governess",
          text: "A bachelor’s degree in education, five years of teaching experience across culturally and neurologically diverse classrooms, including learners with ADHD, dyslexia, and autism. Every lesson is shaped around educational psychology, learning styles, and inclusive teaching approaches, so the plan fits your child specifically, not a general classroom."
        }
      ]
    },
    result: "The result is a lesson plan built on educational psychology and inclusive teaching, delivered through interactive, hands-on experiences designed to travel. When technology needs updating or troubleshooting, that support is built in. And if your child is unwell or unable to attend a lesson, recorded video lessons mean learning continues without interruption."
  },

  together: {
    heading: "A partnership built long before the classroom",
    kicker: "Together",
    paragraphs: [
      "Anuscha and Jaco have been together since 2018. The same curiosity that shaped their relationship shapes how they teach. Having grown up in South Africa, both were raised surrounded by a wide range of cultures and traditions from childhood, an exposure that shaped how naturally they work across culturally diverse families and learners today.",
      "A shared love of travel, adventure, and meeting new people runs through everything they do, both personally and professionally. That same curiosity extends into a genuine passion for learning itself, which is what drives their belief that education should be fun, hands-on, and far less restrictive than a textbook or a worksheet.",
      "Outside of lessons, they stay active together: camping, swimming, ice skating, hiking, and seeking out anything educational or entertaining along the way. Jaco spent several years training in MMA, bringing a discipline and physical energy that carries directly into sports coaching and hands-on activities with the children. Anuscha sings, plays guitar, and works in art alongside the children, using creativity as a form of therapy and self-discovery, especially for children who express themselves more freely through music or art than words.",
      "As technology plays a growing role in how they teach, online child safety is treated as a top priority. Both stay closely informed on the risks of social media and in-game chat features that many children now navigate daily. Technology is a tool they use to teach; keeping it safe is a responsibility they take just as seriously."
    ],
    reel: [
      { file: "assets/photos/together-cave.jpg", alt: "Anuscha and Jaco", focus: "center 30%" },
      { file: "assets/photos/together-evening.jpg", alt: "Anuscha and Jaco", focus: "center 28%" },
      { file: "assets/photos/jaco-portrait.jpg", alt: "Jaco", focus: "center 22%" },
      { file: "assets/photos/anuscha-portrait.jpg", alt: "Anuscha", focus: "center 20%" },
      { file: "assets/photos/at-the-table.jpg", alt: "Anuscha at the table", focus: "center 35%" },
      { file: "assets/photos/project-day.jpg", alt: "Jaco", focus: "center 18%" },
      { file: "assets/photos/karting-stand.jpg", alt: "Anuscha", focus: "center 22%" },
      { file: "assets/photos/lesson-models.jpg", alt: "Anuscha at a lesson", focus: "center 28%" },
      { file: "assets/photos/lesson-table.jpg", alt: "Anuscha at the lesson table", focus: "center 24%" },
      { file: "assets/photos/jaco-working.jpeg", alt: "Jaco at his desk", focus: "center 30%" },
      { file: "assets/photos/anuscha-working.jpeg", alt: "Anuscha writing a lesson", focus: "center 35%" },
      { file: "assets/photos/jaco-beach.jpg", alt: "Jaco at the coast", focus: "center 12%" },
      { file: "assets/photos/jaco-graduation.jpg", alt: "Jaco graduation", focus: "center 20%" },
      { file: "assets/photos/anuscha-graduation.jpeg", alt: "Anuscha graduation", focus: "center 22%" },
      { file: "assets/photos/jaco-archery.jpg", alt: "Jaco", focus: "center 25%" },
      { file: "assets/photos/anuscha-outing.jpg", alt: "Anuscha", focus: "center 12%" },
      { file: "assets/photos/garage-project.jpg", alt: "A hands-on project", focus: "center 18%" }
    ]
  },

  studio: {
    eyebrow: "Introduction to the educational app",
    heading: "A studio built for one child, then proved in the lesson",
    intro: "The educational app is the classroom tool Jaco builds from the lesson plan he and Anuscha write together. She sets the outcomes. He turns them into custom teaching and learning tools, including diagrams a learner can turn in 3D. The screen below is a preview of how a learner studies. Under it, a short demo of a 3D question.",
    steps: [],
    notes: [
      { title: "Bilingual by design", text: "All school activities' language can be changed to practice vocabulary and grammar in the chosen language." },
      { title: "3D as a first-class question type", text: "Label a skeleton, sequence a life cycle, sort a food chain. Not a static diagram with a blank line underneath." },
      { title: "Works when the Wi-Fi doesn’t", text: "Travel years and rural days were a design constraint, not an afterthought. Draft on a connection; teach without one." },
      { title: "Privacy", text: "Student identity is not sent to an outside provider. Only the lesson content is. The teacher remains the publisher." }
    ],
    classroom: {
      file: "assets/photos/lesson-tech.jpg",
      alt: "A laptop open on a desk, with software code on the screen",
      caption: "The lesson, built as software."
    },
    demo: {
      prompt: "Drag to turn the plant. Tap the part that does the job.",
      hint: "A shortened public demo of a 3D diagram-label question.",
      complete: "That’s the idea: the child turns the specimen, then names the part that does the job.",
      question: "A flowering plant",
      water: "Water enters at the roots, climbs the stem, and reaches the leaf.",
      tasks: [
        { id: "roots", ask: "Tap the part that takes up water from the soil." },
        { id: "stem", ask: "Tap the part that carries that water upward." },
        { id: "leaf", ask: "Tap the part that makes food from sunlight." },
        { id: "flower", ask: "Tap the part where seeds begin." }
      ],
      parts: [
        { id: "roots", label: "Roots", fact: "Anchor the plant and take up water and minerals from the soil." },
        { id: "stem", label: "Stem", fact: "Holds the plant up and carries water from the roots to the leaves." },
        { id: "leaf", label: "Leaf", fact: "Where photosynthesis happens, sunlight becomes food." },
        { id: "flower", label: "Flower", fact: "The reproductive part of the plant; where seeds begin." }
      ]
    }
  },

  learn: {
    kicker: "How learning looks on the app",
    lead: "A preview only. This is the screen a learner uses for lessons, practice, and progress. No learner name is shown.",
    grade: "Grade 5",
    side: ["This Week", "Lessons", "Assessments", "Guidance Sessions", "Calendar", "Progress and Reports", "Resources", "Library"],
    subjects: [
      {
        id: "efal",
        name: "English First Additional Language",
        lessons: [
          { id: "e5", n: 5, title: "Animate it", range: "2 Feb 2026 to 6 Feb 2026", continued: true, items: [
            { id: "e5a", kind: "learn", title: "Learn: verbs that show movement", text: "A verb can show how something moves. Circle the movement verb in each sentence your teacher reads aloud." }
          ]},
          { id: "e6", n: 6, title: "Story words", range: "16 Feb 2026 to 20 Feb 2026", items: [
            { id: "e6a", kind: "guide", title: "Study guide: new vocabulary", done: true, text: "Read the word list once, then cover it and say each word in a sentence." }
          ]},
          { id: "e7", n: 7, title: "Countable and uncountable nouns", range: "23 Feb 2026 to 27 Feb 2026", items: [
            { id: "e7a", kind: "guide", title: "Study guide 1/2 reference: Writing", done: true, text: "Use a or an with countable nouns. Do not use a number with uncountable nouns unless you add a measure: a bottle of water." },
            { id: "e7b", kind: "guide", title: "Study guide 1/2 reference: Language", done: true, text: "Countable nouns have a plural. Uncountable nouns stay singular: rice, water, music, syrup." },
            { id: "e7c", kind: "learn", title: "Learn: nouns you can count", text: "If you can say two of them, the noun is countable. Two chairs. Two apples. You cannot say two syrups." },
            { id: "e7d", kind: "practise", title: "Practise: Countable and uncountable nouns", quiz: {
              title: "Practise: Remedial activity, countable and uncountable nouns",
              instruction: "Complete the following exercise to test your knowledge.",
              prompt: "Identify whether the words below are countable or uncountable nouns.",
              questions: [
                { word: "Syrup", answer: 0, options: ["Uncountable", "Countable"], why: "Syrup is a mass. You measure it, you do not count it." },
                { word: "Pencil", answer: 1, options: ["Uncountable", "Countable"], why: "You can hold one pencil, then another. It has a plural: pencils." },
                { word: "Rice", answer: 0, options: ["Uncountable", "Countable"], why: "Rice is uncountable. You say a bowl of rice, not two rices." },
                { word: "River", answer: 1, options: ["Uncountable", "Countable"], why: "A river can be counted. There are many rivers." },
                { word: "Music", answer: 0, options: ["Uncountable", "Countable"], why: "Music is uncountable. You talk about a piece of music." }
              ]
            }}
          ]},
          { id: "e8", n: 8, title: "Places and descriptions", range: "2 Mar 2026 to 6 Mar 2026", items: [
            { id: "e8a", kind: "learn", title: "Learn: adjectives of place", text: "An adjective describes a noun. A quiet harbour. A steep hill. Write three adjectives for a place you know." }
          ]}
        ]
      },
      {
        id: "ns",
        name: "Natural Sciences",
        lessons: [
          { id: "n3", n: 3, title: "A flowering plant", range: "9 Feb 2026 to 13 Feb 2026", items: [
            { id: "n3a", kind: "practise", title: "Practise: parts of a plant", quiz: {
              title: "Practise: label the job, not just the name",
              instruction: "Choose the part that does each job.",
              prompt: "Which part does this job?",
              questions: [
                { word: "Makes food from sunlight", answer: 1, options: ["Root", "Leaf"], why: "The leaf is where photosynthesis happens." },
                { word: "Takes up water from the soil", answer: 0, options: ["Root", "Flower"], why: "Roots anchor the plant and take up water." },
                { word: "Carries water up the plant", answer: 0, options: ["Stem", "Seed"], why: "The stem holds the plant up and moves water to the leaves." }
              ]
            }}
          ]}
        ]
      },
      {
        id: "math",
        name: "Mathematics",
        lessons: [
          { id: "m4", n: 4, title: "Multiplication facts", range: "16 Feb 2026 to 20 Feb 2026", items: [
            { id: "m4a", kind: "practise", title: "Practise: 7 times table", quiz: {
              title: "Practise: quick facts",
              instruction: "Answer without a calculator.",
              prompt: "Choose the product.",
              questions: [
                { word: "7 × 8", answer: 1, options: ["54", "56"], why: "7 × 8 = 56." },
                { word: "7 × 6", answer: 0, options: ["42", "48"], why: "7 × 6 = 42." },
                { word: "7 × 9", answer: 1, options: ["56", "63"], why: "7 × 9 = 63." }
              ]
            }}
          ]}
        ]
      }
    ]
  },

  chamber: {
    kicker: "A 3D lesson, opened",
    heading: "Take the specimen apart.",
    body: "Jaco builds diagrams the learner can turn, pull apart, and put back together. Choose a model, click a labelled part, then explode it, the same habit as a 3D exam question.",
    hint: "Drag to turn · click a part · explode the model",
    explode: "Explode",
    assemble: "Assemble",
    models: [
      {
        id: "atom",
        label: "Atom",
        subject: "Physical sciences",
        intro: "A Bohr-style teaching model: dense nucleus, electrons on shells. Not quantum-true, true enough to reason with.",
        parts: [
          { id: "nucleus", label: "Nucleus", fact: "Protons and neutrons packed at the centre. Almost all the mass lives here." },
          { id: "inner", label: "Inner shell", fact: "The first electron shell holds up to two electrons, closest to the nucleus." },
          { id: "outer", label: "Outer shells", fact: "Further shells hold more electrons. Chemistry is mostly about the outermost ones." }
        ]
      },
      {
        id: "dna",
        label: "DNA",
        subject: "Life sciences",
        intro: "A double helix the learner can twist in their hands, backbone and base pairs as two jobs.",
        parts: [
          { id: "backbone", label: "Backbone", fact: "Two sugar-phosphate strands twist around each other and hold the code in place." },
          { id: "bases", label: "Base pairs", fact: "A pairs with T, C with G. The sequence of pairs is the information." }
        ]
      },
      {
        id: "earth",
        label: "Earth layers",
        subject: "Geography",
        intro: "A quarter of the planet is cut away so you can see inside. Click a layer, then pull the shells apart.",
        parts: [
          { id: "crust", label: "Crust", fact: "The thin rocky skin we live on, about 5 to 70 km thick. Continents are thicker. Ocean floor is thinner." },
          { id: "mantle", label: "Mantle", fact: "Hot rock from the base of the crust to about 2,900 km down. It flows very slowly and moves the tectonic plates." },
          { id: "outer", label: "Outer core", fact: "Liquid iron and nickel, about 2,900 to 5,100 km down. Its motion helps make Earth’s magnetic field." },
          { id: "inner", label: "Inner core", fact: "Solid iron from about 5,100 km to the centre. The pressure keeps it solid even though it is about as hot as the surface of the Sun." }
        ]
      },
      {
        id: "water",
        label: "Water",
        subject: "Chemistry",
        intro: "H₂O as a bent molecule. Two hydrogens, one oxygen, a 104.5° bond angle, why ice floats starts here.",
        parts: [
          { id: "oxygen", label: "Oxygen", fact: "The larger, slightly negative end of the molecule. It pulls electrons toward itself." },
          { id: "hydrogen", label: "Hydrogen", fact: "Two smaller, slightly positive ends. Water is polar because of this imbalance." },
          { id: "bond", label: "Covalent bonds", fact: "Each hydrogen shares a pair of electrons with oxygen. The molecule is bent, not straight." }
        ]
      }
    ]
  },

  edu: {
    chips: [
      { label: "IB", tone: "ox", x: "8%", y: "18%" },
      { label: "CAPS", tone: "moss", x: "78%", y: "22%" },
      { label: "H₂O", tone: "moss", x: "12%", y: "72%" },
      { label: "π", tone: "brass", x: "86%", y: "68%" },
      { label: "3D", tone: "moss", x: "70%", y: "12%" },
      { label: "TEFL", tone: "ox", x: "18%", y: "42%" },
      { label: "149.6×10⁶ km", tone: "brass", x: "58%", y: "80%" },
      { label: "F = ma", tone: "moss", x: "82%", y: "44%" }
    ]
  },

  experience: [
    {
      personTag: "joint",
      who: "Jaco and Anuscha",
      role: "Governess & Instructional Designer",
      org: "Private family household",
      dates: "2023 to Present",
      bullets: [
        "Anuscha delivers a complete homeschooling curriculum for a Grade 5 learner alongside Jaco, managing every subject, milestone and progress report, including additional learning needs, in close coordination with specialists.",
        "Jaco co-educates from the same house: Natural Sciences, Technology and History; interactive 3D models; the custom exam app; trip research; destination filming; sport; and the practical running of the day.",
        "Museum, theatre and cultural excursions that continue the classroom’s work; filmed lessons so illness never becomes a gap."
      ]
    },
    {
      personTag: "jaco",
      who: "Jaco",
      role: "Instructional Designer & Senior Multimedia Designer",
      org: "The Boiler Room (Pty) Ltd",
      dates: "2023 to Present",
      bullets: [
        "Interactive courses, real-time 3D environments and production pipelines used in commercial training and education.",
        "Interactive learning modules in Articulate Storyline and Rise 360; animation and visual explanation for geography, history, science and architecture.",
        "Hardware and software kept running reliably wherever the family is, without needing outside support."
      ]
    },
    {
      personTag: "anuscha",
      who: "Anuscha",
      role: "Homeschool & Classroom Educator, ages 5 to 14",
      org: "Die Baken Academy & Aftercare · Shine Academy · homeschool settings",
      dates: "2019 to March 2023",
      bullets: [
        "Three years teaching in a homeschooling academy while completing her bachelor’s degree, including children who needed a more personalised approach, among them learners with ADHD, dyslexia and autism.",
        "Built a working library of book-report, essay and mathematics models still in use today."
      ]
    },
    {
      personTag: "jaco",
      who: "Jaco",
      role: "Graphic Designer, eLearning",
      org: "DevCom Strategic Communication",
      dates: "2021 to 2022",
      bullets: [
        "Motion graphics and interactive eLearning to instructional-design standard, delivered to deadline for multiple clients."
      ]
    },
    {
      personTag: "jaco",
      who: "Jaco",
      role: "Graphic Designer, Marketing & IT",
      org: "Echo 4×4 Centre",
      dates: "2019 to 2020",
      bullets: [
        "Design and hands-on IT support in an outdoor and adventure retail environment."
      ]
    },
    {
      personTag: "jaco",
      who: "Jaco",
      role: "Freelance Multimedia Designer",
      org: "Independent practice (incl. video internship, Astral Entertainment, 2019)",
      dates: "2016 to Present",
      bullets: [
        "20+ end-to-end projects in branding, animation and video, including VR education environments."
      ]
    }
  ],

  testimonials: {
    intro: "As much as we would love to share our memories and accomplishments with our host families, we take the privacy of all families very seriously. Upon request, we will provide you with the appropriate contact details of our references and they would be happy to share their experience with us personally.",
    cards: []
  },

  faq: [
    {
      q: "Do you both teach, or is one of you a helper?",
      a: "Both teach. Anuscha is the governess: curriculum, assessment, pastoral care. Jaco is the instructional designer: materials, 3D tools, destination lessons, sport and the practical running of the day. We do not do the same job."
    },
    {
      q: "Can you teach two children of different ages?",
      a: "Yes. Anuscha’s Foundation Phase degree and her Grade 5 practice already span that range; she has taught 5 to 14, including culturally and neurologically diverse classrooms. A younger child and an older sibling is a natural split: pedagogy and routine on one side, projects, sport and exam preparation on the other."
    },
    {
      q: "How do you teach AI literacy?",
      a: "Children learn to build apps using AI so they stay up to date with a competitive industry, and they learn to use AI responsibly. AI is not used to do the work for anyone. Online child safety, including social media and in-game chat, is treated as a top priority."
    },
    {
      q: "Live-in or live-out? Will you relocate?",
      a: "Either arrangement, as the household needs. No fixed address: we are available from January 2027 for a long-term post, including a travel year and relocation."
    },
    {
      q: "Additional learning needs?",
      a: "Jaco and Anuscha work with a learner with additional needs, with specialist mentor contact, and Anuscha has direct experience teaching children with ADHD, dyslexia and autism. Lessons are shaped around educational psychology and how this particular child learns, not a general classroom."
    }
  ],

  galleryIntro: "Filter the library, hover a frame to preview, click to open. Photographs only, adults, work, and the lives around the lessons.",
  galleryFilters: [
    { id: "all", label: "All" },
    { id: "anuscha", label: "Anuscha" },
    { id: "jaco", label: "Jaco" },
    { id: "joint", label: "Together" }
  ],
  gallery: [
    { type: "photo", file: "lesson-models.jpg", caption: "Hands-on models at the lesson table", person: "anuscha" },
    { type: "photo", file: "lesson-table.jpg", caption: "Planning the next part of the lesson", person: "anuscha" },
    { type: "photo", file: "jaco-working.jpeg", caption: "Building the educational app", person: "jaco" },
    { type: "photo", file: "anuscha-working.jpeg", caption: "The lesson, written by hand", person: "anuscha" },
    { type: "photo", file: "together-cave.jpg", caption: "Anuscha and Jaco", person: "joint" },
    { type: "photo", file: "together-evening.jpg", caption: "Out together", person: "joint" },
    { type: "photo", file: "anuscha-river.jpg", caption: "By the river", person: "anuscha" },
    { type: "photo", file: "anuscha-hike.jpg", caption: "On the trail", person: "anuscha" },
    { type: "photo", file: "jaco-beach.jpg", caption: "At the coast", person: "jaco" },
    { type: "photo", file: "anuscha-outing.jpg", caption: "A day out", person: "anuscha" },
    { type: "photo", file: "karting-stand.jpg", caption: "Watching the track", person: "anuscha" },
    { type: "photo", file: "project-day.jpg", caption: "A project on the table", person: "jaco" },
    { type: "photo", file: "garage-project.jpg", caption: "A hands-on project", person: "anuscha" },
    { type: "photo", file: "at-the-table.jpg", caption: "Around the table", person: "anuscha" },
    { type: "photo", file: "at-the-grill.jpg", caption: "At the grill", person: "joint" },
    { type: "photo", file: "barbecue.jpg", caption: "Cooking outdoors", person: "joint" },
    { type: "photo", file: "at-the-screen.jpg", caption: "At the computer", person: "joint" },
    { type: "photo", file: "playground.jpg", caption: "Outside play", person: "joint" },
    { type: "photo", file: "with-a-calf.jpg", caption: "On the farm", person: "joint" },
    { type: "photo", file: "at-the-fence.jpg", caption: "Meeting the calf", person: "joint" },
    { type: "photo", file: "rafting-group.jpg", caption: "On the river", person: "joint" },
    { type: "photo", file: "anuscha-graduation.jpeg", caption: "Anuscha, B.Ed Foundation Phase", person: "anuscha" },
    { type: "photo", file: "jaco-graduation.jpg", caption: "Jaco, 3D Animation and Visual Effects", person: "jaco" },
    { type: "photo", file: "jaco-archery.jpg", caption: "Sport and discipline, in the field", person: "jaco" },
    { type: "photo", file: "jaco-boat-dog.jpg", caption: "On the boat, with the dog", person: "jaco" },
    { type: "photo", file: "jaco-boat-crew.jpg", caption: "In the water beside the boat", person: "jaco" },
    { type: "photo", file: "jaco-mud.jpg", caption: "Through the mud", person: "jaco" },
    { type: "photo", file: "jaco-obstacle.jpg", caption: "On the obstacle course", person: "jaco" },
    { type: "photo", file: "jaco-water-net.jpg", caption: "Across the water", person: "jaco" },
    { type: "photo", file: "jaco-snorkel.jpg", caption: "In the sea", person: "jaco" }
  ],

  travel: {
    intro: "No fixed address: two passports, two disciplines, and one long-term commitment to living where the job is, a travel year, a city apartment, or a house that becomes the school.",
    stamps: [
      { label: "Available January 2027", person: "joint" },
      { label: "Live-in or live-out", person: "joint" },
      { label: "Long-term placements", person: "joint" },
      { label: "Europe & Asia travel years", person: "joint" },
      { label: "Open to relocation, incl. Korea & Japan", person: "joint" },
      { label: "Worldschooling families welcome", person: "joint" },
      { label: "Driving permit, Category C1, UK & Europe", person: "jaco" },
      { label: "Driving permit, Category B, UK & Europe", person: "anuscha" },
      { label: "Police clearance held", person: "jaco" },
      { label: "Police clearance held", person: "anuscha" },
      { label: "TEFL certified", person: "jaco" },
      { label: "TEFL certified", person: "anuscha" },
      { label: "Paediatric First Aid", person: "anuscha" },
      { label: "IB curriculum training", person: "anuscha" },
      { label: "5 languages between us", person: "joint" }
    ]
  },

  references: {
    text: "As much as we would love to share our memories and accomplishments with our host families, we take the privacy of all families very seriously. Upon request, we will provide you with the appropriate contact details of our references and they would be happy to share their experience with us personally."
  },

  closing: {
    line: "Not a school. Not a platform. One partnership that travels.",
    sub: "We’re looking for a family who wants a governess and an instructional designer, at home, on a travel year, or in the city you move to next.",
    cta: "Get in touch",
    cvLabel: "Download CV"
  }
};
