/**
 * useModal — while `open`, lock page scroll and close on Escape.
 * Shared by the project modal, help modal, and prompts sheet.
 */
import { useEffect, useRef } from "react";

export default function useModal(open, onClose) {
  // Keep the latest onClose without re-running the effect on every render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
}
