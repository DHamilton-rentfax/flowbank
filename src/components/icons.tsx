import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8v5" />
      <path d="M10.5 10.5c.33-1.5.33-3 0-4.5" />
      <path d="M13.5 10.5c-.33-1.5-.33-3 0-4.5" />
      <path d="M7 16c-1-1.5-1-3.5 0-5" />
      <path d="M17 16c1-1.5 1-3.5 0-5" />
      <path d="M4 22c-1.5-1.5-2-4-2-6" />
      <path d="M22 16c0-2-1-5-2-6" />
      <path d="M12 2v2" />
      <path d="M6 14c-1-1-1.5-2.5-1.5-4" />
      <path d="M18 14c1-1 1.5-2.5 1.5-4" />
      <path d="M22 2l-5 5" />
      <path d="M2 2l5 5" />
    </svg>
  );
}
