// The designed flat Backdrop: the instant first paint before the Field's chunk
// arrives, and the permanent stand-in when WebGL is unavailable. It is a
// deliberate composition in the same cold scale, not an empty page.
export default function FlatBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `radial-gradient(58% 46% at 70% 16%, var(--flat-1), transparent 62%),
          radial-gradient(52% 42% at 18% 76%, var(--flat-2), transparent 64%),
          radial-gradient(120% 100% at 50% 40%, transparent 52%, var(--flat-vignette) 100%),
          linear-gradient(168deg, var(--wall-1) 0%, var(--wall-2) 56%, var(--wall-3) 100%)`,
      }}
    />
  )
}
