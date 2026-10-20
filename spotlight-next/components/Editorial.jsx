"use client";
import { useEffect, useState } from "react";
import { ARTICLES } from "../data/articles";

export default function Editorial() {
  const [open, setOpen] = useState(null);
  const [feat, ...rest] = ARTICLES;

  useEffect(() => {
    const k = (e) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open ]);

  return (
    <div>
      <article className="feat" onClick={() => setOpen(feat)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(feat)} aria-label={`Read: ${feat.title}`}>
        <img src={feat.img} alt={feat.title} loading="lazy" />
        <div className="feat-t">
          <span className="tag">Machine of the Week · {feat.tag}</span>
          <h3>{feat.title}</h3>
          <p>{feat.excerpt}</p>
          <span className="meta">{feat.readTime} · {feat.date}</span>
        </div>
      </article>
      <div className="grid-cards">
        {rest.map((a) => (
          <article key={a.id} className="gcard" onClick={() => setOpen(a)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpen(a)} aria-label={`Read: ${a.title}`}>
            <div className="gimg"><img src={a.img} alt={a.title} loading="lazy" /><span className="tag">{a.tag}</span></div>
            <div className="gmeta">
              <h3>{a.title}</h3>
              <p className="excerpt">{a.excerpt}</p>
              <span className="meta">{a.readTime} · {a.date}</span>
            </div>
          </article>
        ))}
      </div>
      {open && (
        <div className="reader-ov" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="reader" onClick={(e) => e.stopPropagation()} role="document">
            <button className="lb-x" onClick={() => setOpen(null)} aria-label="Close article">✕</button>
            <img src={open.img} alt={open.title} />
            <div className="reader-b">
              <span className="tag">{open.tag}</span>
              <h3>{open.title}</h3>
              <span className="meta">{open.readTime} · {open.date}</span>
              {open.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
