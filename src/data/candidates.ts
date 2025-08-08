export type Candidate = {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  yearsExperience: number;
  skills: string[];
  preferredSkills?: string[];
  openToWork?: boolean;
  summary: string;
  avatarUrl?: string;
};

export const candidates: Candidate[] = [
  {
    id: "1",
    name: "Ava Thompson",
    title: "Senior Frontend Engineer",
    company: "NimbusAI",
    location: "San Francisco, CA",
    industry: "Software",
    yearsExperience: 8,
    skills: ["React", "TypeScript", "GraphQL", "Tailwind", "Node.js"],
    preferredSkills: ["Next.js", "Design Systems"],
    openToWork: true,
    summary:
      "Frontend specialist building scalable design systems and data-heavy dashboards with strong UX focus.",
  },
  {
    id: "2",
    name: "Mateo Rossi",
    title: "Data Scientist",
    company: "Quantica",
    location: "New York, NY",
    industry: "Finance",
    yearsExperience: 6,
    skills: ["Python", "Pandas", "XGBoost", "SQL", "Airflow"],
    preferredSkills: ["LLMs", "Vector DBs"],
    openToWork: false,
    summary:
      "Applied ML for risk modeling and pricing. Deployed pipelines and monitoring for production models.",
  },
  {
    id: "3",
    name: "Zara Malik",
    title: "Product Manager",
    company: "Atlas Health",
    location: "Remote, UK",
    industry: "Healthcare",
    yearsExperience: 9,
    skills: ["Roadmapping", "Discovery", "Analytics", "Growth"],
    preferredSkills: ["B2B SaaS", "AI Products"],
    openToWork: true,
    summary:
      "PM with deep discovery practice, shipping regulated health products across web and mobile.",
  },
  {
    id: "4",
    name: "Kenji Sato",
    title: "Platform Engineer",
    company: "Orbit Cloud",
    location: "Tokyo, JP",
    industry: "Cloud",
    yearsExperience: 10,
    skills: ["Kubernetes", "Terraform", "Golang", "AWS", "CI/CD"],
    preferredSkills: ["Observability", "SRE"],
    openToWork: false,
    summary:
      "Built multi-tenant platforms, optimized cost and reliability, led observability initiatives.",
  },
  {
    id: "5",
    name: "Lina Becker",
    title: "UX Designer",
    company: "Bloom Retail",
    location: "Berlin, DE",
    industry: "E-commerce",
    yearsExperience: 7,
    skills: ["Figma", "Design Systems", "User Research", "Prototyping"],
    preferredSkills: ["Motion", "Accessibility"],
    openToWork: true,
    summary:
      "Human-centered designer crafting performant, accessible, and beautiful shopping experiences.",
  },
  {
    id: "6",
    name: "Diego Carvalho",
    title: "Full-Stack Engineer",
    company: "Nova Labs",
    location: "Austin, TX",
    industry: "Software",
    yearsExperience: 5,
    skills: ["Node.js", "React", "PostgreSQL", "tRPC", "Docker"],
    preferredSkills: ["Remix", "Prisma"],
    openToWork: false,
    summary:
      "Shipped end-to-end features across API, DB, and UI. DevOps-aware and product-minded.",
  },
  {
    id: "7",
    name: "Chen Wei",
    title: "ML Engineer",
    company: "Visionary",
    location: "Singapore",
    industry: "AI",
    yearsExperience: 4,
    skills: ["PyTorch", "Computer Vision", "MLOps", "FastAPI"],
    preferredSkills: ["Transformers", "Diffusion"],
    openToWork: true,
    summary:
      "Built vision pipelines from research to prod, optimized inference and cost.",
  },
  {
    id: "8",
    name: "Emily Carter",
    title: "Marketing Lead",
    company: "BrightHub",
    location: "Remote, US",
    industry: "SaaS",
    yearsExperience: 8,
    skills: ["SEO", "Content", "Lifecycle", "Attribution"],
    preferredSkills: ["PLG", "ABM"],
    openToWork: true,
    summary:
      "Data-driven marketer aligning content, SEO, and lifecycle for efficient growth.",
  },
  {
    id: "9",
    name: "Omar El-Sayed",
    title: "Security Engineer",
    company: "Cobalt",
    location: "Dubai, AE",
    industry: "Security",
    yearsExperience: 11,
    skills: ["AppSec", "Threat Modeling", "SAST", "K8s Security"],
    preferredSkills: ["Bug Bounty", "Zero Trust"],
    openToWork: false,
    summary:
      "Security specialist embedding AppSec practices in CI/CD and educating engineering teams.",
  },
  {
    id: "10",
    name: "Sofia Marin",
    title: "Data Engineer",
    company: "Flowlytics",
    location: "Madrid, ES",
    industry: "Data",
    yearsExperience: 6,
    skills: ["Spark", "Delta Lake", "dbt", "Kafka", "GCP"],
    preferredSkills: ["Beam", "Dagster"],
    openToWork: true,
    summary:
      "Delivered reliable data platforms with governance and CDC pipelines.",
  },
  {
    id: "11",
    name: "Noah Kim",
    title: "Mobile Engineer",
    company: "Glide",
    location: "Seoul, KR",
    industry: "Consumer Apps",
    yearsExperience: 7,
    skills: ["Swift", "Kotlin", "React Native", "CI/CD"],
    preferredSkills: ["Jetpack Compose", "SwiftUI"],
    openToWork: false,
    summary:
      "Hybrid mobile expert, shipped to millions of users with strong quality gates.",
  },
  {
    id: "12",
    name: "Priya Sharma",
    title: "AI Product Designer",
    company: "Lucent",
    location: "Bengaluru, IN",
    industry: "AI",
    yearsExperience: 5,
    skills: ["Design Systems", "Prompt Design", "Prototyping", "Handoff"],
    preferredSkills: ["LLM UX", "Agent Flows"],
    openToWork: true,
    summary:
      "Designing intuitive AI experiences with responsible defaults and clear affordances.",
  },
];
