import { AppIcon, Glyph } from '../glyphs'

// The Recycle Bin, empty — nothing on this desk was thrown away.
export default function RecycleBin({ ui }) {
  return (
    <div className="rb">
      <div className="rb-address" aria-hidden="true">
        <Glyph kind="back" size={14} />
        <Glyph kind="forward" size={14} />
        <span className="rb-crumbs">
          <AppIcon app="recycle" size={16} />
          <span>›</span>
          {ui.apps.recycle}
        </span>
      </div>
      <div className="rb-body">
        <p>{ui.recycle.empty}</p>
      </div>
      <div className="rb-status">{ui.recycle.items}</div>
    </div>
  )
}
