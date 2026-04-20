import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  addComment, deleteComment, subscribeToComments,
  toggleReaction,
} from '../services/firestore'
import './BarCard.css'

const REACTIONS = [
  { emoji: '🔥', label: 'Hype' },
  { emoji: '📺', label: 'Screens' },
  { emoji: '🍺', label: 'Drinks' },
  { emoji: '🎉', label: 'Atmosphere' },
  { emoji: '🍕', label: 'Food' },
]

export default function BarCard({
  bar, rsvpCount, checkins, isGoing,
  onToggleRsvp, onCheckIn, onCheckOut,
  venueReactions, userReactions,
}) {
  const { user, profile } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [reacting, setReacting] = useState(false)

  const checkinsHere = checkins[bar.name] || []
  const userCheckedInHere = checkinsHere.some(c => c.userId === user?.uid)
  const myReactions = userReactions[bar.name] || []
  const barReactions = venueReactions[bar.name] || {}

  useEffect(() => {
    if (!expanded) return
    const unsub = subscribeToComments(bar.name, setComments)
    return unsub
  }, [expanded, bar.name])

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    try {
      await addComment(
        user.uid,
        profile?.username || user.email.split('@')[0],
        bar.name,
        commentText.trim()
      )
      setCommentText('')
    } catch (err) { console.error(err) }
    setPosting(false)
  }

  const handleReaction = async (emoji) => {
    if (reacting) return
    setReacting(true)
    try {
      await toggleReaction(user.uid, bar.name, emoji)
    } catch (err) { console.error(err) }
    setReacting(false)
  }

  const handleShare = () => {
    const text = `I'm watching the World Cup at ${bar.name} (${bar.address})! Join me 🏆\n\nhttps://worldcup-watch-parties-nyc.vercel.app`
    if (navigator.share) {
      navigator.share({ title: 'WorldCup Watch NYC', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Copied to clipboard! Share it with your crew.')
    }
  }

  const tc = bar.teamColor || { bg: '#f3e5f5', color: '#4a148c' }
  const totalComments = comments.length

  return (
    <div className={`bar-card ${expanded ? 'expanded' : ''}`}>

      {/* ── HEADER ── */}
      <div className="bc-top" onClick={() => setExpanded(e => !e)}>
        <div className="bc-info">
          <div className="bc-name">{bar.name}</div>
          <div className="bc-address">{bar.address}</div>
          <div className="bc-verified">
            {bar.isUserEvent ? '👥 Community event' : '✓ Verified World Cup venue'}
          </div>
        </div>
        <div className="bc-right">
          <span className="bc-team-badge" style={{ background: tc.bg, color: tc.color }}>
            {bar.team === 'Open' ? 'All fans' : bar.team}
          </span>
          <span className="bc-expand-hint">{expanded ? 'tap to close ▲' : 'tap to expand ▼'}</span>
        </div>
      </div>

      {/* ── LIVE STATS ── */}
      <div className="bc-stats">
        <div className="bc-stat">
          <span className="bc-stat-num">{rsvpCount || 0}</span>
          <span className="bc-stat-label">interested</span>
        </div>
        <div className="bc-stat-divider" />
        <div className="bc-stat">
          <span className={`bc-stat-num ${checkinsHere.length > 0 ? 'live' : ''}`}>
            {checkinsHere.length > 0 && <span className="live-dot" />}
            {checkinsHere.length}
          </span>
          <span className="bc-stat-label">here now</span>
        </div>
        <div className="bc-stat-divider" />
        <div className="bc-stat">
          <span className="bc-stat-num">{totalComments || '—'}</span>
          <span className="bc-stat-label">comments</span>
        </div>
      </div>

      {/* ── REACTIONS ROW ── */}
      <div className="bc-reactions">
        {REACTIONS.map(r => {
          const count = barReactions[r.emoji] || 0
          const active = myReactions.includes(r.emoji)
          return (
            <button
              key={r.emoji}
              className={`bc-reaction ${active ? 'active' : ''}`}
              onClick={() => handleReaction(r.emoji)}
            >
              {r.emoji} {count > 0 && <span className="bc-reaction-count">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* ── TAGS ── */}
      <div className="bc-tags">
        {bar.tags.map(t => <span key={t} className="bc-tag">{t}</span>)}
      </div>

      {/* ── EXPANDED ── */}
      {expanded && (
        <div className="bc-expanded-content">
          <div className="bc-desc">{bar.desc}</div>

          <div className="bc-review">
            <div className="bc-review-quote">"{bar.review}"</div>
            <div className="bc-review-source">— {bar.reviewSource}</div>
          </div>

          {/* Who's here now */}
          {checkinsHere.length > 0 && (
            <div className="bc-here-now">
              <div className="bc-here-title">
                <span className="live-dot" /> Here right now
              </div>
              <div className="bc-here-names">
                {checkinsHere.slice(0, 6).map((c, i) => (
                  <span key={i} className="bc-here-avatar" title={c.username}>
                    {(c.username || '?').slice(0, 2).toUpperCase()}
                  </span>
                ))}
                {checkinsHere.length > 6 && (
                  <span className="bc-here-more">+{checkinsHere.length - 6} more</span>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="bc-comments-section">
            <div className="bc-comments-title">💬 What people are saying</div>
            {comments.length === 0 && (
              <div className="bc-no-comments">No comments yet — be the first!</div>
            )}
            {comments.map(c => (
              <div key={c.id} className="bc-comment">
                <div className="bc-comment-avatar">
                  {(c.username || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="bc-comment-body">
                  <div className="bc-comment-header">
                    <span className="bc-comment-name">{c.username}</span>
                    <span className="bc-comment-time">
                      {c.createdAt?.toDate ? timeAgo(c.createdAt.toDate()) : 'just now'}
                    </span>
                    {c.userId === user?.uid && (
                      <button className="bc-comment-delete" onClick={() => deleteComment(c.id)}>×</button>
                    )}
                  </div>
                  <div className="bc-comment-text">{c.text}</div>
                </div>
              </div>
            ))}
            <form className="bc-comment-form" onSubmit={handleComment}>
              <input
                className="bc-comment-input"
                type="text"
                placeholder="Share the vibe, crowd size, tips..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                maxLength={200}
              />
              <button className="bc-comment-submit" type="submit" disabled={posting || !commentText.trim()}>
                {posting ? '...' : 'Post'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="bc-footer">
        <button
          className={`bc-checkin-btn ${userCheckedInHere ? 'checked-in' : ''}`}
          onClick={() => userCheckedInHere ? onCheckOut(bar.name) : onCheckIn(bar.name)}
        >
          {userCheckedInHere ? '📍 Here now' : '📍 Check in'}
        </button>
        <button className="bc-share-btn" onClick={handleShare}>
          ↗ Share
        </button>
        <button
          className={`bc-rsvp-btn ${isGoing ? 'going' : ''}`}
          onClick={() => onToggleRsvp(bar.name)}
        >
          {isGoing ? 'Interested ✓' : "I'm interested"}
        </button>
      </div>
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
