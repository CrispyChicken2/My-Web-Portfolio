import Lanterns from './Lanterns'

// macOS-desktop inspired ambient background: layered wallpaper gradients,
// drifting lanterns, a soft vignette, and a decorative dock.
export default function OSBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* wallpaper */}
      <div
        className="absolute -inset-[6%]"
        style={{
          background: `radial-gradient(60% 50% at 72% 18%, rgba(246,185,92,0.16), transparent 60%),
            radial-gradient(55% 45% at 20% 78%, rgba(34,211,238,0.12), transparent 62%),
            radial-gradient(40% 40% at 50% 50%, rgba(99,102,241,0.16), transparent 70%),
            linear-gradient(165deg, #0a1018 0%, #070b12 55%, #04060b 100%)`,
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 120% at 50% 45%, transparent 55%, rgba(3,5,10,0.70) 100%)',
        }}
      />

      <Lanterns />

      {/* dock */}
      <div className="absolute bottom-3.5 left-1/2 hidden -translate-x-1/2 items-end gap-3 rounded-[18px] border border-white/10 px-3.5 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl md:flex" style={{ background: 'rgba(22,24,15,0.5)' }}>
        <div className="h-11 w-11 rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,.35)]" style={{ background: 'linear-gradient(135deg,#818cf8 0 50%,#6366f1 50% 100%)' }} />
        <div className="grid h-11 w-11 place-items-center rounded-[11px] border border-white/[0.14] font-mono text-base text-cyan shadow-[0_4px_10px_rgba(0,0,0,.35)]" style={{ background: '#080d15' }}>
          &gt;_
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-[11px] font-mono text-[17px] text-[#c084fc] shadow-[0_4px_10px_rgba(0,0,0,.35)]" style={{ background: 'linear-gradient(135deg,#15324a,#0c1320)' }}>
          {'{ }'}
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,.35)]" style={{ background: 'radial-gradient(circle at 50% 50%,#14203a,#0c1320)' }}>
          <span className="relative inline-block h-[30px] w-[30px] rounded-full border-2 border-cyan">
            <span className="absolute left-1/2 top-1/2 h-[3px] w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-indigo" />
          </span>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,.35)]" style={{ background: '#0c1320' }}>
          <span className="relative inline-block h-[26px] w-[26px]">
            <span className="absolute left-[9px] top-0 h-2 w-2 rounded-full bg-[#c98f6b]" />
            <span className="absolute right-0 top-[9px] h-2 w-2 rounded-full bg-cyan" />
            <span className="absolute bottom-0 left-[9px] h-2 w-2 rounded-full bg-[#7fa0c0]" />
            <span className="absolute left-0 top-[9px] h-2 w-2 rounded-full bg-indigo" />
          </span>
        </div>
        <div className="mx-0.5 h-[38px] w-px bg-white/[0.14]" />
        <div className="grid h-11 w-11 place-items-center rounded-[11px] shadow-[0_4px_10px_rgba(0,0,0,.35)]" style={{ background: '#0c1320' }}>
          <span className="h-[22px] w-[22px] rounded-full border-[3px] border-faint shadow-[inset_0_0_0_3px_#0c1320]" />
        </div>
      </div>
    </div>
  )
}
