/**
 * Static portfolio data — all content rendered by UI cards lives here.
 * The AI never generates this content; it only selects which card to show.
 *
 * ⚠️  REPLACE all placeholder content with your real information before deploying.
 */

// ── About / Bio ────────────────────────────────────────────────
export const ABOUT = {
  name: "Ashok Yadav",
  role: "AI/ML Engineer & Full-Stack Developer",
  location: "India",
  tagline: "Building intelligent systems that solve real-world problems",
  bio: "I'm a passionate AI/ML Engineer with a strong foundation in deep learning, NLP, and computer vision. I love turning research papers into production-ready applications. With expertise spanning from PyTorch model training to full-stack deployment with FastAPI and React, I bridge the gap between cutting-edge AI research and practical engineering.",
  tags: ["AI/ML", "Deep Learning", "Full-Stack", "Python", "FastAPI", "Computer Vision", "NLP"],
};

// ── Projects ───────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: "ai-portfolio",
    title: "AI-Powered Portfolio",
    category: "Full-Stack / AI",
    date: "June 2025",
    description:
      "A personal portfolio where the entire UX is a chat interface. Visitors ask questions and the AI responds with conversational text paired with interactive UI cards. Features streaming responses, tool-based routing, and a two-call LLM pattern for smooth UX.",
    techStack: ["React", "FastAPI", "LangChain", "Groq", "Tailwind CSS", "Vite"],
    links: [
      { label: "GitHub", url: "https://github.com/ashokyadav/portfolio" },
      { label: "Live Demo", url: "#" },
    ],
  },
  {
    id: "doc-analyzer",
    title: "Intelligent Document Analyzer",
    category: "NLP / AI",
    date: "March 2025",
    description:
      "An end-to-end document analysis system that extracts key information, summarizes content, and answers questions about uploaded PDFs. Supports multi-document analysis with cross-referencing and semantic search.",
    techStack: ["Python", "LangChain", "FAISS", "Streamlit", "Hugging Face"],
    links: [
      { label: "GitHub", url: "https://github.com/ashokyadav/doc-analyzer" },
    ],
  },
  {
    id: "object-detection",
    title: "Real-Time Object Detection",
    category: "Computer Vision / DL",
    date: "January 2025",
    description:
      "A real-time object detection application using YOLOv8 with custom-trained models. Deployed with a FastAPI backend and React dashboard showing live detection feeds with bounding boxes and confidence scores.",
    techStack: ["PyTorch", "YOLOv8", "TensorRT", "FastAPI", "React", "OpenCV"],
    links: [
      { label: "GitHub", url: "https://github.com/ashokyadav/object-detection" },
      { label: "Video Demo", url: "#" },
    ],
  },
  {
    id: "sentiment-dashboard",
    title: "Sentiment Analysis Dashboard",
    category: "NLP / Data Viz",
    date: "November 2024",
    description:
      "A comprehensive sentiment analysis platform tracking brand sentiment across social media, reviews, and news. Features real-time dashboards with trend analysis, fine-tuned BERT models, and ETL pipelines.",
    techStack: ["BERT", "PyTorch", "Plotly Dash", "PostgreSQL", "Apache Airflow"],
    links: [
      { label: "GitHub", url: "https://github.com/ashokyadav/sentiment-dashboard" },
    ],
  },
  {
    id: "ml-pipeline",
    title: "ML Deployment Pipeline",
    category: "MLOps / DevOps",
    date: "September 2024",
    description:
      "A production-grade ML deployment pipeline automating model training, evaluation, versioning, and serving. Includes A/B testing, automatic rollback, and zero-downtime model swaps with Kubernetes orchestration.",
    techStack: ["MLflow", "Docker", "Kubernetes", "GitHub Actions", "FastAPI"],
    links: [
      { label: "GitHub", url: "https://github.com/ashokyadav/ml-pipeline" },
    ],
  },
];

// ── Skills ─────────────────────────────────────────────────────
export const SKILLS = [
  {
    category: "AI/ML & Data Science",
    icon: "Brain",
    skills: [
      "PyTorch", "TensorFlow", "Scikit-learn", "Hugging Face",
      "LangChain", "OpenCV", "YOLO", "NLP", "Computer Vision",
      "Deep Learning", "Pandas", "NumPy",
    ],
  },
  {
    category: "Backend & Systems",
    icon: "Server",
    skills: [
      "Python", "FastAPI", "Flask", "Django REST",
      "PostgreSQL", "MongoDB", "Redis", "REST APIs",
      "Linux/Unix", "Docker",
    ],
  },
  {
    category: "Frontend",
    icon: "Layout",
    skills: [
      "React", "JavaScript", "Vite", "Tailwind CSS",
      "HTML/CSS", "Responsive Design",
    ],
  },
  {
    category: "MLOps & Cloud",
    icon: "Cloud",
    skills: [
      "MLflow", "DVC", "W&B", "AWS", "GCP",
      "Docker", "Kubernetes", "GitHub Actions", "CI/CD",
    ],
  },
  {
    category: "Soft Skills",
    icon: "Users",
    skills: [
      "Problem Solving", "Technical Writing", "Team Collaboration",
      "Research-to-Production", "Mentoring",
    ],
  },
];

// ── Contact ────────────────────────────────────────────────────
export const CONTACT = {
  email: "ashokyadav@example.com",
  handle: "@ashokyadav",
  socials: [
    { name: "GitHub", url: "https://github.com/ashokyadav" },
    { name: "LinkedIn", url: "https://linkedin.com/in/ashokyadav" },
    { name: "Twitter / X", url: "https://x.com/ashokyadav" },
  ],
};

// ── Experience ─────────────────────────────────────────────────
export const EXPERIENCE = [
  {
    id: "barco-intern",
    role: "AI Intern",
    company: "Barco Electronic Systems Pvt Ltd",
    team: "Product Security Team",
    location: "Noida, India",
    duration: "June 2025 – August 2025",
    description:
      "Worked on an AI-powered Threat Modeling platform for the Product Security team. Designed AI workflows for security analysis based on STRIDE methodology, built threat identification pipelines and automatic attack tree generation. Integrated multiple LLM providers (GPT-4, Claude, Gemini, Mistral) and generated downloadable threat reports. Built Docker-based deployment workflows and a Streamlit interface for the security team.",
    techStack: ["OpenAI GPT-4", "Claude", "Gemini", "Mistral", "LangChain", "Streamlit", "Docker", "Python"],
  },
];

// ── Resume ─────────────────────────────────────────────────────
export const RESUME = {
  fileName: "resume.pdf",
  heading: "My Resume",
  image: "/images/resume.png",
  description:
    "Download my full resume to see my complete education, experience, projects, and skills in one place.",
};

// ── Quick Questions (for the pill buttons) ─────────────────────
export const QUICK_QUESTIONS = [
  { label: "Me", question: "Tell me about yourself", icon: "Smile" },
  { label: "Projects", question: "Show me your projects", icon: "Briefcase" },
  { label: "Skills", question: "What are your skills?", icon: "Layers" },
  { label: "Experience", question: "Tell me about your work experience", icon: "Building2" },
  { label: "Resume", question: "Can I see your resume?", icon: "FileText" },
  { label: "Contact", question: "How can I contact you?", icon: "Users" },
];

