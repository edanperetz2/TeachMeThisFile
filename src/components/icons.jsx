// A few small line icons (24×24, stroke = currentColor), inline so no icon library is needed.

function Icon({ className = 'size-5', children }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const LogoMark = ({ className = 'size-9' }) => (
  <span className={`grid shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm ${className}`}>
    <Icon className="size-[60%]">
      <path d="M4 6.5C4 5.7 4.7 5 5.5 5H10a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5z" />
      <path d="M20 6.5c0-.8-.7-1.5-1.5-1.5H14a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </Icon>
  </span>
)

export const UploadIcon = (props) => (
  <Icon {...props}>
    <path d="M12 15V4m0 0-4 4m4-4 4 4" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Icon>
)

export const ChatIcon = (props) => (
  <Icon {...props}>
    <path d="M7 18.5 3.5 20l1.2-3.6A8 8 0 1 1 7 18.5Z" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
  </Icon>
)

export const PenIcon = (props) => (
  <Icon {...props}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </Icon>
)

export const KeyIcon = (props) => (
  <Icon {...props}>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.8 12.2 8.7-8.7M16 7l2.5 2.5M14 9l2 2" />
  </Icon>
)

export const ArrowRightIcon = (props) => (
  <Icon {...props}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </Icon>
)

export const SendIcon = (props) => (
  <Icon {...props}>
    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
  </Icon>
)

export const StopIcon = (props) => (
  <Icon {...props}>
    <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" />
  </Icon>
)

export const BookIcon = (props) => (
  <Icon {...props}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
    <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" />
  </Icon>
)

export const CheckIcon = (props) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const RetryIcon = (props) => (
  <Icon {...props}>
    <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />
  </Icon>
)

export const CopyIcon = (props) => (
  <Icon {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
  </Icon>
)

export const TrophyIcon = (props) => (
  <Icon {...props}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8.5 20h7M10 17h4" />
  </Icon>
)
