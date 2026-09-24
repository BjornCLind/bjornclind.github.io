import Link from "next/link";

import CopyEmail from "@/components/home/CopyEmail";
import HeroHeadline from "@/components/home/HeroHeadline";
import Magnetic from "@/components/home/Magnetic";
import ProjectGlyph from "@/components/home/ProjectGlyph";
import Reveal from "@/components/home/Reveal";
import WorkGlobe from "@/components/home/WorkGlobe";
import {
  capabilities,
  education,
  experiences,
  projects,
  skills,
  spokenLanguages,
} from "@/data";

const NAV = [
  { href: "#skills", label: "Skills" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience", wide: true },
  { href: "#about", label: "About", wide: true },
  { href: "#contact", label: "Contact" },
];

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <h2
      data-reveal
      className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-white-200/70"
    >
      <span aria-hidden="true" className="font-mono text-purple">{n}</span>
      <span className="h-px w-8 bg-white/15" aria-hidden="true" />
      {title}
    </h2>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black-100 text-white">
      {/* Soft accent glow behind the hero; the only decoration on the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(55%_60%_at_18%_0%,rgba(203,172,249,0.13),transparent_70%)]"
      />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black-100/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white">
            Bjorn Lindqvist
          </Link>
          <ul className="flex items-center gap-5 text-sm text-white-200 sm:gap-7">
            {NAV.map((item) => (
              <li key={item.href} className={item.wide ? "hidden sm:block" : undefined}>
                <a href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="relative mx-auto max-w-5xl px-6 sm:px-10">
        {/* ---------------------------------------------------------------- Hero */}
        <Reveal as="section" className="pb-16 pt-24 sm:pb-24 sm:pt-36">
          <p
            data-reveal
            className="text-xs font-medium uppercase tracking-[0.14em] text-white-200/70 sm:tracking-[0.22em]"
          >
            Full stack · UI/UX · Databases · Applied AI
          </p>
          <HeroHeadline
            lead="Full stack engineer building web systems from interface"
            accent="to database."
            className="mt-6 max-w-4xl text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
          />
          <p
            data-reveal
            className="mt-8 max-w-2xl text-lg leading-relaxed text-white-200"
          >
            I&apos;m Bjorn Lindqvist. I design, build and maintain web
            applications end to end, from the interface and data model to
            automating older workflows, and now AI tools that assist people
            rather than replace them.
          </p>
          <div data-reveal className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <a
                href="#work"
                className="inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-black-100 transition-colors hover:bg-purple"
              >
                View selected work
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="inline-block rounded-full border border-white/15 px-6 py-3 text-sm text-white-100 transition-colors hover:border-white/40 hover:text-white"
              >
                Get in touch
              </a>
            </Magnetic>
          </div>
        </Reveal>

        {/* -------------------------------------------------------------- Skills */}
        <Reveal as="section" id="skills" className="py-16 sm:py-24">
          <SectionLabel n="01" title="What I do" />

          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <li key={c.title} data-reveal className="flex flex-col bg-black-100 p-7">
                <span aria-hidden="true" className="font-mono text-sm text-purple">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-medium tracking-tight text-white">
                  {c.title}
                </h3>
                <p className="mt-3 leading-relaxed text-white-200">{c.body}</p>
                <ul className="mt-auto flex flex-wrap gap-2 pt-6" aria-label="Tools">
                  {c.tools.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white-100"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* ---------------------------------------------------------------- Work */}
        <Reveal as="section" id="work" className="py-16 sm:py-24">
          <SectionLabel n="02" title="Selected work" />
          <p data-reveal className="mt-6 max-w-2xl text-white-200">
            Most of what I build is internal and not publicly accessible, so
            each project is written up rather than linked.
          </p>

          <ol className="mt-12 border-t border-white/10">
            {projects.map((project, i) => (
              <li key={project.slug} data-reveal className="border-b border-white/10">
                {/* Named by its title alone, with the summary as its
                    description, so a list of links stays short to listen to. */}
                <Link
                  href={`/projects/${project.slug}`}
                  aria-labelledby={`${project.slug}-title`}
                  aria-describedby={`${project.slug}-des`}
                  className="group relative grid gap-x-8 gap-y-4 py-9 focus-visible:bg-white/[0.03] focus-visible:outline-offset-0 sm:grid-cols-[3.5rem_1fr_auto]"
                >
                  <span aria-hidden="true" className="font-mono text-sm text-white-200/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3
                      id={`${project.slug}-title`}
                      className="text-2xl font-medium tracking-tight text-white transition-colors group-hover:text-purple sm:text-[1.7rem]"
                    >
                      {project.title}
                    </h3>
                    <p
                      id={`${project.slug}-des`}
                      className="mt-3 max-w-2xl leading-relaxed text-white-200"
                    >
                      {project.des}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {project.tech.map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white-100"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="absolute right-0 top-9 flex items-center gap-6 sm:static sm:self-center">
                    <ProjectGlyph kind={project.glyph} />
                    <span
                      aria-hidden="true"
                      className="hidden text-2xl text-white-200/70 transition group-hover:translate-x-1 group-hover:text-purple sm:block"
                    >
                      &rarr;
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* ---------------------------------------------------------- Experience */}
        <Reveal as="section" id="experience" className="py-16 sm:py-24">
          <SectionLabel n="03" title="Experience" />

          <ol className="mt-12 space-y-14">
            {experiences.map((job) => {
              const [company, ...place] = job.company_name.split(", ");
              return (
                <li
                  key={job.title + job.date}
                  data-reveal
                  className="grid gap-x-10 gap-y-3 sm:grid-cols-[13rem_1fr]"
                >
                  <div className="text-sm">
                    <p className="font-mono text-white-200/70">{job.date}</p>
                    <p className="mt-2 text-white-100">{company}</p>
                    <p className="text-white-200/70">{place.join(", ")}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight text-white">
                      {job.title}
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-[0.95rem] leading-relaxed text-white-200">
                      {job.points.map((point) => (
                        <li key={point} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-[0.7em] h-px w-3 shrink-0 bg-purple/60"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* --------------------------------------------------------------- About */}
        <Reveal as="section" id="about" className="py-16 sm:py-24">
          <SectionLabel n="04" title="About" />

          <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_1.1fr]">
            <div data-reveal className="space-y-5 text-lg leading-relaxed text-white-200">
              <p>
                Full stack engineering has run through every role I&apos;ve
                held, from product engineering in React, Next.js and TypeScript
                to building and running a public-sector department&apos;s
                internal systems.
              </p>
              <p>
                I&apos;m comfortable owning a system end to end: working out
                requirements with the people who will use it, designing the
                interface and the data model, shipping it, then keeping it
                healthy and documented.
              </p>
              <p>
                Based in Honolulu, flexible across time zones, and authorized
                to work in the US and the EU.
              </p>
              <div className="pt-4 text-sm">
                <p className="text-white-200/70">Languages</p>
                <p className="mt-2 text-white-100">{spokenLanguages.join(" · ")}</p>
              </div>
            </div>

            <dl data-reveal className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {skills.map((s) => (
                <div key={s.group}>
                  <dt className="text-sm text-white-200/70">{s.group}</dt>
                  <dd className="mt-2 leading-relaxed text-white-100">
                    {s.items.join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* ----------------------------------------------------------- Education */}
        <Reveal as="section" id="education" className="py-16 sm:py-24">
          <SectionLabel n="05" title="Education & certification" />

          <ul className="mt-12 border-t border-white/10">
            {education.map((item) => {
              // The certification entry carries its name and validity in one
              // line; split it so it lines up with the degrees above it.
              const [certName, certValidity] = (item.points[0] ?? "").split(" — ");
              const isCert = !item.date && Boolean(certValidity);
              const name = isCert ? certName : item.title;
              const when = isCert
                ? "Valid to " + certValidity.replace(/^valid through\s*/i, "").replace(/\.$/, "")
                : item.date.replace(/^(Graduated|Completed):\s*/, "");
              return (
                <li
                  key={item.id}
                  data-reveal
                  className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[1fr_auto] sm:gap-8"
                >
                  <div>
                    <p className="font-medium text-white">{name}</p>
                    <p className="mt-1 text-sm text-white-200">{item.company_name}</p>
                  </div>
                  <p className="font-mono text-sm text-white-200/70">{when}</p>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* ------------------------------------------------------------- Contact */}
        <Reveal
          as="section"
          id="contact"
          className="grid items-center gap-12 border-t border-white/10 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr]"
        >
          <div>
            <h2
              data-reveal
              className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
            >
              Looking for a full stack engineer?{" "}
              <span className="text-white-200">Let&apos;s talk.</span>
            </h2>
            <p data-reveal className="mt-6 text-white-200">
              A full résumé is available on request. Email is the fastest way
              to reach me.
            </p>
            <div data-reveal className="mt-10">
              <CopyEmail />
            </div>
          </div>
          <div data-reveal>
            <WorkGlobe />
          </div>
        </Reveal>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-white-200/70 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>&copy; {new Date().getFullYear()} Bjorn Lindqvist</p>
          <ul className="flex gap-6">
            <li>
              <Link href="/accessibility" className="transition hover:text-white">
                Accessibility
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/BjornCLind"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
              >
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
