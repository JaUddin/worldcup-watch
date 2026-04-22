import { useState, useEffect } from 'react'
import './Onboarding.css'

const STEPS = [
  {
    emoji: '⚽',
    title: 'Welcome to Kickoff NYC',
    sub: 'The home of World Cup 2026 watch parties across New York City. Find your bar, find your crowd.',
  },
  {
    emoji: '📍',
    title: 'Find the energy near you',
    sub: 'Browse verified NYC bars hosting watch parties. See who\'s checked in right now and where the crowd is.',
  },
  {
    emoji: '🔥',
    title: 'Check in & connect',
    sub: 'Check in when you arrive, react to the vibe, leave comments, and rate the atmosphere.',
  },
  {
    emoji: '↗',
    title: 'Share with your crew',
    sub: 'Every bar has its own link. Share it on WhatsApp or iMessage to bring your friends to the right spot.',
  },
]

const SEEN_KEY = 'kickoff_nyc_seen'

export default function Onboarding({ onComplete }) {
  const isReturning = !!localStorage.getItem(SEEN_KEY)
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleComplete = () => {
    localStorage.setItem(SEEN_KEY, '1')
    onComplete()
  }

  return (
    <div className="ob-screen">


      <div className="ob-card">
        {/* Progress bars — only show if new user */}
        {!isReturning && (
          <div className="ob-dots">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`ob-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
        )}

        <div className="ob-content">
          <div className="ob-emoji-wrap">
            <div className="ob-emoji-ring">
              <span className="ob-emoji">{current.emoji}</span>
            </div>
          </div>
          <div className="ob-title">{current.title}</div>
          <div className="ob-sub">{current.sub}</div>
        </div>

        <div className="ob-actions">
          {isReturning ? (
            /* Returning users — just one big enter button */
            <button className="ob-btn-primary" onClick={handleComplete}>
              Enter app →
            </button>
          ) : isLast ? (
            <button className="ob-btn-primary" onClick={handleComplete}>
              Let's find my bar →
            </button>
          ) : (
            <button className="ob-btn-primary" onClick={() => setStep(s => s + 1)}>
              Next →
            </button>
          )}
        </div>

        {!isReturning && (
          <div className="ob-step-label">{step + 1} of {STEPS.length}</div>
        )}
      </div>

      <div className="ob-tagline">
        MetLife Stadium · 8 matches · World Cup Final 2026
      </div>
    </div>
  )
}