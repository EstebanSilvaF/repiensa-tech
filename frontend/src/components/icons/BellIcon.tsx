interface IconProps {
  readonly className?: string
}

export default function BellIcon({ className }: Readonly<IconProps>) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.75 18.25h4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M6.75 9.75a5.25 5.25 0 0 1 10.5 0c0 4.25 1.75 5.75 1.75 5.75H5s1.75-1.5 1.75-5.75Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}
