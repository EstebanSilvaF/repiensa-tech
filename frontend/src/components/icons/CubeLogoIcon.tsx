interface CubeLogoIconProps {
  className?: string
}

export default function CubeLogoIcon({ className }: CubeLogoIconProps) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 4 26 10v12L16 28 6 22V10L16 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 4v12M16 16 26 10M16 16 6 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M6 22l10-6 10 6" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
