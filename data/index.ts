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

export type Project = {
  id: number;
  slug: string;
  title: string;
  des: string;
  tech: string[];
  context: string;
  detail: string[];
  /** Optional decorative visual rendered behind the page header. */
  visual?: "neural-field" | "microfilm";
  /** Small animated preview shown on the project's homepage row. */
  glyph: "rag" | "scan" | "records";
  /** Narrative scene rendered below the page content. */
  scene?: "records-pipeline";
  /** Transcribes the title from handwriting into type on arrival. */
  titleEffect?: "scan";
};

export const projects: Project[] = [
  {
    id: 1,
    slug: "policy-analyzer",
    glyph: "rag",
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
    glyph: "scan",
    title: "Microfilm Digitization of Handwritten Reports",
    des: "Fine-tuned a vision-language model with LoRA to transcribe handwritten reports from digitized microfilm, turning scanned archives into searchable text.",
    tech: ["Qwen3-VL", "LoRA", "Vision-Language", "Python"],
    context: "Internal tool, not publicly accessible",
    visual: "microfilm",
    titleEffect: "scan",
    detail: [
      "General-purpose OCR handles printed text well and decades-old handwriting on microfilm badly, which leaves a large archive effectively unsearchable.",
      "A vision-language model was fine-tuned with LoRA on representative pages, adapting it to the specific handwriting and scan quality without retraining the full model.",
      "The result converts scanned images into text that can be indexed and searched, rather than paged through by hand.",
    ],
  },
  {
    id: 3,
    slug: "firearms-qualification-records",
    glyph: "records",
    title: "Firearms Qualification Records",
    des: "Centralized database and management interface replacing scattered recordkeeping, with structured entry, lookup and reporting in one place.",
    tech: ["Laravel", "SQL", "Web App"],
    context: "Internal tool, not publicly accessible",
    scene: "records-pipeline",
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

/** Grouped for the homepage; drawn from the resume and the project work. */
export const skills = [
  {
    group: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Accessibility"],
  },
  {
    group: "Backend & data",
    items: ["Laravel", "Node.js", "SQL", "MongoDB", "Python", "REST APIs"],
  },
  {
    group: "Platforms",
    items: ["Power BI", "Power Automate", "SharePoint", "Content management"],
  },
  {
    group: "Infrastructure",
    items: ["Docker", "GitLab CI/CD", "IIS", "Linux"],
  },
  {
    group: "Applied AI",
    items: ["Local LLMs", "Retrieval (RAG)", "LoRA fine-tuning", "Vision-language models"],
  },
];

export const spokenLanguages = [
  "English (fluent)",
  "Swedish (fluent)",
  "Hungarian (fluent)",
  "Spanish (conversational)",
];

/** How the work is approached; shown as three short principles. */
export const principles = [
  {
    title: "Understand the process",
    body: "I start with the people doing the work. Mapping the existing process, its constraints and what finished actually means is what stops a project from building the wrong thing well.",
  },
  {
    title: "Weigh the options",
    body: "Before committing, I compare the realistic approaches on cost, capacity and security, including whether to build at all, and put the trade-offs in front of stakeholders in plain language.",
  },
  {
    title: "Build it to outlast me",
    body: "Then I build and test it properly and make sure it keeps running without me: documentation, training for the people using it, and monitoring so problems surface before users report them.",
  },
];
