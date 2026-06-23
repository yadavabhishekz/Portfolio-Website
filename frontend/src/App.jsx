/**
 * App.jsx — Main application component.
 *
 * Two states:
 * 1. Landing (no messages): Big display heading + input + quick questions
 * 2. Chat (after first message): Card + AI reply + quick questions + input
 *
 * B&W editorial theme with Bebas Neue headings.
 */
import { useState, useEffect, useRef } from "react";

import AboutCard from "./components/AboutCard";
import ProjectsCard from "./components/ProjectsCard";
import SkillsCard from "./components/SkillsCard";
import ContactCard from "./components/ContactCard";
import ExperienceCard from "./components/ExperienceCard";
import ResumeCard from "./components/ResumeCard";
import QuickQuestions from "./components/QuickQuestions";
import ChatInput from "./components/ChatInput";

// ── Rate Limiting (client-side) ─────────────────────────────
const MESSAGE_LIMIT = Infinity; // TODO: restore to 15 before deploying
const STORAGE_KEY = "portfolio_msg_count";

function getClientCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
}

function incrementClientCount() {
  const count = getClientCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(count));
  return count;
}

function hasReachedClientLimit() {
  return getClientCount() >= MESSAGE_LIMIT;
}

// ── Tool name → card component mapping ──────────────────────
const CARD_MAP = {
  getPresentation: AboutCard,
  getProjects: ProjectsCard,
  getSkills: SkillsCard,
  getContact: ContactCard,
  getExperience: ExperienceCard,
  getResume: ResumeCard,
};

// ── Pill label → tool name mapping (for active state) ────────
const LABEL_TO_TOOL = {
  Me: "getPresentation",
  Projects: "getProjects",
  Skills: "getSkills",
  Contact: "getContact",
  Experience: "getExperience",
  Resume: "getResume",
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

// ── Main App ────────────────────────────────────────────────
export default function App() {
  const [reply, setReply] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [activeLabel, setActiveLabel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(hasReachedClientLimit());
  const [hasInteracted, setHasInteracted] = useState(false);

  const replyRef = useRef(null);

  // Auto-scroll reply area into view when content changes
  useEffect(() => {
    if (replyRef.current && (reply || activeCard)) {
      replyRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [reply, activeCard]);

  // ── Send message handler ──────────────────────────────────
  async function sendMessage(text, label) {
    // Client-side rate limit check
    if (hasReachedClientLimit()) {
      setLimitReached(true);
      return;
    }

    setIsLoading(true);
    setReply("");
    setActiveCard(null);
    setActiveLabel(label || null);
    setError(null);
    setHasInteracted(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      // Handle rate limit (server-side 429)
      if (res.status === 429) {
        setError("You've sent too many messages. Please wait a bit and try again.");
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

      // Update activeLabel from tool name
      if (resolvedTool) {
        const matchedLabel = Object.entries(LABEL_TO_TOOL).find(
          ([, tool]) => tool === resolvedTool
        );
        if (matchedLabel) setActiveLabel(matchedLabel[0]);
      }

      // Stream the response body
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setReply(fullText);
      }

      // Increment client-side counter
      const newCount = incrementClientCount();
      if (newCount >= MESSAGE_LIMIT) {
        setLimitReached(true);
      }

      // Update history
      setHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: fullText },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Failed to connect. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render active card component ──────────────────────────
  const ActiveCardComponent = activeCard ? CARD_MAP[activeCard] : null;

  // ── Landing state ─────────────────────────────────────────
  if (!hasInteracted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Hero heading */}
        <header className="text-center mb-10 animate-slide-up">
          <p className="text-neutral-500 text-base font-medium tracking-wide mb-2">
            Hey, I'm <span className="text-neutral-900 font-semibold">Ashok</span> 👋
          </p>
          <h1 className="heading-display text-7xl sm:text-8xl md:text-9xl text-neutral-900">
            AI/ML
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
          <ChatInput onSend={(text) => sendMessage(text)} disabled={isLoading || limitReached} />
        </div>

        {/* Quick questions */}
        <div className="w-full max-w-[52rem] animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <QuickQuestions onSend={(q, label) => sendMessage(q, label)} disabled={isLoading || limitReached} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-neutral-300 uppercase tracking-widest font-medium">
          Built with React • FastAPI • LangChain
        </footer>
      </div>
    );
  }

  // ── Chat state ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
      {/* ── Compact header ─────────────────────────────────── */}
      <header className="text-center mb-8 animate-fade-in">
        <h1 className="heading-display text-3xl sm:text-4xl text-neutral-900 tracking-wide">
          Ashok Yadav
        </h1>
        <p className="label-editorial mt-1">AI/ML Engineer & Full-Stack Developer</p>
      </header>

      {/* ── Main content area ─────────────────────────────── */}
      <main className="w-full max-w-3xl space-y-6 flex-1">
        {/* Active card */}
        {ActiveCardComponent && (
          <div ref={replyRef}>
            <ActiveCardComponent />
          </div>
        )}

        {/* AI reply / typing indicator */}
        {(isLoading || reply) && (
          <div className="animate-fade-in-up">
            {isLoading && !reply ? (
              <TypingIndicator />
            ) : (
              <p className="prose-ai whitespace-pre-wrap">
                {reply}
              </p>
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
                You've reached your message limit for this session. Thanks for chatting!
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
          disabled={isLoading || limitReached}
          activeLabel={activeLabel}
        />

        {/* Chat input */}
        <div className="px-8">
          <ChatInput onSend={(text) => sendMessage(text)} disabled={isLoading || limitReached} />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mt-10 text-center text-xs text-neutral-300 uppercase tracking-widest font-medium">
        Built with React • FastAPI • LangChain
      </footer>
    </div>
  );
}
