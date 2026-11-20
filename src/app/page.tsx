"use client";

import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Download,
  Github,
  Linkedin,
  Mail,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";

const skills = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "React.js",
  "Next.js",
  "TypeScript",
  "Responsive UI",
  "Tailwind CSS",
  "Git",
  "GitHub",
  "OpenAI APIs",
  "Prompt Engineering",
  "AI Agents",
  "Generative AI",
  "n8n — Learning",
];

const projects = [
  {
    number: "01",
    title: "DevFest Noida 2026",
    description:
      "A responsive event experience created for the GDG Noida volunteer task, focused on clean visual hierarchy, modern UI, and a smooth experience across devices.",
    tags: ["Next.js", "TypeScript", "Responsive UI"],
    href: "https://github.com/rajaryan171812-dot/Devfest-noida",
    label: "GitHub",
  },
  {
    number: "02",
    title: "Internship Tracker SaaS",
    description:
      "A responsive interface for organizing internship applications, tracking status and deadlines, and viewing useful application insights in one place.",
    tags: ["React.js", "JavaScript", "Responsive UI"],
    href: "https://rajaryan171812-dot.github.io/internship-tracker-saas/",
    label: "Live demo",
  },
  {
    number: "03",
    title: "AI Agent Platform",
    description:
      "An ongoing AI-focused project exploring agents for coding assistance, automation, and intelligent task execution using LLM APIs and prompt engineering.",
    tags: ["AI Agents", "LLM APIs", "Prompt Engineering"],
    href: "https://github.com/rajaryan171812-dot",
    label: "GitHub",
  },
  {
    number: "04",
    title: "Frontend Experiments",
    description:
      "A collection of frontend builds and experiments focused on responsive layouts, reusable components, interaction design, and learning modern web development patterns.",
    tags: ["HTML", "CSS", "JavaScript", "React"],
    href: "https://github.com/rajaryan171812-dot?tab=repositories",
    label: "GitHub",
  },
];

const certifications = [
  "Infosys Springboard — Introduction to Cloud Computing",
  "Infosys Springboard — Internet of Things",
  "Google Colab — YBI Foundation",
  "Red Hat Certification Badge",
];

export default function Home() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <main id="top">
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" onClick={close} aria-label="Raj Aryan home">
          RA<span>.</span>
        </a>
        <div className={`nav-links ${open ? "show" : ""}`}>
          <a href="#about" onClick={close}>About</a>
          <a href="#skills" onClick={close}>Skills</a>
          <a href="#projects" onClick={close}>Projects</a>
          <a href="#education" onClick={close}>Education</a>
          <a href="#contact" onClick={close}>Contact</a>
        </div>
        <a className="nav-cta" href="mailto:rajaryan171812@gmail.com">
          Let&apos;s talk <ArrowUpRight size={16} />
        </a>
        <button className="menu" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero section">
        <div className="hero-copy">
          <div className="status"><span className="status-dot" /> Open to frontend &amp; AI internships</div>
          <p className="eyebrow">FRONTEND DEVELOPER · CSE STUDENT</p>
          <h1>I build <em>useful</em><br />digital products.</h1>
          <p className="lead">
            I&apos;m Raj Aryan, a Computer Science Engineering student at IILM University who enjoys building responsive web experiences and exploring AI-powered tools and products.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#projects">View my work <ArrowUpRight size={17} /></a>
            <a className="button secondary" href="/resume.pdf" target="_blank" rel="noreferrer"><Download size={17} /> Resume</a>
          </div>
          <div className="hero-links">
            <a href="https://github.com/rajaryan171812-dot" target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a>
            <a href="https://www.linkedin.com/in/raj-aryan-01b3a53b2/" target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a>
            <a href="mailto:rajaryan171812@gmail.com"><Mail size={17} /> Email</a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card">
            <div className="card-top"><span>RA / 2026</span><span>01</span></div>
            <div>
              <div className="card-mark">&lt;/&gt;</div>
              <p className="card-title">Code.<br />Build.<br /><span>Learn.</span></p>
            </div>
            <div className="card-bottom"><span>GREATER NOIDA · INDIA</span><Sparkles size={16} /></div>
          </div>
          <div className="floating-card"><Code2 size={18} /><span>Frontend<br /><b>+ AI</b></span></div>
        </div>
      </section>

      <div className="scroll-note"><ArrowDown size={15} /> Scroll to explore</div>

      <section id="about" className="section split">
        <div className="section-label">01 / ABOUT</div>
        <div>
          <h2>Curious by default.<br /><span>Always building.</span></h2>
          <p className="body-copy">
            I&apos;m a B.Tech Computer Science Engineering student at IILM University, Greater Noida, expected to graduate in 2028. My focus is frontend development — building clean, responsive, user-friendly interfaces with modern web technologies. Alongside frontend work, I&apos;m exploring AI agents, LLM integration, and workflow automation.
          </p>
          <p className="body-copy">
            I like learning by shipping: turning ideas into polished interfaces, experimenting with modern frontend tools, and using AI to make products smarter and workflows more useful. I&apos;m currently looking for opportunities where I can contribute, learn from experienced developers, and grow as a frontend engineer.
          </p>
          <div className="about-points">
            <div><CheckCircle2 size={18} /> Responsive web development</div>
            <div><CheckCircle2 size={18} /> Modern frontend development</div>
            <div><CheckCircle2 size={18} /> AI tools &amp; experimentation</div>
          </div>
        </div>
      </section>

      <section id="skills" className="section skills-section">
        <div className="section-label">02 / TOOLKIT</div>
        <div className="skills-wrap">
          <div>
            <h2>Tools I use to<br /><span>make things work.</span></h2>
            <p className="body-copy">A focused frontend toolkit, with GitHub for collaboration and AI tools as a growing area of exploration.</p>
          </div>
          <div className="skill-grid">
            {skills.map((skill) => <div className="skill" key={skill}>{skill}</div>)}
          </div>
        </div>
      </section>

      <section id="projects" className="section projects-section">
        <div className="section-label">03 / SELECTED WORK</div>
        <div className="projects-head">
          <h2>Things I&apos;ve<br /><span>built &amp; explored.</span></h2>
          <p>Projects are where I learn fastest — from responsive web interfaces to AI-powered experiments.</p>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <a className="project" href={project.href} target="_blank" rel="noreferrer" key={project.number}>
              <span className="project-number">{project.number}</span>
              <div className="project-main">
                <div className="project-title-row"><h3>{project.title}</h3><ArrowUpRight size={21} /></div>
                <p>{project.description}</p>
                <div className="project-meta"><div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><span className="project-link">{project.label}</span></div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="education" className="section education">
        <div className="section-label">04 / EDUCATION</div>
        <div className="timeline">
          <div className="timeline-item"><span>2024 — 2028</span><div><h3>B.Tech — Computer Science Engineering</h3><p>IILM University · Greater Noida</p></div></div>
        </div>
      </section>

      <section className="section credentials">
        <div className="section-label">05 / CREDENTIALS</div>
        <div className="credential-grid">
          {certifications.map((item, index) => <div className="credential" key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
        </div>
      </section>

      <section id="contact" className="contact section">
        <div className="contact-inner">
          <p className="eyebrow">HAVE A PROJECT OR OPPORTUNITY?</p>
          <h2>Let&apos;s build<br /><em>something useful.</em></h2>
          <p className="contact-copy">I&apos;m open to frontend development and AI-focused internship opportunities.</p>
          <div className="contact-actions">
            <a className="email" href="mailto:rajaryan171812@gmail.com">rajaryan171812@gmail.com <ArrowUpRight size={20} /></a>
            <a className="button light" href="tel:+919508110250">Call me</a>
          </div>
          <div className="socials">
            <a href="https://github.com/rajaryan171812-dot" target="_blank" rel="noreferrer"><Github size={18} /> GitHub</a>
            <a href="https://www.linkedin.com/in/raj-aryan-01b3a53b2/" target="_blank" rel="noreferrer"><Linkedin size={18} /> LinkedIn</a>
          </div>
        </div>
      </section>

      <footer><span>© 2026 Raj Aryan</span><span>Designed &amp; built with Next.js</span></footer>
    </main>
  );
}
