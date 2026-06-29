interface ImagePlaceholderIconProps {
  className?: string
}

export default function ImagePlaceholderIcon({
  className,
}: ImagePlaceholderIconProps) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="10"
        width="36"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="17" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m6 32 10-8 8 6 6-5 12 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
