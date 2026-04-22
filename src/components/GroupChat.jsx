import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeToGroupMessages, sendGroupMessage } from '../services/firestore'
import './GroupChat.css'

export default function GroupChat({ group, onBack }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const unsub = subscribeToGroupMessages(group.id, setMessages)
    return unsub
  }, [group.id])

  // Auto scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await sendGroupMessage(
        group.id,
        user.uid,
        profile?.username || user.email.split('@')[0],
        text.trim()
      )
      setText('')
    } catch (err) { console.error(err) }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const username = profile?.username || user.email.split('@')[0]

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.createdAt?.toDate
      ? msg.createdAt.toDate().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : 'Today'
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  return (
    <div className="gc-screen">
      {/* ── HEADER ── */}
      <div className="gc-header">
        <button className="gc-back" onClick={onBack}>←</button>
        <div className="gc-header-info">
          <div className="gc-group-name">{group.name}</div>
          <div className="gc-group-sub">
            📍 {group.venueName} · {group.members?.length || 1} members
          </div>
        </div>
        <div className="gc-member-avatars">
          {(group.members || []).slice(0, 3).map((m, i) => (
            <div key={i} className="gc-mini-avatar" style={{ zIndex: 3 - i }}>
              {(m.username || '?').slice(0, 2).toUpperCase()}
            </div>
          ))}
          {(group.members?.length || 0) > 3 && (
            <div className="gc-mini-more">+{group.members.length - 3}</div>
          )}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="gc-messages">
        {messages.length === 0 && (
          <div className="gc-empty">
            <div className="gc-empty-icon">💬</div>
            <div className="gc-empty-title">Start the conversation</div>
            <div className="gc-empty-sub">
              Message your crew — where are you all watching?
            </div>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="gc-date-divider">
              <span>{date}</span>
            </div>
            {msgs.map((msg, i) => {
              const isMe = msg.userId === user.uid
              const prevMsg = msgs[i - 1]
              const showAvatar = !isMe && (!prevMsg || prevMsg.userId !== msg.userId)
              const showName = !isMe && showAvatar

              return (
                <div
                  key={msg.id}
                  className={`gc-message-row ${isMe ? 'me' : 'them'}`}
                >
                  {!isMe && (
                    <div className={`gc-avatar-slot ${showAvatar ? '' : 'invisible'}`}>
                      {showAvatar && (
                        <div className="gc-avatar">
                          {(msg.username || '?').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="gc-bubble-wrap">
                    {showName && (
                      <div className="gc-sender-name">{msg.username}</div>
                    )}
                    <div className={`gc-bubble ${isMe ? 'gc-bubble-me' : 'gc-bubble-them'}`}>
                      {msg.text}
                    </div>
                    <div className={`gc-time ${isMe ? 'gc-time-me' : ''}`}>
                      {msg.createdAt?.toDate ? formatTime(msg.createdAt.toDate()) : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="gc-input-bar">
        <input
          ref={inputRef}
          className="gc-input"
          type="text"
          placeholder="Message your crew..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          className="gc-send-btn"
          onClick={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
