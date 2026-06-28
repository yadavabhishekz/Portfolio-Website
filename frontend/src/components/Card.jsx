/**
 * Card.jsx — Editorial card wrapper.
 * White background with black border, clean edges.
 */
export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white rounded-xl p-6 sm:p-8
        border-2 border-neutral-900
        animate-fade-in-up
        ${className}
      `}
    >
      {children}
    </div>
  );
}
