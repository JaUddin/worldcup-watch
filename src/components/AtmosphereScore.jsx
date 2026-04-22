import { useState } from 'react'
import { submitAtmosphereScore } from '../services/firestore'
import { useAuth } from '../context/AuthContext'
import './AtmosphereScore.css'

const CATEGORIES = [
  { key: 'screens', label: '📺 Screens', desc: 'Size & quality' },
  { key: 'sound',   label: '🔊 Sound',   desc: 'Volume & clarity' },
  { key: 'crowd',   label: '🔥 Crowd',   desc: 'Energy & vibe' },
  { key: 'service', label: '🍺 Service', desc: 'Speed & friendliness' },
]

function StarRow({ value, onChange }) {
  return (
    <div className="as-stars">
      {[1,2,3,4,5].map(s => (
        <button key={s} className={`as-star ${s <= value ? 'filled' : ''}`}
          onClick={() => onChange(s)} type="button">⚽</button>
      ))}
    </div>
  )
}

export function AtmosphereDisplay({ scores, count }) {
  if (!scores || !count) return null
  return (
    <div className="as-display">
      <div className="as-display-header">
        <div className="as-display-score">{scores.overall?.toFixed(1) || '—'}</div>
        <div>
          <div className="as-display-label">Atmosphere score</div>
          <div className="as-display-count">{count} {count === 1 ? 'rating' : 'ratings'}</div>
        </div>
      </div>
      <div className="as-display-bars">
        {CATEGORIES.map(c => (
          <div key={c.key} className="as-display-row">
            <span className="as-display-cat">{c.label}</span>
            <div className="as-display-track">
              <div className="as-display-fill" style={{ width: `${((scores[c.key] || 0) / 5) * 100}%` }} />
            </div>
            <span className="as-display-num">{scores[c.key]?.toFixed(1) || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AtmosphereScore({ venueName, existingScore, onSubmitted }) {
  const { user } = useAuth()
  const [scores, setScores] = useState(existingScore || { screens: 0, sound: 0, crowd: 0, service: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(!!existingScore)

  const handleSubmit = async () => {
    if (Object.values(scores).some(v => v === 0)) return
    setSubmitting(true)
    try {
      await submitAtmosphereScore(user.uid, venueName, scores)
      setDone(true)
      onSubmitted?.()
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="as-done">
        <span>✓</span> Thanks for rating! Your score helps others find the best bars.
      </div>
    )
  }

  return (
    <div className="as-form">
      <div className="as-form-title">Rate the atmosphere</div>
      <div className="as-form-sub">Only available after you check in</div>
      {CATEGORIES.map(c => (
        <div key={c.key} className="as-row">
          <div className="as-row-left">
            <div className="as-row-label">{c.label}</div>
            <div className="as-row-desc">{c.desc}</div>
          </div>
          <StarRow value={scores[c.key]} onChange={v => setScores(s => ({ ...s, [c.key]: v }))} />
        </div>
      ))}
      <button className="as-submit" onClick={handleSubmit}
        disabled={submitting || Object.values(scores).some(v => v === 0)}>
        {submitting ? 'Submitting...' : 'Submit rating'}
      </button>
    </div>
  )
}
