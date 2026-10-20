import React from 'react'
import ReactDOM from 'react-dom/client'
import { LanguageProvider } from '../i18n.jsx'
import RoomApp from './ui/RoomApp.jsx'
import '../fonts.css'
import '../index.css'
import './ui/room.css'

// The Room is a desktop experience. A phone, or a browser without WebGL,
// gets the plain version of the site instead — every word of it, nothing
// to learn. `?room` forces the Room anyway.
function webglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

const params = new URLSearchParams(window.location.search)
const fits = window.innerWidth >= 820 && window.innerHeight >= 480

if (!params.has('room') && (!fits || !webglAvailable())) {
  window.location.replace('/classic.html')
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <LanguageProvider>
        <RoomApp autostart={params.has('skip')} />
      </LanguageProvider>
    </React.StrictMode>,
  )
}
