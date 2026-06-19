/** Logo da UseFin (óculos redondos). A cor segue o currentColor do pai. */
export function UseFinLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-3 -3 126 54"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="34" cy="24" r="20" />
      <circle cx="86" cy="24" r="20" />
      <path d="M52 22 C57 31 63 31 68 22" />
      <path d="M14 22 C8 19 4 25 9 28" />
      <path d="M106 22 C112 19 116 25 111 28" />
    </svg>
  );
}
