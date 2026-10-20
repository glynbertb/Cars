"use client";
import { useEffect, useState } from "react";

export function useActiveSection(ids) {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!secs.length) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            setActive(e.target.id);
            history.replaceState(null, "", `#${e.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [ids.join("|")]);
  return active;
}

export function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const f = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setW(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return <div className="sp-progress" style={{ width: `${w}%` }} aria-hidden />;
}

export function Reveal({ children, as: Tag = "div", className = "", id, labelledby }) {
  return (
    <Tag id={id} className={`reveal ${className}`} aria-labelledby={labelledby}>
      {children}
    </Tag>
  );
}

export function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll(".reveal")];
    if (!els.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}

export function HomeButton({ active }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => setShow(window.scrollY > window.innerHeight * 0.5);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  if (!show || active === "home") return null;
  return (
    <a href="#home" className="homebtn" aria-label="Back to home">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 10.5 12 3l9 7.5V21H3z M9 21v-6h6v6" />
      </svg>
      Home
    </a>
  );
}
