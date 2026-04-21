import { useState } from 'react'
import './OnboardingScreen.css'

const STEPS = [
  {
    emoji: '🏆',
    title: 'Welcome to Kickoff',
    sub: 'The best way to find World Cup 2026 watch parties across NYC — and soon every host city.',
    cta: 'Get started',
  },
  {
    emoji: '📍',
    title: 'Find your bar',
    sub: 'Browse verified NYC venues, filter by your team, and see which bars are packed right now.',
    cta: 'Next',
  },
  {
    emoji: '⚽',
    title: 'Check in & connect',
    sub: 'Let friends know where you are. React to bars, leave comments, and RSVP to matches.',
    cta: 'Next',
  },
  {
    emoji: '🔥',
    title: 'Share the energy',
    sub: 'Every bar has its own link. Share it on WhatsApp or iMessage and bring your whole crew.',
    cta: "Let's go →",
  },
]

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const next = () => {
    if (isLast) onComplete()
    else setStep(s => s + 1)
  }

  return (
    <div className="onb-screen">
      <div className="onb-skip" onClick={onComplete}>Skip</div>

      <div className="onb-content">
        <div className="onb-emoji">{current.emoji}</div>
        <div className="onb-title">{current.title}</div>
        <div className="onb-sub">{current.sub}</div>
      </div>

      <div className="onb-dots">
        {STEPS.map((_, i) => (
          <div key={i} className={`onb-dot ${i === step ? 'active' : ''}`} onClick={() => setStep(i)} />
        ))}
      </div>

      <button className="onb-btn" onClick={next}>{current.cta}</button>

      <div className="onb-footer">World Cup 2026 · NYC · All host cities coming soon</div>
    </div>
  )
}
