/**
 * App.jsx — Main application component.
 *
 * Two states:
 * 1. Landing (no messages): Big display heading + input + quick questions
 * 2. Chat (after first message): Card + AI reply + quick questions + input
 *
 * B&W editorial theme with Bebas Neue headings.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Info } from "lucide-react";

import AboutCard from "./components/AboutCard";
import ProjectsCard from "./components/ProjectsCard";
import ProjectDetailCard from "./components/ProjectDetailCard";
import HowItWorksCard from "./components/HowItWorksCard";
import SkillsCard from "./components/SkillsCard";
import ContactCard from "./components/ContactCard";
import ExperienceCard from "./components/ExperienceCard";
import ResumeCard from "./components/ResumeCard";
import QuickQuestions from "./components/QuickQuestions";
import ChatInput from "./components/ChatInput";
import HelpModal from "./components/HelpModal";

// ── Rate Limiting (client-side) ─────────────────────────────
// Typed messages per browser per day. Quick-question pills are served from the
// server's cache, cost nothing, and are never limited. The real protection is
// the server-side per-IP limit; this just gives instant feedback.
const MESSAGE_LIMIT = 25;
const STORAGE_KEY = "portfolio_msg_count";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// localStorage can throw (private mode, blocked storage) — fail open
function getClientCount() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved?.day === today() ? saved.count : 0;
  } catch {
    return 0;
  }
}

function incrementClientCount() {
  const count = getClientCount() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ day: today(), count }));
  } catch {
    // ignore
  }
  return count;
}

function hasReachedClientLimit() {
  return getClientCount() >= MESSAGE_LIMIT;
}

// ── Tool name → card component mapping ──────────────────────
const CARD_MAP = {
  getPresentation: AboutCard,
  getProjects: ProjectsCard,
  getProject: ProjectDetailCard,
  getSkills: SkillsCard,
  getContact: ContactCard,
  getExperience: ExperienceCard,
  getResume: ResumeCard,
  getHowItWorks: HowItWorksCard,
};

// ── Tool name → pill label mapping (for active state) ────────
const TOOL_TO_LABEL = {
  getPresentation: "Me",
  getProjects: "Projects",
  getProject: "Projects",
  getSkills: "Skills",
  getContact: "Contact",
  getExperience: "Experience",
};

const HOW_IT_WORKS_QUESTION = "How does this site work?";

// Every answer "thinks" for at least this long, so instant (cached) replies
// still read as a conversation: question bubble -> dots -> answer.
const MIN_THINKING_MS = 1000;

// Resolves after `ms`; rejects with AbortError if the request is stopped first
function waitAtLeast(ms, signal) {
  return new Promise((resolve, reject) => {
    if (ms <= 0) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

// Parse a JSON response header, tolerating absence or malformed values
function parseJsonHeader(res, name, fallback) {
  try {
    return JSON.parse(res.headers.get(name) || "") ?? fallback;
  } catch {
    return fallback;
  }
}

// Markdown links in replies open in a new tab
const MARKDOWN_COMPONENTS = {
  a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
};

// ── Typing indicator ────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-3">
      <div className="typing-dot w-2 h-2 rounded-full bg-neutral-900" />
      <div className="typing-dot w-2 h-2 rounded-full bg-neutral-900" />
      <div className="typing-dot w-2 h-2 rounded-full bg-neutral-900" />
    </div>
  );
}

// ── Footer ("How this site works" link) ─────────────────────
function SiteFooter({ onHowItWorks, disabled, className = "" }) {
  return (
    <footer className={`text-center text-xs uppercase tracking-widest font-medium ${className}`}>
      <button
        onClick={onHowItWorks}
        disabled={disabled}
        className="group inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest font-semibold disabled:opacity-40"
      >
        How this site works
        <ArrowRight size={12} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </footer>
  );
}

// ── Main App ────────────────────────────────────────────────
export default function App() {
  const [reply, setReply] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [toolArgs, setToolArgs] = useState({});
  const [activeLabel, setActiveLabel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(hasReachedClientLimit());
  const [hasInteracted, setHasInteracted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  // The question just asked, shown as a chat bubble until the answer arrives
  const [pendingQuestion, setPendingQuestion] = useState(null);

  const replyRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll reply area into view when content changes
  useEffect(() => {
    if (replyRef.current && (reply || activeCard)) {
      replyRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [reply, activeCard]);

  // ── Back to the home screen (fresh conversation) ──────────
  const resetToHome = useCallback(() => {
    abortRef.current?.abort();
    setHasInteracted(false);
    setReply("");
    setActiveCard(null);
    setToolArgs({});
    setActiveLabel(null);
    setError(null);
    setHistory([]);
    setPendingQuestion(null);
    window.scrollTo(0, 0);
  }, []);

  // Entering the chat pushes a browser history entry, so the Back button
  // (and the Home button, via history.back) returns to the home screen.
  useEffect(() => {
    function onPopState(e) {
      if (!e.state?.chat) resetToHome();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [resetToHome]);

  function goHome() {
    if (window.history.state?.chat) {
      window.history.back(); // triggers popstate -> resetToHome
    } else {
      resetToHome();
    }
  }

  // ── Send message handler ──────────────────────────────────
  async function sendMessage(text, label) {
    // Client-side rate limit check (typed messages only — pills are cached and free)
    if (!label && hasReachedClientLimit()) {
      setLimitReached(true);
      return;
    }

    setIsLoading(true);
    setReply("");
    setActiveCard(null);
    setToolArgs({});
    setActiveLabel(label || null);
    setError(null);
    setPendingQuestion(text);
    if (!hasInteracted) {
      window.history.pushState({ chat: true }, "");
      setHasInteracted(true);
    }

    const controller = new AbortController();
    abortRef.current = controller;
    let fullText = "";
    let shownCard = null;
    const startedAt = Date.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pill clicks (they have a label) are answered without history, so the server can cache them
        body: JSON.stringify({ message: text, history, quick: Boolean(label) }),
        signal: controller.signal,
      });

      // Keep the question + thinking dots on screen for a beat, even for instant replies
      await waitAtLeast(MIN_THINKING_MS - (Date.now() - startedAt), controller.signal);
      setPendingQuestion(null);

      // Handle rate limit (server-side 429)
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        setError(body.detail || "Too many messages right now. Please wait a bit and try again.");
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      // Read the tool name from the custom header
      const toolName = res.headers.get("X-Tool-Name") || null;
      const resolvedTool = toolName && toolName.length > 0 ? toolName : null;
      setActiveCard(resolvedTool);
      shownCard = resolvedTool;
      setToolArgs(parseJsonHeader(res, "X-Tool-Args", {}));

      // Update activeLabel from tool name
      if (resolvedTool && TOOL_TO_LABEL[resolvedTool]) {
        setActiveLabel(TOOL_TO_LABEL[resolvedTool]);
      }

      // Stream the response body
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setReply(fullText);
      }

      // Increment client-side counter (typed messages only)
      if (!label && incrementClientCount() >= MESSAGE_LIMIT) {
        setLimitReached(true);
      }

      // Update history
      setHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: fullText, card: shownCard },
      ]);
    } catch (err) {
      if (err.name === "AbortError") {
        // Stopped by the user — keep the partial reply in the conversation
        if (fullText) {
          setHistory((prev) => [
            ...prev,
            { role: "user", content: text },
            { role: "assistant", content: fullText, card: shownCard },
          ]);
        }
      } else {
        console.error("Chat error:", err);
        setError("Failed to connect. Make sure the backend is running.");
      }
    } finally {
      abortRef.current = null;
      setPendingQuestion(null);
      setIsLoading(false);
    }
  }

  function stopGenerating() {
    abortRef.current?.abort();
  }

  // ── Render active card component ──────────────────────────
  const ActiveCardComponent = activeCard ? CARD_MAP[activeCard] : null;

  // ── Permanent help button (top-right) + help modal ─────────
  const helpUi = (
    <>
      <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-40">
        <button
          onClick={() => setHelpOpen(true)}
          aria-label="About this portfolio"
          title="About this portfolio"
          className="w-10 h-10 rounded-full border-2 border-neutral-300 bg-white/90 backdrop-blur flex items-center justify-center text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
        >
          <Info size={18} strokeWidth={2.5} />
        </button>
      </div>
      <HelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onHowItWorks={() => {
          setHelpOpen(false);
          sendMessage(HOW_IT_WORKS_QUESTION, "How it works");
        }}
        onContact={() => {
          setHelpOpen(false);
          sendMessage("How can I contact you?", "Contact");
        }}
      />
    </>
  );

  // ── Landing state ─────────────────────────────────────────
  if (!hasInteracted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {helpUi}

        {/* Hero heading */}
        <header className="text-center mb-10 animate-slide-up">
          <p className="text-neutral-500 text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight mb-3 sm:mb-4">
            Hey, I&apos;m <span className="text-neutral-900 font-bold">Abhishek</span> 👋
          </p>
          <h1 className="heading-display text-7xl sm:text-8xl md:text-9xl text-neutral-900">
            AI
          </h1>
          <h1 className="heading-display text-7xl sm:text-8xl md:text-9xl text-neutral-900 -mt-2">
            Engineer
          </h1>
          <p className="text-neutral-400 text-sm mt-4 max-w-md mx-auto tracking-wide uppercase font-medium">
            Open to collaborations in AI, automation, and intelligent systems
          </p>
        </header>

        {/* Input */}
        <div className="w-full max-w-[52rem] mb-6 animate-slide-up px-8" style={{ animationDelay: "0.1s" }}>
          <ChatInput
            onSend={(text) => sendMessage(text)}
            disabled={isLoading || limitReached}
            isStreaming={isLoading}
            onStop={stopGenerating}
          />
        </div>

        {/* Quick questions */}
        <div className="w-full max-w-[52rem] animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <QuickQuestions onSend={(q, label) => sendMessage(q, label)} disabled={isLoading} />
        </div>
      </div>
    );
  }

  // ── Chat state ────────────────────────────────────────────
  return (
    // pt-16 on phones keeps the centered name clear of the fixed top-right buttons
    <div className="min-h-screen flex flex-col items-center px-4 pt-16 pb-8 sm:py-12">
      {/* ── Compact header ─────────────────────────────────── */}
      {helpUi}

      {/* Clicking the name returns to the home screen (so does the browser's Back button) */}
      <header className="text-center mb-8 animate-fade-in">
        <button
          onClick={goHome}
          className="group"
          title="Back to home"
          aria-label="Abhishek Yadav — back to home"
        >
          <h1 className="heading-display text-3xl sm:text-4xl text-neutral-900 tracking-wide group-hover:text-neutral-600 transition-colors">
            Abhishek Yadav
          </h1>
        </button>
        <p className="label-editorial mt-1">AI Engineer · Computer Vision & Generative AI</p>
      </header>

      {/* ── Main content area ─────────────────────────────── */}
      <main className="w-full max-w-3xl space-y-6 flex-1">
        {/* The question being answered (hidden once the answer arrives) */}
        {pendingQuestion && (
          <div className="flex justify-end animate-fade-in-up">
            <p className="max-w-[85%] bg-neutral-900 text-white text-[15px] leading-relaxed px-4 py-2.5 rounded-2xl rounded-br-md break-words">
              {pendingQuestion}
            </p>
          </div>
        )}

        {/* Active card */}
        {ActiveCardComponent && (
          <div ref={replyRef}>
            <ActiveCardComponent toolArgs={toolArgs} />
          </div>
        )}

        {/* AI reply / typing indicator */}
        {(isLoading || reply) && (
          <div className="animate-fade-in-up">
            {isLoading && !reply ? (
              <TypingIndicator />
            ) : (
              <div className="prose-ai">
                <ReactMarkdown components={MARKDOWN_COMPONENTS}>{reply}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-neutral-900 text-neutral-900 text-sm font-medium">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Rate limit message */}
        {limitReached && !error && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-neutral-300 text-neutral-500 text-sm font-medium">
              <span>☕</span>
              <span>
                You&apos;ve reached today&apos;s message limit — the quick questions still work. Thanks for chatting!
              </span>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom controls (sticky) ──────────────────────── */}
      <div className="w-full max-w-[52rem] mt-8 sticky bottom-0 space-y-4 pb-4 pt-6" style={{ background: "linear-gradient(to bottom, transparent 0%, white 20%)" }}>
        {/* Quick questions */}
        <QuickQuestions
          onSend={(q, label) => sendMessage(q, label)}
          disabled={isLoading}
          activeLabel={activeLabel}
          inChat
        />

        {/* Chat input */}
        <div className="px-8">
          <ChatInput
            onSend={(text) => sendMessage(text)}
            disabled={isLoading || limitReached}
            isStreaming={isLoading}
            onStop={stopGenerating}
          />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <SiteFooter
        className="mt-10"
        onHowItWorks={() => sendMessage(HOW_IT_WORKS_QUESTION, "How it works")}
        disabled={isLoading}
      />
    </div>
  );
}
