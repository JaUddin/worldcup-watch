import './TrendingNow.css'
import { nameToSlug } from '../pages/BarPage'

export default function TrendingNow({ bars, checkins, venueCounts, venueReactions, onNavigate }) {
  // Score each bar: checkins * 5 + rsvps * 2 + reactions
  const scored = bars.map(b => {
    const c = (checkins[b.name] || []).length
    const r = venueCounts[b.name] || 0
    const rx = Object.values(venueReactions[b.name] || {}).reduce((s, v) => s + v, 0)
    return { ...b, score: c * 5 + r * 2 + rx, checkins: c, rsvps: r }
  }).filter(b => b.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)

  if (scored.length === 0) return null

  return (
    <div className="tn-wrap">
      <div className="tn-header">
        <div className="tn-title">⚡ Trending now</div>
        <div className="tn-sub">Most activity in the last hour</div>
      </div>
      <div className="tn-list">
        {scored.map((b, i) => (
          <div key={b.name} className="tn-item" onClick={() => onNavigate(`/bar/${nameToSlug(b.name)}`)}>
            <div className="tn-rank">{i + 1}</div>
            <div className="tn-info">
              <div className="tn-name">{b.name}</div>
              <div className="tn-meta">
                {b.checkins > 0 && <span className="tn-live"><span className="tn-dot" />{b.checkins} here now</span>}
                {b.rsvps > 0 && <span className="tn-rsvps">{b.rsvps} interested</span>}
              </div>
            </div>
            <div className="tn-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  )
}
