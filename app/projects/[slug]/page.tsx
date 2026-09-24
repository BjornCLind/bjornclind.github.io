import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProjectIntro from "@/components/ProjectIntro";
import ProjectVisual from "@/components/ProjectVisual";
import ScanlineTitle from "@/components/ui/ScanlineTitle";
import { projects } from "@/data";
import { handwriting } from "@/lib/fonts";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};

  return {
    title: `${project.title} | Bjorn Lindqvist`,
    description: project.des,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | Bjorn Lindqvist`,
      description: project.des,
      url: `/projects/${project.slug}`,
    },
  };
}

export default function ProjectPage({ params }: Params) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-black-100 px-5 sm:px-10">
      {project.visual && <ProjectVisual name={project.visual} />}

      <div className="relative mx-auto flex justify-center">
        <article className="relative w-full max-w-3xl py-24 sm:py-32">
          {/* Holds text contrast against the field without hiding it: the
              column is dimmed, the margins stay clear. */}
          {project.visual === "neural-field" && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-8 -inset-y-4 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,3,25,0.92)_0%,rgba(0,3,25,0.75)_55%,transparent_100%)]"
            />
          )}
          <ProjectIntro>
            <Link
              href="/#projects"
              data-reveal
              className="inline-block text-sm text-purple underline underline-offset-4"
            >
              &larr; Back to projects
            </Link>

            <h1
              data-reveal
              className="mt-8 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            >
              {project.titleEffect === "scan" ? (
                <ScanlineTitle
                  text={project.title}
                  handwritingClassName={handwriting.className}
                />
              ) : (
                project.title
              )}
            </h1>

            <p data-reveal className="mt-3 text-sm text-white-200">
              {project.context}
            </p>

            <p
              data-reveal
              className="mt-6 text-lg leading-relaxed text-white-100"
            >
              {project.des}
            </p>

            <ul data-reveal className="mt-8 flex flex-wrap gap-2">
              {project.tech.map((item) => (
                <li
                  key={item}
                  className="rounded-lg bg-[#10132E] px-3 py-1.5 text-xs text-white-100"
                >
                  {item}
                </li>
              ))}
            </ul>

            {project.visual === "neural-field" && (
              <p data-reveal className="mt-8 text-xs text-white-200/70">
                The field behind this page is the retrieval step: the query
                point is your cursor, and the chunks nearest it light up and
                link in. Drag a chunk to throw it. On a phone the query moves
                on its own, and a tap re-aims it.
              </p>
            )}

            {project.titleEffect === "scan" && (
              <p data-reveal className="mt-8 text-xs text-white-200/70">
                The title above arrives as handwriting and is transcribed left
                to right. Move your cursor across it to drive the scanner head
                yourself, or tap it on a phone to run the pass again.
              </p>
            )}

            <div
              data-reveal
              className="mt-12 space-y-5 border-t border-black-300 pt-10"
            >
              {project.detail.map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-white-200">
                  {paragraph}
                </p>
              ))}
            </div>
          </ProjectIntro>
        </article>
      </div>
    </main>
  );
}
