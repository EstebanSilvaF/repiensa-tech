interface IconProps {
  readonly className?: string
}

export default function LogOutIcon({ className }: Readonly<IconProps>) {
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
        d="M9.5 5.5H6.75A1.25 1.25 0 0 0 5.5 6.75v10.5A1.25 1.25 0 0 0 6.75 18.5H9.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 12h7M17.75 8.75 21.5 12l-3.75 3.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
