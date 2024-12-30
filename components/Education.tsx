import React from "react";
import { education } from "@/data"; // Directly importing experiences

const VerticalTimeline: React.FC = () => {
  return (
    <section id="education">
        <div className="py-20 w-full">
        <h1 className="heading">
          My <span className="text-purple">Education</span>
        </h1>
        </div>
    <div className="relative w-full py-10">
      
      {/* 
        Center line for DESKTOP only
        We hide it on small screens (hidden on < md).
      */}
      <div className="absolute left-1/2 top-0 h-full w-[2px] bg-gray-400 -translate-x-1/2" />

      {education.map((exp, index) => {
        const isLeft = index % 2 === 0;

        return (
          <div key={index} className="relative mb-16 w-full">
            {/* ===== DESKTOP LAYOUT (md and up) ===== */}
            <div className="hidden md:flex w-full relative">
              {/* Left Column */}
              <div className="w-1/2 flex justify-end pr-4">
                {isLeft && <ContentBox exp={exp} />}
              </div>

              {/* Right Column */}
              <div className="w-1/2 flex justify-start pl-4">
                {!isLeft && <ContentBox exp={exp} />}
              </div>

              {/* Center Circle (desktop) */}
              <div
                className="
                  absolute
                  top-0
                  left-1/2
                  -translate-x-1/2
                  flex
                  items-center
                  justify-center
                  rounded-full
                  border-4 border-white
                  shadow-md
                "
                style={{
                  width: "60px",
                  height: "60px",
                  background: exp.iconBg ?? "#383E56",
                }}
              >
                <img
                  src={exp.icon}
                  alt={exp.company_name}
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>

            {/* ===== MOBILE LAYOUT (below md) ===== */}
            <div className="md:hidden w-full relative">
              {/* Circle centered above the box */}
              <div className="flex items-center justify-center mb-4">
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-full
                    border-4 border-white
                    shadow-md
                  "
                  style={{
                    width: "60px",
                    height: "60px",
                    background: exp.iconBg ?? "#383E56",
                  }}
                >
                  <img
                    src={exp.icon}
                    alt={exp.company_name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              {/* Content Box (single column) */}
              <ContentBox exp={exp} />
            </div>
          </div>
        );
      })}
    </div>
    </section>
  );
};

/**
 * A small helper component to render the content box
 * so we don't repeat code in both desktop & mobile layouts.
 */
const ContentBox: React.FC<{ exp: (typeof education)[0] }> = ({ exp }) => (
  <div
    className="
      bg-[rgb(4,7,29)]
      bg-gradient-to-r 
      from-[rgba(4,7,29,1)] 
      to-[rgba(12,14,35,1)]
      p-5
      rounded-lg
      shadow-md
      text-white
      w-full
    "
  >
    <h2 className="text-lg md:text-xl font-bold">{exp.title}</h2>
    <p className="text-gray-200 text-sm md:text-base mt-1">
      {exp.company_name}
    </p>
    <p className="text-gray-400 text-xs md:text-sm mt-1">{exp.date}</p>

    {exp.points?.length > 0 && (
      <ul className="mt-3 list-disc list-inside text-gray-200 leading-relaxed">
        {exp.points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    )}
  </div>
);

export default VerticalTimeline;
