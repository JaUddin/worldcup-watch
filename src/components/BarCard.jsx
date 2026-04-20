import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  addComment,
  deleteComment,
  subscribeToComments,
  checkIn,
  checkOut,
} from '../services/firestore'
import './BarCard.css'

export default function BarCard({ bar, rsvpCount, checkins, userCheckedIn, onToggleRsvp, isGoing, onCheckIn, onCheckOut }) {
  const { user, profile } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const checkinsHere = checkins[bar.name] || []
  const userCheckedInHere = checkinsHere.some(c => c.userId === user?.uid)

  // Subscribe to real-time comments when card is expanded
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
      await addComment(user.uid, profile?.username || user.email.split('@')[0], bar.name, commentText.trim())
      setCommentText('')
    } catch (err) {
      console.error('Error posting comment:', err)
    }
    setPosting(false)
  }

  const handleCheckin = async () => {
    if (userCheckedInHere) {
      await onCheckOut(bar.name)
    } else {
      await onCheckIn(bar.name)
    }
  }

  const tc = bar.teamColor || { bg: '#f3e5f5', color: '#4a148c' }

  return (
    <div className={`bar-card ${expanded ? 'expanded' : ''}`}>
      {/* ── CARD TOP ── */}
      <div className="bc-top" onClick={() => setExpanded(e => !e)}>
        <div className="bc-info">
          <div className="bc-name">{bar.name}</div>
          <div className="bc-address">{bar.address}</div>
          <div className="bc-verified">
            {bar.isUserEvent ? '👥 Community submitted' : '✓ Verified World Cup venue'}
          </div>
        </div>
        <div className="bc-right">
          <span className="bc-team-badge" style={{ background: tc.bg, color: tc.color }}>
            {bar.team === 'Open' ? 'All fans' : bar.team}
          </span>
          <div className="bc-expand-icon">{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {/* ── LIVE STATS ROW ── */}
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
          <span className="bc-stat-num">{comments.length > 0 ? comments.length : '—'}</span>
          <span className="bc-stat-label">comments</span>
        </div>
      </div>

      {/* ── TAGS ── */}
      <div className="bc-tags">
        {bar.tags.map(t => <span key={t} className="bc-tag">{t}</span>)}
      </div>

      {/* ── EXPANDED CONTENT ── */}
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
                {checkinsHere.slice(0, 5).map((c, i) => (
                  <span key={i} className="bc-here-avatar" title={c.username}>
                    {(c.username || '?').slice(0, 2).toUpperCase()}
                  </span>
                ))}
                {checkinsHere.length > 5 && (
                  <span className="bc-here-more">+{checkinsHere.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="bc-comments-section">
            <div className="bc-comments-title">
              💬 What people are saying
            </div>

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
                      {c.createdAt?.toDate
                        ? timeAgo(c.createdAt.toDate())
                        : 'just now'}
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

      {/* ── ACTION FOOTER ── */}
      <div className="bc-footer">
        <button
          className={`bc-checkin-btn ${userCheckedInHere ? 'checked-in' : ''}`}
          onClick={handleCheckin}
        >
          {userCheckedInHere ? '📍 I\'m here' : '📍 Check in'}
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
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
