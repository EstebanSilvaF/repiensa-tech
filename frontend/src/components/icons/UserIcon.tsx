interface IconProps {
  readonly className?: string
}

export default function UserIcon({ className }: Readonly<IconProps>) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="9.75" r="2.75" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6.5 19c1-2.75 3.25-4.25 5.5-4.25s4.5 1.5 5.5 4.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
