import { useRef, useState, useEffect } from 'react'
import './PlayTab.css'

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isAndroid = /Android/.test(navigator.userAgent)
const isMobile = isIOS || isAndroid

export default function PlayTab() {
  const wrapRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => {
      const fsel = document.fullscreenElement || document.webkitFullscreenElement
      setIsFullscreen(!!fsel)
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const goFullscreen = async () => {
    // iOS Safari: Fullscreen API not supported — open in new tab
    // which Safari renders truly full screen automatically
    if (isIOS) {
      window.open('/game.html', '_blank')
      return
    }

    // Android Chrome + Desktop: use Fullscreen API on the wrapper div
    const el = wrapRef.current
    if (!el) return
    try {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
      else if (el.mozRequestFullScreen) await el.mozRequestFullScreen()
    } catch (e) {
      // Final fallback
      window.open('/game.html', '_blank')
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
  }

  return (
    <div className="play-tab">
      {/* Header — desktop only (hidden on mobile via CSS) */}
      <div className="play-header">
        <div>
          <div className="play-title">⚽ El Camino</div>
          <div className="play-sub">Road to Mexico 2026 — kill time before the match</div>
        </div>
        <button className="play-fullscreen-btn" onClick={isFullscreen ? exitFullscreen : goFullscreen}>
          {isFullscreen ? '✕ Exit' : '⛶ Full screen'}
        </button>
      </div>

      {/* Game frame */}
      <div className="play-frame-wrap" ref={wrapRef}>
        <iframe
          src="/game.html"
          className="play-frame"
          title="El Camino"
          allowFullScreen
          allow="fullscreen"
        />

        {/* Mobile fullscreen button floats over game */}
        {isMobile && !isFullscreen && (
          <button className="play-mobile-fs-btn" onClick={goFullscreen}>
            {isIOS ? '↗ Open full screen' : '⛶ Full screen'}
          </button>
        )}
      </div>
    </div>
  )
}
