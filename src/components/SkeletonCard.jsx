import './SkeletonCard.css'

export default function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-top">
        <div className="sk-info">
          <div className="sk-line sk-name" />
          <div className="sk-line sk-address" />
          <div className="sk-line sk-verified" />
        </div>
        <div className="sk-badge" />
      </div>
      <div className="sk-stats">
        <div className="sk-stat" />
        <div className="sk-stat" />
        <div className="sk-stat" />
      </div>
      <div className="sk-reactions">
        {[1,2,3,4,5].map(i => <div key={i} className="sk-reaction" />)}
      </div>
      <div className="sk-tags">
        {[1,2,3].map(i => <div key={i} className="sk-tag" />)}
      </div>
      <div className="sk-footer">
        <div className="sk-btn" />
        <div className="sk-btn" />
        <div className="sk-btn sk-btn-main" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
