/**
 * Static portfolio data — all content rendered by UI cards lives here.
 * The AI never generates this content; it only selects which card to show.
 *
 * Facts the chatbot can talk about live separately in backend/knowledge/*.md —
 * keep the two in sync when you change something.
 */

// ── About / Bio ────────────────────────────────────────────────
export const ABOUT = {
  name: "Abhishek Yadav",
  role: "AI Engineer · Computer Vision & Generative AI",
  photo: "/images/profile.jpg",
  location: "Delhi, India",
  tagline: "Building AI systems that solve real problems for real users",
  bio: "I'm an AI Engineer working across computer vision and Generative AI. By day I'm a Computer Vision Engineer at Spraxa Solutions, training and optimizing detection, segmentation, and recognition models. In my own projects I build LLM systems — RAG pipelines, multi-agent apps, and fine-tuned models — and I care about shipping them, not just notebook demos. I graduated with a B.Tech in Computer Engineering from Bharati Vidyapeeth (Deemed to be University) College of Engineering, Pune (2022 – 2026).",
  tags: ["Computer Vision", "Generative AI", "LLMs", "RAG", "AI Agents", "PyTorch", "Fine-Tuning"],
};

// ── Projects ───────────────────────────────────────────────────
// `id` values must match ProjectId in backend/tools.py
export const PROJECTS = [
  {
    id: "budans-brew",
    thumbnail: "/images/projects/budans_brew.jpg",
    title: "Budan's Brew",
    category: "Multi-Agent AI / RAG",
    date: "September 2025",
    summary:
      "Multi-agent customer service for a coffee shop app: guard, intent routing, RAG menu answers, order taking, and upselling.",
    description:
      "An AI-powered customer service chatbot for a coffee shop mobile app. It takes orders, answers detailed menu questions (ingredients, allergens), recommends complementary products, and blocks irrelevant or harmful queries. Built as a multi-agent system, not a single chatbot, with Llama 3.1 8B Instruct served on RunPod. I designed and built the AI and backend; the React Native app was built by a friend.",
    architecture: [
      "Guard Agent screens every message and blocks harmful or off-topic queries before anything else runs",
      "Classification Agent detects intent and routes to the right specialist agent",
      "Details Agent (RAG) embeds the question, retrieves menu and FAQ entries from Pinecone, and answers grounded in them",
      "Order Taking Agent walks the customer through a structured order using chain-of-thought prompting",
      "Recommendation Agent upsells complementary items via Apriori market basket analysis, with a popularity fallback",
    ],
    decisions: [
      "Specialized agents instead of one giant prompt — each agent is small, testable, and easy to extend",
      "Safety first: the guard runs before classification, so bad input never reaches the other agents",
      "Recommendation engine trained on a real Kaggle coffee shop sales dataset",
      "Containerized Python agent API deployed on RunPod GPUs, with product data in Firebase",
    ],
    techStack: ["Llama 3.1 8B", "RunPod", "Pinecone", "RAG", "Apriori", "Python", "Docker", "Firebase", "React Native"],
    images: ["/images/projects/chatbot_agent_architecture.jpg", "/images/projects/budans_brew.jpg"],
    links: [
      { label: "GitHub", url: "https://github.com/yadavabhishekz/budans-brew" },
      { label: "Demo Video", url: "https://www.loom.com/share/c77e4b17248c4ae282dab89aaf7227d8" },
    ],
  },
  {
    id: "recap",
    thumbnail: "/images/projects/recap-ui.jpg",
    title: "RECAP",
    category: "Speech AI / RAG",
    date: "June 2026",
    summary:
      "Turns any meeting recording or YouTube video into a summary, action items, decisions, and a RAG chat over the transcript.",
    description:
      "Drop in a YouTube link or a local video/audio file, and RECAP turns it into a structured meeting report — summary, action items with owner and deadline, key decisions, and open questions — then lets you chat with the meeting through RAG. Handles both English and Hinglish.",
    architecture: [
      "yt-dlp + ffmpeg download and convert audio to 16 kHz mono WAV, split into 10-minute chunks",
      "Dual-engine transcription: Groq Whisper large-v3-turbo for English, Sarvam AI saaras:v2.5 for Hinglish (transcribe + translate in one pass)",
      "Map-reduce summarization over the chunked transcript with Llama 3.3-70B via LangChain LCEL",
      "Structured extraction of action items, key decisions, and open questions",
      "Transcript embedded with Gemini embeddings into a per-meeting ChromaDB collection, queried by an LCEL RAG chain",
    ],
    decisions: [
      "One ChromaDB collection per meeting, so answers never leak across users or sessions",
      "Sarvam's API caps audio at 30 s, so chunks are automatically re-split into 25 s pieces",
      "Map-reduce summarization keeps very long meetings within the context window",
      "FastAPI background jobs with pollable pipeline stages; the single-file UI is served by FastAPI, so the whole app runs as one Docker process",
    ],
    techStack: ["FastAPI", "LangChain LCEL", "Groq", "Llama 3.3-70B", "Whisper", "Sarvam AI", "Gemini Embeddings", "ChromaDB", "Docker"],
    images: ["/images/projects/recap-ui.jpg"],
    links: [
      { label: "Live Demo", url: "https://ai-meetings-assistant.onrender.com/" },
      { label: "GitHub", url: "https://github.com/yadavabhishekz/RECAP" },
      { label: "Demo Video", url: "https://www.loom.com/share/90de82b0cac647ef9a641d81eb24bbba" },
    ],
  },
  {
    id: "series-nlp",
    thumbnail: "/images/projects/series-character-network.jpg",
    title: "Series Analysis with NLP",
    category: "NLP / Fine-Tuning",
    date: "November 2025",
    summary:
      "Themes, character networks, a fine-tuned classifier, and a LoRA-tuned Llama 3 character chatbot across 220+ episodes.",
    description:
      "An end-to-end NLP system that analyzes a TV series (Naruto) across 220+ episodes: which themes dominate, how characters are connected, what type of jutsu a description refers to — plus a chatbot that talks like a character. Everything is wrapped in a Gradio web app.",
    architecture: [
      "Custom Scrapy spider builds the jutsu training dataset",
      "Zero-shot theme classification with facebook/bart-large-mnli over subtitles — any theme list, no labels needed",
      "Character network from spaCy NER (en_core_web_trf) co-occurrences, built in NetworkX and rendered with PyVis",
      "DistilBERT fine-tuned to classify jutsu types",
      "Llama-3-8B-Instruct fine-tuned with LoRA as a character chatbot, published to the Hugging Face Hub",
    ],
    decisions: [
      "20:1 class imbalance handled with a custom trainer using class-weighted loss, trained on 2,920 scraped samples",
      "4-bit quantization (bitsandbytes) + LoRA (r=64, alpha=16) cut the 8B model's memory footprint from 32 GB to 6 GB",
      "Zero-shot classification avoids hand-labelling themes entirely",
    ],
    techStack: ["Llama 3 8B", "LoRA", "bitsandbytes", "DistilBERT", "BART", "spaCy", "NetworkX", "Scrapy", "Hugging Face", "Gradio"],
    images: ["/images/projects/series-character-network.jpg", "/images/projects/series-themes.png"],
    links: [
      { label: "GitHub", url: "https://github.com/yadavabhishekz/analyze_series_with_nlp" },
    ],
  },
  {
    id: "job-recommender",
    coverText: "Resume → Jobs",
    title: "AI Job Recommender",
    category: "LLM App / MCP",
    date: "October 2025",
    summary:
      "Upload a resume, get a summary, skill gaps, a career roadmap, and live LinkedIn + Naukri jobs. Also exposed as an MCP server.",
    description:
      "Upload a resume PDF and the app summarizes it, finds skill gaps, suggests a career roadmap, and then pulls matching live job listings from LinkedIn and Naukri. The job search is also exposed as an MCP server, so any MCP-compatible AI agent can use it as a tool.",
    architecture: [
      "PyMuPDF extracts text from the uploaded resume",
      "Three LLM analyses on Groq (gpt-oss-120b): resume summary, skill gaps, and future roadmap",
      "The LLM converts the summary into job titles and search keywords",
      "Apify scraper actors fetch up to 60 matching jobs each from LinkedIn and Naukri",
    ],
    decisions: [
      "Job search functions exposed as tools on a FastMCP server over stdio — reusable by any MCP client",
      "LLM-generated search keywords instead of naive resume keyword matching",
    ],
    techStack: ["Groq", "gpt-oss-120b", "MCP", "FastMCP", "Apify", "PyMuPDF", "Streamlit", "uv"],
    links: [
      { label: "GitHub", url: "https://github.com/yadavabhishekz/AI-Powered-Job-Recommender-System" },
    ],
  },
  {
    id: "ai-data-analyst",
    coverText: "Text → SQL",
    title: "AI Data Analyst",
    category: "Text-to-SQL / Local LLMs",
    date: "April 2026",
    summary:
      "Ask a database questions in plain English. Local LLMs via Ollama turn them into SQL — no data leaves the machine.",
    description:
      "Lets someone ask a question about a database in plain English and get back real SQL-backed results, with no SQL knowledge needed. Runs entirely on local models through Ollama, so no data leaves the machine.",
    architecture: [
      "SQLAlchemy's inspector extracts every table and column from the database",
      "Schema + question go into a LangChain prompt; a local LLM generates SQL at temperature 0",
      "Reasoning-model <think> blocks are stripped with a regex before execution",
      "The query runs on SQLite and results are shown in a Streamlit UI",
    ],
    decisions: [
      "Fully local inference (DeepSeek-R1 8B or Qwen2.5-Coder 7B) for privacy",
      "Non-reasoning coder models are much faster here than reasoning models",
      "Clear schema in the prompt to stop hallucinated column names",
    ],
    techStack: ["LangChain", "Ollama", "DeepSeek-R1", "Qwen2.5-Coder", "SQLAlchemy", "SQLite", "Streamlit", "uv"],
    links: [
      { label: "GitHub", url: "https://github.com/yadavabhishekz/ai-data-analyst" },
    ],
  },
];

// ── Skills ─────────────────────────────────────────────────────
// `icon` is a lucide-react icon name (mapped in SkillsCard.jsx)
export const SKILLS = [
  {
    category: "Computer Vision",
    icon: "ScanEye",
    skills: [
      "Object Detection", "Instance Segmentation", "Detectron2", "Mask R-CNN", "D2Go",
      "OpenCV", "Visual Embeddings", "Image Retrieval", "COCO Evaluation",
    ],
  },
  {
    category: "Research Interests",
    icon: "Microscope",
    skills: [
      "Visual Representation Learning", "Self-Supervised Learning", "One-Shot Recognition",
      "Domain Adaptation", "Local Feature Matching", "Image Retrieval",
      "Model Compression", "Image Restoration",
    ],
  },
  {
    category: "Model Optimization & Deployment",
    icon: "Gauge",
    skills: ["TorchScript", "ONNX", "FP16 Inference", "GPU Memory Optimization", "Mobile Architectures"],
  },
  {
    category: "Generative AI & LLMs",
    icon: "Sparkles",
    skills: [
      "RAG", "Multi-Agent Systems", "Tool Calling", "MCP", "Prompt Engineering",
      "LoRA Fine-Tuning", "4-bit Quantization", "LangChain", "LangGraph", "CrewAI",
      "Groq", "OpenAI", "Claude", "Gemini", "Mistral", "Llama",
    ],
  },
  {
    category: "Retrieval & Vector Stores",
    icon: "Database",
    skills: ["Pinecone", "ChromaDB", "FAISS", "Embeddings", "Semantic Search", "BM25"],
  },
  {
    category: "NLP & Speech",
    icon: "MessageSquare",
    skills: [
      "Hugging Face", "Transformers", "spaCy", "NLTK", "Zero-Shot Classification",
      "NER", "Whisper", "Sarvam AI",
    ],
  },
  {
    category: "ML & Deep Learning",
    icon: "Brain",
    skills: ["PyTorch", "TensorFlow", "Keras", "Scikit-learn", "Recommendation Systems"],
  },
  {
    category: "Data",
    icon: "BarChart3",
    skills: ["SQL", "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Power BI", "NetworkX"],
  },
  {
    category: "Engineering & Deployment",
    icon: "Rocket",
    skills: [
      "Python", "C++", "FastAPI", "React", "Streamlit", "Gradio", "Docker",
      "GitHub Actions", "AWS (EC2, S3)", "RunPod", "Firebase", "Git",
    ],
  },
];

// ── Contact ────────────────────────────────────────────────────
export const CONTACT = {
  email: "yadavabhishekz@outlook.com",
  handle: "@yadavabhishekz",
  socials: [
    { name: "GitHub", url: "https://github.com/yadavabhishekz" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/yadavabhishekz" },
    { name: "X", url: "https://x.com/yadavabhishekz" },
  ],
};

// ── Experience ─────────────────────────────────────────────────
// Current job is described in general terms only — no project specifics.
export const EXPERIENCE = [
  {
    id: "spraxa-cv",
    role: "Computer Vision Engineer",
    company: "Spraxa Solutions",
    team: "Full-time",
    duration: "September 2026 – Present",
    description:
      "Building computer vision and deep learning systems for real-world image analysis, across the full lifecycle — data, training, evaluation, error analysis, and deployment optimization.",
    highlights: [
      "Train and evaluate object detection and instance segmentation models",
      "Build embedding-based visual recognition with similarity search",
      "Optimize models for deployment: TorchScript/ONNX export, FP16 inference, GPU memory, lightweight architectures",
      "Own dataset quality: annotation processing, class balance, and leak-free validation splits",
    ],
    techStack: ["PyTorch", "Detectron2", "D2Go", "OpenCV", "ONNX", "TorchScript", "FastAPI", "Python"],
  },
  {
    id: "barco-intern",
    role: "AI Intern",
    company: "Barco Electronic Systems Pvt Ltd",
    team: "Product Security Team",
    location: "Noida, India",
    duration: "June 2025 – August 2025",
    description:
      "Built an AI-powered threat modeling platform for the Product Security team, replacing slow, manual architecture reviews with LLM-driven analysis based on the STRIDE methodology.",
    highlights: [
      "Reduced security assessment time by 70% and identified 85%+ of vulnerabilities automatically",
      "Integrated 4 LLM APIs (OpenAI, Claude, Gemini, Mistral), generating 50+ threat models and attack trees weekly",
      "Built threat identification pipelines and automatic attack tree generation",
      "Shipped a Dockerized Streamlit tool producing downloadable Markdown/PDF security reports",
    ],
    techStack: ["OpenAI", "Claude", "Gemini", "Mistral", "STRIDE", "Streamlit", "Docker", "Python"],
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

// ── How this site works ────────────────────────────────────────
export const SITE_INFO = {
  pipeline: [
    { title: "Your message", detail: "React sends it with the chat history" },
    { title: "Retrieve", detail: "BM25 over my project write-ups, expanded to full documents" },
    { title: "Route", detail: "The LLM picks a card via tool calling (one tool takes a project_id)" },
    { title: "Ground", detail: "The tool result carries the card's source document" },
    { title: "Stream", detail: "A tool-free reply call streams token by token" },
  ],
  decisions: [
    "Cards are static React components — the LLM chooses what to show but never writes the facts in them",
    "BM25 instead of embeddings: a local embedding model measured ~500 MB extra RAM, too much for a 512 MB free tier",
    "Small-to-big retrieval: match on small chunks, send the whole parent document, so differently-worded questions still get every fact",
    "Real tool calling for routing (with a typed enum to pick a single project); the reply call gets no tools, so it can only write text",
  ],
  stack: ["React", "Vite", "Tailwind CSS", "FastAPI", "LangChain", "Groq", "gpt-oss-120b", "BM25", "Streaming"],
  repo: "https://github.com/yadavabhishekz/Portfolio-Website",
};

// ── Quick Questions (for the pill buttons) ─────────────────────
// `icon` is a lucide-react icon name (mapped in QuickQuestions.jsx).
// Optional `chatOnly: true` hides a pill on the home screen (shown once chatting).
export const QUICK_QUESTIONS = [
  { label: "Me", question: "Tell me about yourself", icon: "Smile" },
  { label: "Projects", question: "Show me your projects", icon: "Briefcase" },
  { label: "Skills", question: "What are your skills?", icon: "Layers" },
  { label: "Experience", question: "Tell me about your work experience", icon: "Building2" },
  { label: "Contact", question: "How can I contact you?", icon: "Users" },
];

// ── More prompts (the "⋯" sheet) ───────────────────────────────
// Every question here must be answerable from backend/knowledge/*.md.
// The first prompt in each section is highlighted; the resume is pinned above all sections. `icon` is a lucide-react
// icon name (mapped in MorePromptsSheet.jsx).
export const PROMPT_LIBRARY = [
  {
    title: "Me",
    icon: "UserRound",
    prompts: [
      "Who are you?",
      "What do you do for fun?",
      "What do you care about when building AI?",
      "How did you get started in AI?",
      "Where are you based?",
    ],
  },
  {
    title: "Professional",
    icon: "Briefcase",
    prompts: [
      "Where are you working now?",
      "What did you build at Barco?",
      "What's your educational background?",
      "Why should I hire you?",
    ],
  },
  {
    title: "Projects",
    icon: "FolderGit2",
    prompts: [
      "Show me your projects",
      "How does the multi-agent system in Budan's Brew work?",
      "How does RECAP handle Hinglish meetings?",
      "How did you fine-tune Llama 3 on limited GPU memory?",
      "Have you built anything with MCP?",
    ],
  },
  {
    title: "Skills",
    icon: "Layers",
    prompts: [
      "What are your skills?",
      "Do you work with computer vision?",
      "What research areas interest you?",
      "How do you keep up with AI research?",
      "What's your experience with RAG?",
      "Which LLMs have you worked with?",
    ],
  },
  {
    title: "This site",
    icon: "Cpu",
    prompts: [
      "How does this site work?",
      "Why BM25 instead of embeddings?",
    ],
  },
  {
    title: "Contact",
    icon: "Mail",
    prompts: ["How can I contact you?"],
  },
];
