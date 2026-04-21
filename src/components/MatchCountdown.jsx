import { useState, useEffect } from 'react'
import './MatchCountdown.css'

// World Cup 2026 key matches — dates in UTC
const MATCHES = [
  { teams: 'Argentina vs France', date: new Date('2026-06-14T19:00:00Z'), venue: 'MetLife Stadium' },
  { teams: 'Brazil vs Morocco',   date: new Date('2026-06-14T22:00:00Z'), venue: 'SoFi Stadium' },
  { teams: 'Colombia vs England', date: new Date('2026-06-15T19:00:00Z'), venue: 'MetLife Stadium' },
  { teams: 'USA vs Honduras',     date: new Date('2026-06-15T22:00:00Z'), venue: 'MetLife Stadium' },
  { teams: 'Mexico vs Ecuador',   date: new Date('2026-06-16T16:00:00Z'), venue: 'SoFi Stadium' },
  { teams: 'USA vs Mexico',       date: new Date('2026-06-16T22:00:00Z'), venue: 'Rose Bowl' },
  { teams: 'Portugal vs Spain',   date: new Date('2026-06-16T19:00:00Z'), venue: 'MetLife Stadium' },
  { teams: 'Argentina vs Canada', date: new Date('2026-06-17T16:00:00Z'), venue: 'TBD' },
  { teams: 'England vs Slovenia', date: new Date('2026-06-17T19:00:00Z'), venue: 'TBD' },
  { teams: 'World Cup Final',     date: new Date('2026-07-19T19:00:00Z'), venue: 'MetLife Stadium' },
]

function getNextMatch() {
  const now = new Date()
  return MATCHES.find(m => m.date > now) || MATCHES[MATCHES.length - 1]
}

function getTimeLeft(targetDate) {
  const diff = targetDate - new Date()
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, live: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, mins, secs, live: false }
}

export default function MatchCountdown() {
  const [match] = useState(getNextMatch)
  const [time, setTime] = useState(() => getTimeLeft(match.date))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeLeft(match.date))
    }, 1000)
    return () => clearInterval(timer)
  }, [match.date])

  if (time.live) {
    return (
      <div className="mc-wrap mc-live">
        <div className="mc-live-badge">
          <span className="mc-live-dot" /> LIVE NOW
        </div>
        <div className="mc-match-name">{match.teams}</div>
        <div className="mc-venue">{match.venue}</div>
      </div>
    )
  }

  return (
    <div className="mc-wrap">
      <div className="mc-label">Next match</div>
      <div className="mc-match-name">{match.teams}</div>
      <div className="mc-venue">⚽ {match.venue}</div>
      <div className="mc-timer">
        <div className="mc-unit">
          <div className="mc-num">{String(time.days).padStart(2, '0')}</div>
          <div className="mc-unit-label">days</div>
        </div>
        <div className="mc-sep">:</div>
        <div className="mc-unit">
          <div className="mc-num">{String(time.hours).padStart(2, '0')}</div>
          <div className="mc-unit-label">hrs</div>
        </div>
        <div className="mc-sep">:</div>
        <div className="mc-unit">
          <div className="mc-num">{String(time.mins).padStart(2, '0')}</div>
          <div className="mc-unit-label">min</div>
        </div>
        <div className="mc-sep">:</div>
        <div className="mc-unit">
          <div className="mc-num">{String(time.secs).padStart(2, '0')}</div>
          <div className="mc-unit-label">sec</div>
        </div>
      </div>
    </div>
  )
}
