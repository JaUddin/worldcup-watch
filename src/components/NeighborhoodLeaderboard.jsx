import './NeighborhoodLeaderboard.css'

const NEIGHBORHOOD_MAP = {
  'Midtown': 'Manhattan',
  'Chelsea': 'Manhattan',
  'East Village': 'Manhattan',
  'Financial District': 'Manhattan',
  'Washington Heights': 'Manhattan',
  'Harlem': 'Manhattan',
  'Hell\'s Kitchen': 'Manhattan',
  'Williamsburg': 'Brooklyn',
  'Park Slope': 'Brooklyn',
  'Astoria': 'Queens',
  'Jackson Heights': 'Queens',
  'Flushing': 'Queens',
}

const BARS_NEIGHBORHOODS = {
  'Football Factory at Legends': 'Midtown',
  'Smithfield Hall': 'Chelsea',
  'Banter Bar': 'Williamsburg',
  'Red Lion NYC': 'East Village',
  'Olly Olly Market': 'Chelsea',
  'Monro Pub': 'Park Slope',
  'Santo Brúklin': 'Park Slope',
  'Carragher\'s Pub & Restaurant': 'Financial District',
  'Daly\'s Pub': 'Astoria',
  'Highbury Pub': 'Park Slope',
  'Bierhaus NYC': 'Midtown',
  'Tampico NYC': 'East Village',
}

export default function NeighborhoodLeaderboard({ checkins, venueCounts }) {
  // Tally activity per neighborhood
  const scores = {}

  Object.entries(BARS_NEIGHBORHOODS).forEach(([barName, hood]) => {
    if (!scores[hood]) scores[hood] = { checkins: 0, rsvps: 0, borough: NEIGHBORHOOD_MAP[hood] || '' }
    scores[hood].checkins += (checkins[barName] || []).length
    scores[hood].rsvps += venueCounts[barName] || 0
  })

  // Sort by check-ins first then RSVPs
  const ranked = Object.entries(scores)
    .map(([name, data]) => ({ name, ...data, score: data.checkins * 3 + data.rsvps }))
    .filter(n => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (ranked.length === 0) return null

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <div className="nl-wrap">
      <div className="nl-header">
        <div className="nl-title">🔥 Neighborhood leaderboard</div>
        <div className="nl-sub">Most active watch party spots right now</div>
      </div>
      {ranked.map((n, i) => (
        <div key={n.name} className="nl-row">
          <div className="nl-medal">{medals[i]}</div>
          <div className="nl-info">
            <div className="nl-name">{n.name}</div>
            <div className="nl-borough">{n.borough}</div>
          </div>
          <div className="nl-stats">
            {n.checkins > 0 && (
              <span className="nl-stat-live">
                <span className="nl-live-dot" />{n.checkins} here
              </span>
            )}
            {n.rsvps > 0 && (
              <span className="nl-stat-rsvp">{n.rsvps} interested</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
