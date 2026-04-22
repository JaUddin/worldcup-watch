import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { createGroup, joinGroup, leaveGroup, subscribeToUserGroups, getGroup } from '../services/firestore'
import './WatchPartyGroups.css'

export default function WatchPartyGroups() {
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState([])
  const [mode, setMode] = useState('list')
  const [groupName, setGroupName] = useState('')
  const [venueName, setVenueName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!user?.uid) return
    const unsub = subscribeToUserGroups(user.uid, setGroups)
    return unsub
  }, [user?.uid])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleCreate = async () => {
    if (!groupName.trim()) return
    setLoading(true)
    try {
      const id = await createGroup(
        user.uid,
        profile?.username || user.email.split('@')[0],
        groupName.trim(),
        venueName.trim() || 'TBD'
      )
      setGroupName('')
      setVenueName('')
      setMode('list')
      showToast('Group created! Tap "Copy invite code" to share with your crew.')
    } catch (err) {
      console.error(err)
      showToast('Error creating group. Please try again.')
    }
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      const group = await getGroup(joinCode.trim())
      if (!group) { showToast('Group not found. Check the code and try again.'); setLoading(false); return }
      if (group.memberIds?.includes(user.uid)) { showToast("You're already in this group!"); setLoading(false); return }
      await joinGroup(joinCode.trim(), user.uid, profile?.username || user.email.split('@')[0])
      showToast(`Joined ${group.name}! 🎉`)
      setJoinCode('')
      setMode('list')
    } catch (err) { showToast('Error joining group.') }
    setLoading(false)
  }

  const handleLeave = async (groupId, name) => {
    await leaveGroup(groupId, user.uid)
    showToast(`Left ${name}`)
  }

  const copyCode = (id) => {
    navigator.clipboard.writeText(id)
    showToast('Invite code copied! Share it with your crew.')
  }

  return (
    <div className="wpg-wrap">
      <div className="wpg-header">
        <div className="wpg-title">👥 Watch Party Groups</div>
        <div className="wpg-sub">Create a crew, share a code, watch together</div>
      </div>

      {toast && <div className="wpg-toast">{toast}</div>}

      {mode === 'list' && (
        <div className="wpg-body">
          {groups.length === 0 && (
            <div className="wpg-empty">No groups yet — create one and invite your crew!</div>
          )}
          {groups.map(g => (
            <div key={g.id} className="wpg-group-card">
              <div className="wpg-group-top">
                <div>
                  <div className="wpg-group-name">{g.name}</div>
                  <div className="wpg-group-venue">📍 {g.venueName}</div>
                </div>
                <div className="wpg-group-count">{g.members?.length || 1} members</div>
              </div>
              <div className="wpg-group-members">
                {(g.members || []).slice(0, 6).map((m, i) => (
                  <span key={i} className="wpg-member-avatar" title={m.username}>
                    {(m.username || '?').slice(0, 2).toUpperCase()}
                  </span>
                ))}
                {(g.members?.length || 0) > 6 && <span className="wpg-more">+{g.members.length - 6}</span>}
              </div>
              <div className="wpg-group-actions">
                <button className="wpg-code-btn" onClick={() => copyCode(g.id)}>📋 Copy invite code</button>
                <button className="wpg-leave-btn" onClick={() => handleLeave(g.id, g.name)}>Leave</button>
              </div>
            </div>
          ))}
          <div className="wpg-action-row">
            <button className="wpg-btn-primary" onClick={() => setMode('create')}>+ Create group</button>
            <button className="wpg-btn-secondary" onClick={() => setMode('join')}>Join with code</button>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="wpg-body">
          <div className="wpg-form-title">Create a watch party group</div>
          <label className="wpg-label">Group name</label>
          <input className="wpg-input" type="text" placeholder="e.g. Juan's Argentina Squad"
            value={groupName} onChange={e => setGroupName(e.target.value)} />
          <label className="wpg-label">Where are you watching? (optional)</label>
          <input className="wpg-input" type="text" placeholder="e.g. Football Factory at Legends"
            value={venueName} onChange={e => setVenueName(e.target.value)} />
          <div className="wpg-form-actions">
            <button
              className="wpg-btn-primary"
              onClick={handleCreate}
              disabled={loading || !groupName.trim()}
            >
              {loading ? 'Creating...' : 'Create group'}
            </button>
            <button className="wpg-btn-ghost" onClick={() => { setMode('list'); setGroupName(''); setVenueName('') }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="wpg-body">
          <div className="wpg-form-title">Join a group</div>
          <div className="wpg-form-sub">Ask your friend for their group code and paste it below</div>
          <label className="wpg-label">Group code</label>
          <input className="wpg-input" type="text" placeholder="Paste the group code here..."
            value={joinCode} onChange={e => setJoinCode(e.target.value)} />
          <div className="wpg-form-actions">
            <button className="wpg-btn-primary" onClick={handleJoin} disabled={loading || !joinCode.trim()}>
              {loading ? 'Joining...' : 'Join group'}
            </button>
            <button className="wpg-btn-ghost" onClick={() => { setMode('list'); setJoinCode('') }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
