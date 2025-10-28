import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3v18" />
      <path d="M3 7h18" />
      <path d="M5 7a5 5 0 0 1 5 5v2" />
      <path d="M14 12v-2a5 5 0 0 1 5-5" />
      <path d="M7 14h10" />
      <path d="M5 18h14" />
    </svg>
  );
}
