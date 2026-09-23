import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projects } from "@/data";

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
    <main className="relative mx-auto flex min-h-screen justify-center bg-black-100 px-5 sm:px-10">
      <article className="w-full max-w-3xl py-24 sm:py-32">
        <Link
          href="/#projects"
          className="text-sm text-purple underline underline-offset-4"
        >
          &larr; Back to projects
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {project.title}
        </h1>

        <p className="mt-3 text-sm text-white-200">{project.context}</p>

        <p className="mt-6 text-lg leading-relaxed text-white-100">
          {project.des}
        </p>

        <ul className="mt-8 flex flex-wrap gap-2">
          {project.tech.map((item) => (
            <li
              key={item}
              className="rounded-lg bg-[#10132E] px-3 py-1.5 text-xs text-white-100"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 space-y-5 border-t border-black-300 pt-10">
          {project.detail.map((paragraph, i) => (
            <p key={i} className="leading-relaxed text-white-200">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
