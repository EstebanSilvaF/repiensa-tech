import type { SVGProps } from 'react'

interface HeartIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean
}

export default function HeartIcon({ filled = false, ...props }: HeartIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.8 7.5c0-2.8-2.2-5-5-5-1.5 0-2.9.7-3.8 1.9A5.63 5.63 0 0 0 8.2 2.5c-2.8 0-5 2.2-5 5 0 4.2 4.5 7.6 10.1 12.2L12 21.5l1.7-1.8c5.6-4.6 10.1-8 10.1-12.2Z" />
    </svg>
  )
}
