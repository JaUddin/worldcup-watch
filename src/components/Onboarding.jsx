import { useState } from 'react'
import './Onboarding.css'

const STEPS = [
  {
    emoji: '🏆',
    title: 'Welcome to Kickoff NYC',
    sub: 'The home of World Cup 2026 watch parties in New York City. Find your crowd, find your bar.',
    color: '#1a3d1a',
    bg: '#1a3d1a',
  },
  {
    emoji: '📍',
    title: 'Find bars near you',
    sub: 'Browse verified NYC bars hosting watch parties. Filter by team, neighborhood, or vibe.',
    color: '#1565c0',
    bg: '#1a3d1a',
  },
  {
    emoji: '⚽',
    title: 'Check in & connect',
    sub: 'Tell the crowd you\'re here. Check in when you arrive, leave comments, react to the vibe.',
    color: '#e65100',
    bg: '#1a3d1a',
  },
  {
    emoji: '↗',
    title: 'Share with your crew',
    sub: 'Every bar has its own link. Share it on WhatsApp, iMessage, or Instagram to fill the place up.',
    color: '#c8a415',
    bg: '#1a3d1a',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="ob-screen">
      <div className="ob-card">
        {/* Progress dots */}
        <div className="ob-dots">
          {STEPS.map((_, i) => (
            <div key={i} className={`ob-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>

        {/* Content */}
        <div className="ob-content">
          <div className="ob-emoji-wrap">
            <div className="ob-emoji-ring">
              <span className="ob-emoji">{current.emoji}</span>
            </div>
          </div>
          <div className="ob-title">{current.title}</div>
          <div className="ob-sub">{current.sub}</div>
        </div>

        {/* Actions */}
        <div className="ob-actions">
          {isLast ? (
            <button className="ob-btn-primary" onClick={onComplete}>
              Let's go! →
            </button>
          ) : (
            <>
              <button className="ob-btn-primary" onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
              <button className="ob-btn-skip" onClick={onComplete}>
                Skip
              </button>
            </>
          )}
        </div>

        {/* Step indicator */}
        <div className="ob-step-label">{step + 1} of {STEPS.length}</div>
      </div>
    </div>
  )
}
