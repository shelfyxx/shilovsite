import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";
import { person, about, aboutBlocks, projects, contacts } from "./content";
import portrait from "./assets/artyom.jpg";
import claudeLogo from "./assets/logo-claude.png";
import vscodeLogo from "./assets/logo-vscode.png";

const sections = ["About", "Projects", "Contact"];

// The two logos are separate transparent layers cut out of the photo (the photo itself has no logos).
// x, y, w are percentages of the photo, measured on the 1086x1448 image. delay shifts the animation phase.
const logos = [
  { src: claudeLogo, x: 11.97, y: 61.12, w: 17.86, delay: 0 },
  { src: vscodeLogo, x: 73.76, y: 61.46, w: 18.51, delay: -2.1 },
];

// Writes the scroll progress (0 at the top, 1 after about one screen) into the CSS variable --p.
// CSS then turns --p into movement, scale and fade, so React does not re-render on every scroll event.
function useScrollProgress(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      ref.current?.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update); // at most one update per frame
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}

function Nav() {
  const [open, setOpen] = useState(false); // mobile menu state
  return (
    <nav className="nav">
      <a href="#top" className="logo">{person.name}</a>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span />
        <span />
      </button>
      <ul className={open ? "open" : ""} onClick={() => setOpen(false)}>
        {sections.map((s) => (
          <li key={s}><a href={`#${s.toLowerCase()}`}>{s}</a></li>
        ))}
      </ul>
    </nav>
  );
}

function Hero() {
  const figure = useRef<HTMLDivElement>(null);
  useScrollProgress(figure);

  // The pointer's horizontal position over the name sets the font weight (400-700).
  const setWeight = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    e.currentTarget.style.setProperty("--w", String(Math.round(400 + t * 300)));
  };
  const reset = (e: PointerEvent<HTMLElement>) => e.currentTarget.style.removeProperty("--w");

  return (
    <header className="hero" id="top">
      <div className="hero-text">
        <h1 aria-label={person.name} onPointerMove={setWeight} onPointerLeave={reset}>
          <span className="line"><span>{person.first}</span></span>
          <span className="line"><span>{person.last}</span></span>
        </h1>
        <p className="roles">Software / AI engineer, blogger.</p>
        <div className="cta">
          <a className="btn" href="#projects">See projects</a>
          <a className="link" href="#contact">Get in touch</a>
        </div>
      </div>
      <div className="figure" ref={figure}>
        <img
          src={portrait}
          width={1086}
          height={1448}
          alt="Portrait of Artyom Shilov holding two glowing spheres with the Claude and Visual Studio Code logos"
        />
        {logos.map((l) => (
          <img
            key={l.src}
            className="float"
            src={l.src}
            alt=""
            aria-hidden="true"
            style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, animationDelay: `${l.delay}s` }}
          />
        ))}
      </div>
    </header>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id={title.toLowerCase()} className="sec">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export default function App() {
  const links = contacts.filter((c) => c.href); // show only filled-in contacts
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Section title="About">
          <p className="big">{about}</p>
          <div className="blocks">
            {aboutBlocks.map((b) => (
              <div key={b.title}>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Projects">
          <ul className="projects">
            {projects.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <span className="tags">{p.tags}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Contact">
          <p className="big">Write to me about engineering or content.</p>
          {links.length ? (
            <ul className="links">
              {links.map((c) => (
                <li key={c.label}>
                  <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">Add your links to “contacts” in src/content.ts.</p>
          )}
        </Section>
      </main>
      <footer className="foot">© {new Date().getFullYear()} {person.name}</footer>
    </>
  );
}
