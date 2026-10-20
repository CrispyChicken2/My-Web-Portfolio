import { useState } from 'react'
import { useLang } from '../i18n'

// The account picture: the About photograph, cropped round; the initials
// on the accent if the photograph is missing.
export default function Avatar({ size = 32 }) {
  const { t } = useLang()
  const [failed, setFailed] = useState(false)
  const initials = t.profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className="os-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {failed ? (
        initials
      ) : (
        <img src="/assets/profile.webp" alt="" onError={() => setFailed(true)} />
      )}
    </span>
  )
}
