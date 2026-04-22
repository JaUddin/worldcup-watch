import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToComments, addComment, deleteComment,
  subscribeToCheckins, subscribeToVenueCounts,
  subscribeToReactions, toggleReaction,
  getUserReactions, checkIn, checkOut, getUserCheckin,
  addRsvp, removeRsvp, getUserRsvps,
  subscribeToClaimedVenues,
  subscribeToAtmosphereScores, getUserAtmosphereScore,
} from '../services/firestore'
import { BARS, TEAM_COLORS } from '../data'
import ClaimBarModal from '../components/ClaimBarModal'
import AtmosphereScore, { AtmosphereDisplay } from '../components/AtmosphereScore'
import './BarPage.css'

const REACTIONS = [
  { emoji: '🔥', label: 'Hype' },
  { emoji: '📺', label: 'Screens' },
  { emoji: '🍺', label: 'Drinks' },
  { emoji: '🎉', label: 'Atmosphere' },
  { emoji: '🍕', label: 'Food' },
]

export const nameToSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const slugToBar = (slug, bars) =>
  bars.find(b => nameToSlug(b.name) === slug)

export default function BarPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const bar = slugToBar(slug, BARS)

  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [checkins, setCheckins] = useState({})
  const [rsvpCount, setRsvpCount] = useState(0)
  const [venueReactions, setVenueReactions] = useState({})
  const [userReactions, setUserReactions] = useState([])
  const [claimedVenues, setClaimedVenues] = useState({})
  const [isGoing, setIsGoing] = useState(false)
  const [rsvpDoc, setRsvpDoc] = useState(null)
  const [userCheckedIn, setUserCheckedIn] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [reacting, setReacting] = useState(false)
  const [atmosphereScores, setAtmosphereScores] = useState({})
  const [userAtmScore, setUserAtmScore] = useState(null)

  const SITE_URL = 'https://worldcup-watch-t1s8.vercel.app'

  useEffect(() => {
    if (!bar || !user?.uid) return
    const unsubComments = subscribeToComments(bar.name, setComments)
    const unsubCheckins = subscribeToCheckins(c => setCheckins(c))
    const unsubCounts = subscribeToVenueCounts(counts => setRsvpCount(counts[bar.name] || 0))
    const unsubReactions = subscribeToReactions(r => setVenueReactions(r[bar.name] || {}))
    const unsubClaimed = subscribeToClaimedVenues(setClaimedVenues)
    const unsubAtm = subscribeToAtmosphereScores(s => setAtmosphereScores(s))

    getUserReactions(user.uid).then(r => setUserReactions(r[bar.name] || []))
    getUserCheckin(user.uid).then(c => setUserCheckedIn(c?.venueName === bar.name))
    getUserRsvps(user.uid).then(rsvps => {
      const found = rsvps.find(r => r.type === 'bar' && r.targetName === bar.name)
      if (found) { setIsGoing(true); setRsvpDoc(found) }
    })
    getUserAtmosphereScore(user.uid, bar.name).then(setUserAtmScore)

    return () => {
      unsubComments(); unsubCheckins(); unsubCounts()
      unsubReactions(); unsubClaimed(); unsubAtm()
    }
  }, [bar?.name, user?.uid])

  if (!bar) {
    return (
      <div className="bp-notfound">
        <div style={{ fontSize: 48 }}>🔍</div>
        <div className="bp-notfound-title">Bar not found</div>
        <button className="bp-back-btn" onClick={() => navigate('/')}>← Back to discover</button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bp-notfound">
        <div style={{ fontSize: 48 }}>⚽</div>
        <div className="bp-notfound-title">Sign in to view this bar</div>
        <button className="bp-back-btn" onClick={() => navigate('/')}>Sign in →</button>
      </div>
    )
  }

  const tc = TEAM_COLORS[bar.team] || TEAM_COLORS.Open
  const checkinsHere = checkins[bar.name] || []
  const isClaimed = !!claimedVenues[bar.name]
  const shareUrl = `${SITE_URL}/bar/${slug}`
  const atmData = atmosphereScores[bar.name]
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bar.address)}`

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `Watch the World Cup at ${bar.name}`, url: shareUrl }) }
      catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2500)
    }
  }

  const handleRsvp = async () => {
    if (isGoing && rsvpDoc) {
      await removeRsvp(rsvpDoc.id, 'bar', bar.name)
      setIsGoing(false); setRsvpDoc(null)
    } else {
      const id = await addRsvp(user.uid, 'bar', bar.name)
      setIsGoing(true)
      setRsvpDoc({ id, userId: user.uid, type: 'bar', targetName: bar.name })
    }
  }

  const handleCheckin = async () => {
    if (userCheckedIn) {
      await checkOut(user.uid, bar.name)
      setUserCheckedIn(false)
    } else {
      await checkIn(user.uid, profile?.username || user.email.split('@')[0], bar.name)
      setUserCheckedIn(true)
    }
  }

  const handleReaction = async (emoji) => {
    if (reacting) return
    setReacting(true)
    await toggleReaction(user.uid, bar.name, emoji)
    const updated = await getUserReactions(user.uid)
    setUserReactions(updated[bar.name] || [])
    setReacting(false)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    try {
      await addComment(user.uid, profile?.username || user.email.split('@')[0], bar.name, commentText.trim())
      setCommentText('')
    } catch (err) { console.error(err) }
    setPosting(false)
  }

  return (
    <div className="bp-page">

      {/* ── HEADER ── */}
      <div className="bp-header">
        <button className="bp-back" onClick={() => navigate('/')}>← Back</button>
        <div className="bp-name-row">
          <div className="bp-name">{bar.name}</div>
          {isClaimed && <span className="bp-owner-badge">✓ Owner verified</span>}
        </div>
        <div className="bp-address">{bar.address}</div>
        <div className="bp-verified">
          {isClaimed ? '🏆 Verified & claimed by owner' : '✓ Verified World Cup venue'}
        </div>
        <span className="bp-team-badge" style={{ background: tc.bg, color: tc.color }}>
          {bar.team === 'Open' ? 'All fans' : bar.team}
        </span>
      </div>

      {/* ── LIVE STATS ── */}
      <div className="bp-stats">
        <div className="bp-stat">
          <div className="bp-stat-num">{rsvpCount}</div>
          <div className="bp-stat-label">interested</div>
        </div>
        <div className="bp-stat-div" />
        <div className="bp-stat">
          <div className={`bp-stat-num ${checkinsHere.length > 0 ? 'live' : ''}`}>
            {checkinsHere.length > 0 && <span className="live-dot" />}
            {checkinsHere.length}
          </div>
          <div className="bp-stat-label">here now</div>
        </div>
        <div className="bp-stat-div" />
        <div className="bp-stat">
          <div className="bp-stat-num">{comments.length}</div>
          <div className="bp-stat-label">comments</div>
        </div>
        {atmData && (
          <>
            <div className="bp-stat-div" />
            <div className="bp-stat">
              <div className="bp-stat-num" style={{ color: '#1a3d1a' }}>{atmData.overall?.toFixed(1)}</div>
              <div className="bp-stat-label">atmosphere</div>
            </div>
          </>
        )}
      </div>

      {/* ── ACTIONS ── */}
      <div className="bp-actions">
        <button className={`bp-checkin-btn ${userCheckedIn ? 'active' : ''}`} onClick={handleCheckin}>
          {userCheckedIn ? '📍 Here now' : '📍 Check in'}
        </button>
        <a className="bp-maps-btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          🗺 Directions
        </a>
        <button className="bp-share-btn" onClick={handleShare}>
          {shareCopied ? '✓ Copied!' : '↗ Share'}
        </button>
        <button className={`bp-rsvp-btn ${isGoing ? 'going' : ''}`} onClick={handleRsvp}>
          {isGoing ? 'Interested ✓' : "I'm interested"}
        </button>
      </div>

      {/* ── REACTIONS ── */}
      <div className="bp-reactions">
        {REACTIONS.map(r => {
          const count = venueReactions[r.emoji] || 0
          const active = userReactions.includes(r.emoji)
          return (
            <button key={r.emoji} className={`bp-reaction ${active ? 'active' : ''}`} onClick={() => handleReaction(r.emoji)}>
              {r.emoji} {count > 0 && <span className="bp-reaction-count">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* ── TAGS ── */}
      <div className="bp-tags">
        {bar.tags.map(t => <span key={t} className="bp-tag">{t}</span>)}
      </div>

      {/* ── ATMOSPHERE DISPLAY ── */}
      {atmData && (
        <div className="bp-section">
          <AtmosphereDisplay scores={atmData} count={atmData.count} />
        </div>
      )}

      {/* ── RATE ATMOSPHERE (only after check in) ── */}
      {userCheckedIn && (
        <div className="bp-section">
          <AtmosphereScore
            venueName={bar.name}
            existingScore={userAtmScore}
            onSubmitted={() => getUserAtmosphereScore(user.uid, bar.name).then(setUserAtmScore)}
          />
        </div>
      )}

      {/* ── DESCRIPTION ── */}
      <div className="bp-section">
        <div className="bp-section-title">About</div>
        <div className="bp-desc">{bar.desc}</div>
        <div className="bp-review">
          <div className="bp-review-quote">"{bar.review}"</div>
          <div className="bp-review-source">— {bar.reviewSource}</div>
        </div>
      </div>

      {/* ── OWNER INFO ── */}
      {isClaimed && (
        <div className="bp-owner-info">
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <div className="bp-owner-name">Managed by {claimedVenues[bar.name]?.ownerName}</div>
            <div className="bp-owner-sub">Verified and managed by the bar owner</div>
          </div>
        </div>
      )}

      {!isClaimed && (
        <button className="bp-claim-btn" onClick={() => setShowClaimModal(true)}>
          🏷️ Is this your bar? Claim this listing →
        </button>
      )}

      {/* ── WHO'S HERE ── */}
      {checkinsHere.length > 0 && (
        <div className="bp-section">
          <div className="bp-section-title">
            <span className="live-dot" style={{ marginRight: 6 }} />Here right now
          </div>
          <div className="bp-here-names">
            {checkinsHere.map((c, i) => (
              <span key={i} className="bp-here-avatar" title={c.username}>
                {(c.username || '?').slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── COMMENTS ── */}
      <div className="bp-section">
        <div className="bp-section-title">💬 What people are saying</div>
        {comments.length === 0 && (
          <div className="bp-no-comments">No comments yet — be the first!</div>
        )}
        {comments.map(c => (
          <div key={c.id} className="bp-comment">
            <div className="bp-comment-avatar">
              {(c.username || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="bp-comment-body">
              <div className="bp-comment-header">
                <span className="bp-comment-name">{c.username}</span>
                <span className="bp-comment-time">
                  {c.createdAt?.toDate ? timeAgo(c.createdAt.toDate()) : 'just now'}
                </span>
                {c.userId === user?.uid && (
                  <button className="bp-comment-delete" onClick={() => deleteComment(c.id)}>×</button>
                )}
              </div>
              <div className="bp-comment-text">{c.text}</div>
            </div>
          </div>
        ))}
        <form className="bp-comment-form" onSubmit={handleComment}>
          <input
            className="bp-comment-input"
            type="text"
            placeholder="Share the vibe, crowd size, tips..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            maxLength={200}
          />
          <button className="bp-comment-submit" type="submit" disabled={posting || !commentText.trim()}>
            {posting ? '...' : 'Post'}
          </button>
        </form>
      </div>

      {/* ── SHARE CARD ── */}
      <div className="bp-share-card">
        <div className="bp-share-card-title">Share this bar with friends</div>
        <div className="bp-share-url">{shareUrl}</div>
        <button className="bp-share-card-btn" onClick={handleShare}>
          {shareCopied ? '✓ Copied!' : '↗ Share this bar'}
        </button>
      </div>

      {showClaimModal && (
        <ClaimBarModal venueName={bar.name} onClose={() => setShowClaimModal(false)} />
      )}
    </div>
  )
}

function timeAgo(date) {
  const s = Math.floor((new Date() - date) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
