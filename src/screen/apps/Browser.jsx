import { useLang } from '../../i18n'
import { Glyph } from '../glyphs'
import Showcase from './Showcase'

// The Portfolio opens as the site itself, in a browser: one tab in the
// title bar, a toolbar with the address, and the site below it.

export function BrowserTabs() {
  const { t } = useLang()
  return (
    <div className="br-tabs">
      <div className="br-tab" data-active="">
        <span className="br-favicon" aria-hidden="true">
          OH
        </span>
        <span className="br-tab-title">{t.meta.title}</span>
        <span className="br-tab-close" aria-hidden="true">
          <Glyph kind="close" size={12} />
        </span>
      </div>
      <span className="br-newtab" aria-hidden="true">
        <Glyph kind="plus" size={14} />
      </span>
    </div>
  )
}

export default function Browser({ page }) {
  return (
    <div className="br">
      <div className="br-toolbar" aria-hidden="true">
        <span className="br-tool">
          <Glyph kind="back" />
        </span>
        <span className="br-tool br-tool-off">
          <Glyph kind="forward" />
        </span>
        <span className="br-tool">
          <Glyph kind="refresh" />
        </span>
        <div className="br-address">
          <Glyph kind="lock" size={13} />
          <span>
            <strong>oscar-hunaut.dev</strong>
          </span>
          <span className="br-star">
            <Glyph kind="star" size={14} />
          </span>
        </div>
        <span className="br-tool">
          <Glyph kind="more" />
        </span>
      </div>
      <div className="br-page">
        <Showcase page={page} />
      </div>
    </div>
  )
}
