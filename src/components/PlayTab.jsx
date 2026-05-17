// src/components/PlayTab.jsx
// Replace your inline play tab JSX with this component
// Import it in App.jsx: import PlayTab from './components/PlayTab'

import { useRef, useState, useEffect } from 'react'
import './PlayTab.css'

export default function PlayTab() {
  const iframeRef = useRef(null)
  const wrapRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  useEffect(() => {
    const onFsChange = () => {
      const fsel = document.fullscreenElement || document.webkitFullscreenElement
      setIsFullscreen(!!fsel)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
    }
  }, [])

  const goFullscreen = async () => {
    const el = wrapRef.current
    if (!el) return
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
    } catch (e) {
      // iOS Safari fallback — open game in new tab
      window.open('/game.html', '_blank')
    }
  }

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen()
    } catch (e) {}
  }

  return (
    <div className="play-tab">
      {/* Header — desktop only via CSS */}
      <div className="play-header">
        <div>
          <div className="play-title">⚽ El Camino</div>
          <div className="play-sub">Road to Mexico 2026 — kill time before the match</div>
        </div>
        <button className="play-fullscreen-btn" onClick={isFullscreen ? exitFullscreen : goFullscreen}>
          {isFullscreen ? '✕ Exit' : '⛶ Full screen'}
        </button>
      </div>

      {/* Game wrapper */}
      <div className="play-frame-wrap" ref={wrapRef}>
        <iframe
          ref={iframeRef}
          src="/game.html"
          className="play-frame"
          title="El Camino"
          allowFullScreen
          allow="fullscreen"
        />

        {/* Mobile fullscreen button — floats over the game */}
        {isMobile && !isFullscreen && (
          <button className="play-mobile-fs-btn" onClick={goFullscreen}>
            ⛶ Full screen
          </button>
        )}
      </div>
    </div>
  )
}
