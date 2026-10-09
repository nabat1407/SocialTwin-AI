export function PilotMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M17 6h-6a5 5 0 0 0 0 10h10a5 5 0 0 1 0 10h-6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="m20 6 3-3 3 3M6 26l3 3 3-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="16" r="2" fill="currentColor" />
      <circle cx="7" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}
