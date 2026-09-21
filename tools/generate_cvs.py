"""Generate one-page joint-ready CVs for the portfolio contact cards."""
from pathlib import Path
from fpdf import FPDF

OUT = Path(__file__).resolve().parents[1] / "project" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

MOSS = (63, 92, 68)
OX = (122, 46, 39)
INK = (34, 29, 23)
SOFT = (91, 85, 70)
BRASS = (122, 90, 38)


class CV(FPDF):
    def __init__(self, accent):
        super().__init__(format="A4")
        self.accent = accent
        self.set_auto_page_break(auto=True, margin=14)

    def header(self):
        pass

    def rule(self):
        self.set_draw_color(*self.accent)
        self.set_line_width(0.6)
        y = self.get_y()
        self.line(16, y, 194, y)
        self.ln(4)

    def h1(self, name, role):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*INK)
        self.cell(0, 8, name, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 10)
        self.set_text_color(*self.accent)
        self.multi_cell(0, 5, role)
        self.ln(1)
        self.rule()

    def meta(self, lines):
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*SOFT)
        for line in lines:
            self.cell(0, 4.4, line, new_x="LMARGIN", new_y="NEXT")
        self.ln(3)

    def section(self, title):
        self.ln(1.5)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*self.accent)
        self.cell(0, 6, title.upper(), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*BRASS)
        self.set_line_width(0.2)
        y = self.get_y()
        self.line(16, y, 194, y)
        self.ln(3)

    def para(self, text):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*INK)
        self.multi_cell(0, 4.6, text)
        self.ln(1)

    def bullets(self, items):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*INK)
        for item in items:
            x = self.get_x()
            y = self.get_y()
            self.set_text_color(*self.accent)
            self.cell(4, 4.6, "-")
            self.set_text_color(*INK)
            self.set_xy(x + 5, y)
            self.multi_cell(173, 4.6, item)
        self.ln(1)

    def job(self, role, org, dates, bullets):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*INK)
        self.cell(128, 5, role)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*SOFT)
        self.cell(50, 5, dates, align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "I", 9)
        self.cell(0, 4.5, org, new_x="LMARGIN", new_y="NEXT")
        self.ln(0.6)
        self.bullets(bullets)


def write_jaco():
    pdf = CV(MOSS)
    pdf.add_page()
    pdf.set_left_margin(16)
    pdf.set_right_margin(16)
    pdf.h1("Jaco van Dyk", "Instructional designer  |  Homeschool co-educator  |  Sports educator")
    pdf.meta([
        "Applying jointly with Anuscha van Niekerk as a Homeschooling Teaching Couple",
        "jacovandyk2205@gmail.com  |  +27 79 052 7026  |  Gauteng, South Africa",
        "Available January 2027  |  Live-in or live-out  |  Open to relocation (incl. Korea & Japan)",
        "TEFL certified  |  Police clearance held  |  Driving permit Category C1 (UK & Europe)",
    ])
    pdf.section("Profile")
    pdf.para(
        "Instructional designer and homeschool co-educator specialising in experiential, "
        "project-based multimedia learning. Since May 2023 I have co-educated in the same "
        "private household as Anuscha van Niekerk: I turn her lesson scripts into pictures, "
        "video, worksheets, quizzes and 3D materials; I research trips; I film destination "
        "lessons; I teach sport; I keep devices child-safe. I built ExamStudio so papers can "
        "be drafted with AI and published only after a teacher reviews them, including 3D "
        "diagram questions a learner can actually turn in their hands."
    )
    pdf.section("Experience")
    pdf.job(
        "Homeschool co-educator & learning support",
        "Alongside Anuscha van Niekerk, private family household",
        "May 2023 - Present",
        [
            "Learning support and exam preparation. Build pictures, video, worksheets, quizzes and 3D or VR from Anuscha's scripts.",
            "Research trips before outings; attend and film destination lessons so a sick day still has the lesson.",
            "Sports educator (nine years MMA and self-defence). Shopping, cooking, driving (C1).",
            "Devices updated, backed up and child-safe. Built ExamStudio (bilingual exams, 3D questions, teacher-reviewed AI drafts).",
        ],
    )
    pdf.job(
        "Instructional Designer & Senior Multimedia Designer",
        "The Boiler Room (Pty) Ltd",
        "2023 - Present",
        [
            "Interactive learning modules in Articulate Storyline and Rise 360; animation for geography, history, science and architecture.",
            "AI-assisted production that still works when connectivity is poor - useful on a travel year.",
        ],
    )
    pdf.job(
        "Graphic Designer - eLearning",
        "DevCom Strategic Communication; Echo 4x4 Centre; freelance (from 2016)",
        "2016 - 2022",
        [
            "Motion graphics and interactive eLearning; outdoor-retail IT support; 20+ branding, animation and video projects including VR education environments.",
        ],
    )
    pdf.section("Education & credentials")
    pdf.bullets([
        "Diploma, 3D Animation & Visual Effects - Open Window Institute, 2018. Matric, Joy Academy, 2017.",
        "TEFL Certificate. Police clearance held. Instructional design practice since 2018.",
        "Languages: English fluent; Afrikaans fluent; French currently learning.",
    ])
    pdf.output(OUT / "jaco-cv.pdf")


def write_anuscha():
    pdf = CV(OX)
    pdf.add_page()
    pdf.set_left_margin(16)
    pdf.set_right_margin(16)
    pdf.h1("Anuscha van Niekerk", "Qualified private homeschooling educator & governess  |  B.Ed Foundation Phase")
    pdf.meta([
        "Applying jointly with Jaco van Dyk as a Homeschooling Teaching Couple",
        "anuschaza@gmail.com  |  +27 84 690 8856  |  Gauteng, South Africa",
        "Available January 2027  |  Live-in or live-out  |  Open to relocation (incl. Korea & Japan)",
        "TEFL certified  |  Police clearance held  |  Paediatric First Aid  |  Driving permit Category B (UK & Europe)",
    ])
    pdf.section("Profile")
    pdf.para(
        "Qualified private homeschooling educator and governess with a Bachelor of Education "
        "(Foundation Phase). I independently plan, deliver and assess a full CAPS-aligned "
        "homeschool curriculum - weekly and term planning, pacing, progress tracking and "
        "reporting to parents. I currently hold sole academic responsibility for a Grade 5 "
        "learner's entire academic progression (in my care since age nine), including "
        "additional learning needs. I adapt to a visual learner who thrives on repetition, "
        "discussion and experiment. Museums, theatre and culture continue the morning's work "
        "in the afternoon. Highly discreet, organised and calm under pressure."
    )
    pdf.section("Experience")
    pdf.job(
        "Private Homeschooling Educator & Governess",
        "Private family household",
        "April 2023 - Present",
        [
            "Sole academic responsibility for a Grade 5 full CAPS-aligned curriculum (planning, delivery, assessment, pacing), including additional learning needs.",
            "Daily journal of lessons, absences and catch-up so illness never becomes a gap. Parent reporting and a year plan of work and events.",
            "Museum, theatre and cultural excursions that continue classroom work. Household organisation and housekeeping.",
            "Work alongside Jaco: I design the lesson; he builds digital materials, films destination lessons, and holds shopping, cooking and transport.",
        ],
    )
    pdf.job(
        "Homeschool and classroom educator (ages 5-14)",
        "Die Baken Academy & Aftercare; Shine Academy; homeschool settings",
        "2019 - March 2023",
        [
            "Learners from 5 to 14 in homeschool and small-group settings, including children who found mainstream classrooms difficult.",
            "Working library of book-report, essay and mathematics models still in use. Any syllabus a family names, planned from outcomes.",
        ],
    )
    pdf.section("Education & credentials")
    pdf.bullets([
        "Bachelor of Education, Foundation Phase Teaching - STADIO Higher Education, 2021-2025.",
        "TEFL Certificate, The TEFL Academy (2018). Counselling and Child Psychology, Udemy (2019).",
        "Paediatric First Aid, Pretorius Institute of Medical Excellence (2025). Police clearance held.",
        "Specialist mentor contact, including a Dyslexia Correction Intervention Practitioner for reading and spelling.",
        "Languages: English fluent; Afrikaans fluent; isiZulu conversational; French currently learning; Chinese beginner.",
    ])
    pdf.output(OUT / "anuscha-cv.pdf")


if __name__ == "__main__":
    write_jaco()
    write_anuscha()
    print("Wrote", OUT / "jaco-cv.pdf")
    print("Wrote", OUT / "anuscha-cv.pdf")
