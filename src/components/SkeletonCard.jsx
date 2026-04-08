export default function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: '3px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '18px 20px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 6, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 4, marginLeft: 'auto' }} />
        </div>
      </div>
    </div>
  )
}
