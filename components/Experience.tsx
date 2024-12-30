import React from "react";
import { experiences } from "@/data";
import { Button } from "./ui/MovingBorders";

const Experience = () => {
  return (
    <section id="work">
      <div className="py-20 w-full">
        <h1 className="heading">
          My <span className="text-purple">work experience</span>
        </h1>

        <div className="w-full mt-12 grid lg:grid-cols-4 grid-cols-1 gap-10">
          {experiences.map((exp, index) => (
            <Button
              key={index}
              duration={Math.floor(Math.random() * 10000) + 10000}
              borderRadius="1.75rem"
              style={{
                background: "rgb(4,7,29)",
                backgroundColor:
                  "linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)",
                borderRadius: `calc(1.75rem* 0.96)`,
              }}
              className="flex-1 text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              <div
                className="
                flex
                lg:flex-row
                flex-col
                lg:items-start  /* Align items at the start on large screens */
                items-center     /* On smaller screens, center them */
                p-3 py-6 md:p-5 lg:p-10
                gap-4
              "
              >
                {/* Icon on the left */}
                <div className="flex items-center justify-center">
                  <img
                    src={exp.icon}
                    alt={exp.company_name}
                    className="object-contain"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                </div>

                {/* Text details */}
                <div className="lg:ms-5 text-left">
                  {/* Job Title */}
                  <h2 className="text-white text-lg md:text-xl font-bold">
                    {exp.title}
                  </h2>
                  {/* Company Name */}
                  <p className="text-gray-200 text-sm md:text-base mt-1">
                    {exp.company_name}
                  </p>
                  {/* Date Range */}
                  <p className="text-gray-400 text-xs md:text-sm mt-1">
                    {exp.date}
                  </p>

                  {/* Render bullet points */}
                  {exp.points && exp.points.length > 0 && (
                    <ul className="mt-3 list-disc list-inside text-gray-200 leading-relaxed">
                      {exp.points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
