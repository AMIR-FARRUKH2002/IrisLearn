function TopBar({ currentUser, onLogout }) {
  return (
    <header className="top-bar">
      <span className="top-bar-title">IrisLearn</span>
      {currentUser && (
        <div className="top-bar-actions">
          <span className="current-user">
            Signed in as <strong>{currentUser}</strong>
          </span>
          <button type="button" className="btn-secondary" onClick={onLogout}>
            Log Out
          </button>
        </div>
      )}
    </header>
  )
}

export default TopBar
