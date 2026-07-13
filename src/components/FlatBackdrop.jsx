// Static gradient wash — instant first paint before the shader chunk loads,
// and the permanent fallback when WebGL is unavailable.
export default function FlatBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `radial-gradient(60% 50% at 72% 18%, rgba(115,191,196,0.16), transparent 60%),
          radial-gradient(55% 45% at 20% 78%, rgba(255,129,10,0.1), transparent 62%),
          linear-gradient(165deg, var(--wall-1) 0%, var(--wall-2) 55%, var(--wall-3) 100%)`,
      }}
    />
  )
}
