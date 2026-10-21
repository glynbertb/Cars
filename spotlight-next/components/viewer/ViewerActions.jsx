"use client";

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2z" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 8l7 4-7 4M21 8l-7 4 7 4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

export default function ViewerActions({ saved, inCompare, onSave, onCompare, onShare, saveLabel }) {
  return (
    <div className="vv-actions">
      <button type="button" className={`vv-btn${saved ? " loved" : ""}`} onClick={onSave} aria-pressed={!!saved}>
        <span className="vv-heart" aria-hidden="true"><HeartIcon filled={!!saved} /></span>
        Save to Garage
        <span className="vv-sr">{saveLabel}</span>
      </button>
      <button type="button" className={`vv-btn${inCompare ? " on" : ""}`} onClick={onCompare} aria-pressed={!!inCompare}>
        <CompareIcon /> Compare
      </button>
      <button type="button" className="vv-btn" onClick={onShare}>
        <LinkIcon /> Share link
      </button>
    </div>
  );
}
