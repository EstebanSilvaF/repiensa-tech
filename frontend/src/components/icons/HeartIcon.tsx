import type { SVGProps } from 'react'

interface HeartIconProps extends SVGProps<SVGSVGElement> {
  readonly filled?: boolean
}

export default function HeartIcon({ filled = false, ...props }: Readonly<HeartIconProps>) {
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
      <path d="M12 20.25s-7.5-4.5-7.5-10.5a4.5 4.5 0 0 1 7.5-3 4.5 4.5 0 0 1 7.5 3c0 6-7.5 10.5-7.5 10.5Z" />
    </svg>
  )
}
