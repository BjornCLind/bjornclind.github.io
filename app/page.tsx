import Link from "next/link";

import CopyEmail from "@/components/home/CopyEmail";
import HeroHeadline from "@/components/home/HeroHeadline";
import Magnetic from "@/components/home/Magnetic";
import ProjectGlyph from "@/components/home/ProjectGlyph";
import Reveal from "@/components/home/Reveal";
import {
  education,
  experiences,
  principles,
  projects,
  skills,
  spokenLanguages,
} from "@/data";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience", wide: true },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <h2
      data-reveal
      className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-white-200/70"
    >
      <span className="font-mono text-purple">{n}</span>
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

      <main className="relative mx-auto max-w-5xl px-6 sm:px-10">
        {/* ---------------------------------------------------------------- Hero */}
        <Reveal as="section" className="pb-16 pt-24 sm:pb-24 sm:pt-36">
          <p
            data-reveal
            className="text-xs font-medium uppercase tracking-[0.14em] text-white-200/70 sm:tracking-[0.22em]"
          >
            Full stack engineer · Web systems analyst
          </p>
          <HeroHeadline
            lead="Web systems that turn paper processes into"
            accent="software people use."
            className="mt-6 max-w-4xl text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
          />
          <p
            data-reveal
            className="mt-8 max-w-2xl text-lg leading-relaxed text-white-200"
          >
            I&apos;m Bjorn Lindqvist. I design, build and maintain internal
            portals, dashboards and document pipelines, and lately the locally
            hosted language models behind them.
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

        {/* ---------------------------------------------------------------- Work */}
        <Reveal as="section" id="work" className="scroll-mt-24 py-16 sm:py-24">
          <SectionLabel n="01" title="Selected work" />
          <p data-reveal className="mt-6 max-w-2xl text-white-200">
            Most of what I build is internal and not publicly accessible, so
            each project is written up rather than linked.
          </p>

          <ol className="mt-12 border-t border-white/10">
            {projects.map((project, i) => (
              <li key={project.slug} data-reveal className="border-b border-white/10">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group relative grid gap-x-8 gap-y-4 py-9 outline-none sm:grid-cols-[3.5rem_1fr_auto] focus-visible:bg-white/[0.03]"
                >
                  <span className="font-mono text-sm text-white-200/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-2xl font-medium tracking-tight text-white transition-colors group-hover:text-purple sm:text-[1.7rem]">
                      {project.title}
                    </h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-white-200">
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
                      className="hidden text-2xl text-white-200/60 transition group-hover:translate-x-1 group-hover:text-purple sm:block"
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
        <Reveal as="section" id="experience" className="scroll-mt-24 py-16 sm:py-24">
          <SectionLabel n="02" title="Experience" />

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
                    <p className="font-mono text-white-200/60">{job.date}</p>
                    <p className="mt-2 text-white-100">{company}</p>
                    <p className="text-white-200/60">{place.join(", ")}</p>
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
        <Reveal as="section" id="about" className="scroll-mt-24 py-16 sm:py-24">
          <SectionLabel n="03" title="About" />

          <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_1.1fr]">
            <div data-reveal className="space-y-5 text-lg leading-relaxed text-white-200">
              <p>
                I work across the stack and across the table: sitting down with
                the people who use a system, then designing, building and
                supporting it.
              </p>
              <p>
                Right now that means internal tools, reporting and applied AI
                for a public-sector department. Before that it was full stack
                product engineering in React, Next.js and TypeScript.
              </p>
              <p>
                Flexible across time zones, and authorized to work in the US
                and EU.
              </p>
              <div className="pt-4 text-sm">
                <p className="text-white-200/60">Languages</p>
                <p className="mt-2 text-white-100">{spokenLanguages.join(" · ")}</p>
              </div>
            </div>

            <dl data-reveal className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {skills.map((s) => (
                <div key={s.group}>
                  <dt className="text-sm text-white-200/60">{s.group}</dt>
                  <dd className="mt-2 leading-relaxed text-white-100">
                    {s.items.join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* ------------------------------------------------ Education & approach */}
        <Reveal as="section" id="education" className="scroll-mt-24 py-16 sm:py-24">
          <SectionLabel n="04" title="Education & certification" />

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
                  <p className="font-mono text-sm text-white-200/60">{when}</p>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal as="section" id="approach" className="scroll-mt-24 py-16 sm:py-24">
          <SectionLabel n="05" title="How I work" />
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {principles.map((p, i) => (
              <li key={p.title} data-reveal>
                <span className="font-mono text-sm text-purple">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-medium tracking-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-3 leading-relaxed text-white-200">{p.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* ------------------------------------------------------------- Contact */}
        <Reveal as="section" id="contact" className="scroll-mt-24 border-t border-white/10 py-20 sm:py-28">
          <h2
            data-reveal
            className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl"
          >
            Have a process that still runs on paper?{" "}
            <span className="text-white-200">Let&apos;s talk.</span>
          </h2>
          <p data-reveal className="mt-6 text-white-200">
            Email is the fastest way to reach me.
          </p>
          <div data-reveal className="mt-10">
            <CopyEmail />
          </div>
        </Reveal>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-white-200/60 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>&copy; {new Date().getFullYear()} Bjorn Lindqvist</p>
          <a
            href="https://github.com/BjornCLind"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
