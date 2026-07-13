// Vendored from dashersw/liquid-glass-js (MIT — see LICENSE in this folder).
// Upstream ships plain <script> files; the only local changes are the ESM
// import/export lines marked "ESM patch" in container.js / button.js.
// html2canvas is exposed as a global because container.js calls it unqualified.
import html2canvas from 'html2canvas'
import './glass.css'
import { Container } from './container.js'

window.html2canvas = html2canvas

export { Container }
