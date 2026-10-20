import React from 'react'
import ReactDOM from 'react-dom/client'
import { LanguageProvider } from '../i18n.jsx'
import Screen from './Screen.jsx'
import '../fonts.css'
import '../index.css'
import './screen.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Screen />
    </LanguageProvider>
  </React.StrictMode>,
)
