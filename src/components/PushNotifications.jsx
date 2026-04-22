import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { savePushSubscription } from '../services/firestore'
import './PushNotifications.css'

const VAPID_PUBLIC_KEY = 'BBK9fMidN-mgK6FXz37RZ2MVTc1dohCw2G_6ip_65k5sqMMFtbE3VexXiFJK2RUhGFjZJ8B6CYgxtGu6VBrABks'


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushNotifications() {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported'); return
    }
    if (Notification.permission === 'granted') setStatus('granted')
    else if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  const requestPermission = async () => {
    setStatus('requesting')
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setStatus('granted')
        await subscribeUser()
      } else { setStatus('denied') }
    } catch (err) { setStatus('denied') }
  }

  const subscribeUser = async () => {
    setSaving(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      await savePushSubscription(user.uid, sub.toJSON())
    } catch (err) { console.error('Push subscribe error:', err) }
    setSaving(false)
  }

  if (status === 'unsupported') return null

  if (status === 'granted') {
    return (
      <div className="pn-granted">
        <span>🔔</span>
        <div>
          <div className="pn-granted-title">Notifications enabled</div>
          <div className="pn-granted-sub">We'll remind you before matches you RSVPd to</div>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="pn-denied">
        <span>🔕</span>
        <div>
          <div className="pn-denied-title">Notifications blocked</div>
          <div className="pn-denied-sub">Enable in your browser settings to get match reminders</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pn-prompt">
      <div className="pn-prompt-left">
        <div className="pn-prompt-icon">🔔</div>
        <div>
          <div className="pn-prompt-title">Get match reminders</div>
          <div className="pn-prompt-sub">We'll notify you 1 hour before matches you RSVPd to</div>
        </div>
      </div>
      <button className="pn-prompt-btn" onClick={requestPermission}
        disabled={status === 'requesting' || saving}>
        {status === 'requesting' || saving ? '...' : 'Enable'}
      </button>
    </div>
  )
}
