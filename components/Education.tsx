import React from "react";
import Image from "next/image";

import { education } from "@/data";
import { cn } from "@/lib/utils";

const VerticalTimeline: React.FC = () => {
  return (
    <section id="education">
      <div className="py-20 w-full">
        <h1 className="heading">
          My <span className="text-purple">Education</span>
        </h1>
      </div>

      <div className="relative w-full py-10">
        {/* Center line, desktop only */}
        <div
          className="absolute left-1/2 top-0 hidden h-full w-[2px] -translate-x-1/2 bg-gray-400 md:block"
          aria-hidden="true"
        />

        <ol className="list-none">
          {education.map((item, index) => {
            const isLeft = index % 2 === 0;

            return (
              <li key={item.id} className="relative mb-16 w-full">
                {/* Badge: above the card on mobile, on the center line on desktop */}
                <div
                  className="mb-4 flex justify-center md:absolute md:left-1/2 md:top-0 md:mb-0 md:-translate-x-1/2"
                  aria-hidden="true"
                >
                  <div
                    className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-4 border-white shadow-md"
                    style={{ background: item.iconBg ?? "#383E56" }}
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                </div>

                {/* One card per entry; the side is chosen with padding so the
                    content is not duplicated for each breakpoint. */}
                <div
                  className={cn(
                    isLeft
                      ? "md:flex md:justify-end md:pr-[calc(50%+2rem)]"
                      : "md:pl-[calc(50%+2rem)]"
                  )}
                >
                  <div className="w-full rounded-lg bg-[rgb(4,7,29)] bg-gradient-to-r from-[rgba(4,7,29,1)] to-[rgba(12,14,35,1)] p-5 text-white shadow-md">
                    <h2 className="text-lg font-bold md:text-xl">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-200 md:text-base">
                      {item.company_name}
                    </p>
                    {item.date && (
                      <p className="mt-1 text-xs text-gray-400 md:text-sm">
                        {item.date}
                      </p>
                    )}

                    {item.points?.length > 0 && (
                      <ul className="mt-3 list-inside list-disc leading-relaxed text-gray-200">
                        {item.points.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default VerticalTimeline;
