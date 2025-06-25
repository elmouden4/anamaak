export function MoroccanPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 opacity-5 ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <pattern id="moroccan" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M10 0L15 5L10 10L5 5Z M0 10L5 15L0 20L-5 15Z M20 10L25 15L20 20L15 15Z M10 20L15 25L10 30L5 25Z"
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#moroccan)" />
      </svg>
    </div>
  )
}
