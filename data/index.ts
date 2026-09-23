export const navItems = [
  { name: "About", link: "#about" },
  { name: "Work", link: "#work" },
  { name: "Education", link: "#education" },
  { name: "Projects", link: "#projects" },
  { name: "Contact", link: "#contact" },
];

export const gridItems = [
  {
    id: 1,
    title:
      "My name is Bjorn Lindqvist, and I design, build and maintain web systems end to end.",
    description: "",
    className: "lg:col-span-3 md:col-span-6 md:row-span-4 lg:min-h-[60vh]",
    imgClassName: "w-full h-full",
    titleClassName: "justify-end",
    img: "/b1.svg",
    spareImg: "",
  },
  {
    id: 2,
    title:
      "I'm flexible with time zone communications and authorized to work in the EU and US.",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "",
    spareImg: "",
  },
  {
    id: 3,
    title: "My tech stack",
    description: "I constantly try to improve",
    className: "lg:col-span-2 md:col-span-3 md:row-span-2",
    imgClassName: "",
    titleClassName: "justify-center",
    img: "",
    spareImg: "",
  },
  {
    id: 4,
    title:
      "I speak English, Swedish and Hungarian fluently, plus conversational Spanish.",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-start",
    img: "/grid.svg",
    spareImg: "/b4.svg",
  },
  {
    id: 5,
    title:
      "Exploring locally hosted large language models and agentic AI workflow automation.",
    description: "What I'm working on...",
    className: "md:col-span-3 md:row-span-2",
    imgClassName: "absolute right-0 bottom-0 md:w-96 w-60",
    titleClassName: "justify-center md:justify-start lg:justify-center",
    img: "/b5.svg",
    spareImg: "/grid.svg",
  },
  {
    id: 6,
    title: "Feel free to reach out!",
    description: "",
    className: "lg:col-span-2 md:col-span-3 md:row-span-1",
    imgClassName: "",
    titleClassName: "justify-center md:max-w-full max-w-60 text-center",
    img: "",
    spareImg: "",
  },
];

export const education = [
  {
    id: 1,
    title: "B.S. Information Technology, Concentration in Business Analytics",
    company_name: "University of Hawaii, Kahului, HI",
    date: "Graduated: May 2020",
    icon: "/uhmc.jpg",
    iconBg: "#E6DEDD",
    points: [
      "Relevant coursework: Database Design & Development, Information Systems & eCommerce, C++ Object-Oriented Programming.",
    ],
  },
  {
    id: 2,
    title:
      "Professional Certificate in Coding: Full Stack Development with MERN",
    company_name: "Massachusetts Institute of Technology (MIT), Cambridge, MA",
    date: "Completed: May 2022",
    icon: "/mit.jpg",
    iconBg: "#383E56",
    points: [
      "Covered front-end and back-end development across the MERN stack.",
      "Built responsive web applications with React and Node.js.",
      "Integrated RESTful APIs and worked with Git in collaborative workflows.",
    ],
  },
  {
    id: 3,
    title: "Certifications",
    company_name: "CompTIA",
    date: "",
    icon: "/certs.jpg",
    iconBg: "#383E56",
    points: ["CompTIA Security+ — valid through February 2028."],
  },
];

export const socialMedia = [
  {
    id: 1,
    img: "/git.svg",
    link: "https://github.com/BjornCLind",
  },
];

export type Project = {
  id: number;
  slug: string;
  title: string;
  des: string;
  tech: string[];
  context: string;
  detail: string[];
  /** Optional decorative visual rendered behind the page header. */
  visual?: "neural-field";
};

export const projects: Project[] = [
  {
    id: 1,
    slug: "policy-analyzer",
    title: "Policy Analyzer",
    des: "Retrieval-augmented search over a large policy corpus, letting staff ask plain-language questions and get answers grounded in the source documents.",
    tech: ["Qwen3", "ChromaDB", "RAG", "Python"],
    context: "Internal tool, not publicly accessible",
    visual: "neural-field",
    detail: [
      "Policy manuals are long, cross-referenced and updated in place, so the practical problem is not search but trust: staff need the passage an answer came from, not a paraphrase.",
      "Documents are chunked and embedded into a vector store, and each answer is generated only from the passages retrieved for that question, with the sources shown alongside it.",
      "The language model runs locally rather than through a hosted API, which keeps the document set inside the network it already lives in.",
    ],
  },
  {
    id: 2,
    slug: "microfilm-digitization",
    title: "Microfilm Digitization of Handwritten Reports",
    des: "Fine-tuned a vision-language model with LoRA to transcribe handwritten reports from digitized microfilm, turning scanned archives into searchable text.",
    tech: ["Qwen3-VL", "LoRA", "Vision-Language", "Python"],
    context: "Internal tool, not publicly accessible",
    detail: [
      "General-purpose OCR handles printed text well and decades-old handwriting on microfilm badly, which leaves a large archive effectively unsearchable.",
      "A vision-language model was fine-tuned with LoRA on representative pages, adapting it to the specific handwriting and scan quality without retraining the full model.",
      "The result converts scanned images into text that can be indexed and searched, rather than paged through by hand.",
    ],
  },
  {
    id: 3,
    slug: "firearms-qualification-records",
    title: "Firearms Qualification Records",
    des: "Centralized database and management interface replacing scattered recordkeeping, with structured entry, lookup and reporting in one place.",
    tech: ["Laravel", "SQL", "Web App"],
    context: "Internal tool, not publicly accessible",
    detail: [
      "Records that live in spreadsheets and paper are hard to query and easy to let drift, especially when several people maintain them independently.",
      "A single relational schema with validation at entry replaced that, so the data is consistent enough to report on directly.",
      "A browser interface handles entry, lookup and reporting, which removed a recurring manual collation step.",
    ],
  },
];

export const experiences = [
  {
    title: "Data Processing Systems Analyst / Computer Programmer",
    company_name: "Honolulu Police Department, Honolulu, HI",
    icon: "/exp1.svg",
    iconBg: "#383E56",
    date: "March 2025 – Present",
    points: [
      "Analyze, design and maintain a data-driven internal web portal used by staff across multiple divisions, bringing dashboards, document management and reporting into one interface.",
      "Own site structure, interface and information architecture, translating business needs into self-service workflows that replace paper-driven processes.",
      "Audit enterprise content management systems and deliver retention analysis and platform recommendations to senior management.",
      "Build Power BI dashboards and data visualizations for a public-facing department website, and automate request intake and routing with Power Automate.",
      "Monitor and maintain internal web applications on GitLab CI/CD, Docker, IIS and Laravel, and uphold application and database security in a sensitive-data environment.",
    ],
  },
  {
    title: "Full Stack Engineer",
    company_name: "VolunteerAlly, Honolulu, HI",
    icon: "/exp2.svg",
    iconBg: "#383E56",
    date: "October 2023 – January 2025",
    points: [
      "Built responsive, cross-browser web applications in React, Next.js and TypeScript, owning interface decisions from layout through release.",
      "Used Next.js server-side rendering against API-driven content services to improve reliability and page load performance.",
      "Improved search visibility and Core Web Vitals by pairing SEO practices with server-side rendering.",
      "Designed and secured a scalable database, defining validation rules, data structures and reporting.",
      "Established repeatable regression coverage with Cypress end-to-end tests, and presented feasibility analyses to non-technical stakeholders.",
    ],
  },
  {
    title: "Field Service Technician",
    company_name: "E-Service, Kahului, HI",
    icon: "/exp3.svg",
    iconBg: "#383E56",
    date: "October 2021 – January 2023",
    points: [
      "Diagnosed and repaired business network infrastructure, including Cisco VoIP systems, switches, routers and structured cabling.",
      "Evaluated hardware and network capacity for client organizations and recommended upgrades or replacement technology.",
      "Delivered on-site support and explained technical issues to non-technical clients in plain language.",
    ],
  },
];
