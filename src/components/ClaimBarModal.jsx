import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { submitBarClaim, getUserClaim } from '../services/firestore'
import './ClaimBarModal.css'

export default function ClaimBarModal({ venueName, onClose }) {
  const { user } = useAuth()
  const [step, setStep] = useState('form') // form, success, already
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    ownerName: '',
    role: '',
    contactEmail: user?.email || '',
    verificationNote: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.ownerName || !form.role || !form.contactEmail) return
    setLoading(true)
    try {
      // Check if already claimed by this user
      const existing = await getUserClaim(user.uid, venueName)
      if (existing) {
        setStep('already')
        setLoading(false)
        return
      }
      await submitBarClaim(user.uid, user.email, venueName, form)
      setStep('success')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {step === 'form' && (
          <>
            <div className="modal-header">
              <div className="modal-icon">🏆</div>
              <div className="modal-title">Claim {venueName}</div>
              <div className="modal-sub">Verify you own or manage this bar to get a verified badge and manage your listing.</div>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="modal-label">Your name</label>
              <input className="modal-input" type="text" placeholder="e.g. Marco Rossi"
                value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} required />

              <label className="modal-label">Your role</label>
              <select className="modal-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
                <option value="">Select your role...</option>
                <option>Owner</option>
                <option>Manager</option>
                <option>Marketing / Events</option>
                <option>Staff</option>
              </select>

              <label className="modal-label">Contact email</label>
              <input className="modal-input" type="email" placeholder="your@bar.com"
                value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} required />

              <label className="modal-label">How can we verify you? (optional)</label>
              <textarea className="modal-input" rows={2}
                placeholder="e.g. Our Instagram is @legendsbarnyc, or call us at 212-555-0100"
                value={form.verificationNote} onChange={e => setForm(f => ({ ...f, verificationNote: e.target.value }))} />

              <button className="modal-submit" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit claim request'}
              </button>

              <div className="modal-note">
                We review all claims within 24 hours. Once approved your bar gets a verified owner badge.
              </div>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="modal-success">
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div className="modal-title">Claim submitted!</div>
            <div className="modal-sub" style={{ marginTop: 8 }}>
              We'll review your claim and get back to you within 24 hours. Once approved, {venueName} will show a verified owner badge.
            </div>
            <button className="modal-submit" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}

        {step === 'already' && (
          <div className="modal-success">
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
            <div className="modal-title">Claim pending</div>
            <div className="modal-sub" style={{ marginTop: 8 }}>
              You've already submitted a claim for {venueName}. We're reviewing it and will notify you soon.
            </div>
            <button className="modal-submit" style={{ marginTop: 20 }} onClick={onClose}>Got it</button>
          </div>
        )}
      </div>
    </div>
  )
}
