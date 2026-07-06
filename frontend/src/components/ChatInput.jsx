/**
 * ChatInput — Editorial B&W text input with black send button.
 * Clean flat design, no glassmorphism.
 */
import { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className="
          flex items-center gap-2
          bg-white
          border-2 border-neutral-300
          rounded-full px-5 py-3
          focus-within:border-neutral-900
          transition-all duration-200
        "
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask me anything"
          disabled={disabled}
          className="
            flex-1 bg-transparent outline-none
            text-neutral-900 placeholder:text-neutral-400
            text-[15px] font-medium
            disabled:opacity-50
          "
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className={`
            p-2.5 rounded-full transition-all duration-200
            ${
              text.trim() && !disabled
                ? "bg-neutral-900 text-white hover:bg-neutral-700"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            }
          `}
          aria-label="Send message"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
}
