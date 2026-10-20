"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ITEMS, renderThumb } from "../lib/models";
import BackgroundVideo from "../components/BackgroundVideo";
import MusicToggle from "../components/MusicToggle";
import SearchModal from "../components/SearchModal";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Gallery, { Lightbox } from "../components/Gallery";
import Garage, { loadGarage } from "../components/Garage";
import Editorial from "../components/Editorial";
import About from "../components/About";
import Access from "../components/Access";
import { ScrollProgress, HomeButton, Reveal, useActiveSection, useReveal } from "../components/chrome";

const Viewer = dynamic(() => import("../components/Viewer"), { ssr: false });
const IDS = ["home", "gallery", "garage", "editorial", "about", "access"];

function Section({ id, kicker, title, children }) {
  return (
    <section id={id} className="sp-sec" aria-labelledby={`${id}-h`}>
      <Reveal className="panel">
        <p className="kicker">{kicker}</p>
        <h2 id={`${id}-h`} className="sec-h">{title[0]} <em>{title[1]}</em></h2>
        <div className="rule" aria-hidden />
        {children}
      </Reveal>
    </section>
  );
}

export default function Page() {
  const [thumbs, setThumbs] = useState({});
  const [view, setView] = useState(null);
  const [lb, setLb] = useState(null);
  const [saved, setSaved] = useState({});
  const active = useActiveSection(IDS);
  useReveal();

  useEffect(() => {
    setSaved(loadGarage());
    let dead = false;
    (async () => {
      for (const it of ITEMS) {
        if (dead) return;
        if (it.img) { setThumbs((t) => ({ ...t, [it.id]: it.img })); continue; }
        await new Promise((r) => setTimeout(r, 30));
        if (dead) return;
        setThumbs((t) => ({ ...t, [it.id]: renderThumb(it) }));
      }
    })();
    return () => { dead = true; };
  }, []);

  const open3D = useCallback((item, rect) => {
    setLb(null);
    setView({ item, rect: rect || { left: innerWidth / 2 - 100, top: innerHeight / 2 - 130, width: 200, height: 260 } });
  }, []);

  const toggleSave = useCallback((it) => {
    setSaved((s) => {
      const n2 = { ...s };
      if (n2[it.id]) delete n2[it.id];
      else n2[it.id] = { name: it.name, year: it.year, cat: it.cat, kind: it.kind };
      try { localStorage.setItem("spotlight-garage-v1", JSON.stringify(n2)); } catch {}
      return n2;
    });
  }, []);

  const stepLb = useCallback((d) => {
    setLb((cur) => {
      const i = ITEMS.findIndex((x) => x.id === (cur?.id || ITEMS[0].id));
      return ITEMS[(i + d + ITEMS.length) % ITEMS.length];
    });
  }, []);

  return (
    <main className="sp">
      <BackgroundVideo />
      <ScrollProgress />
      <Navbar active={active} />
      <MusicToggle />
      <SearchModal />

      <section id="home" className="sp-home" aria-label="Spotlight hero">
        <Hero thumbs={thumbs} />
      </section>

      <Section id="gallery" kicker="01 · Browse the collection" title={["The", "Gallery"]}>
        <Gallery thumbs={thumbs} saved={saved} onToggleSave={toggleSave} onLightbox={setLb} onView3D={(it) => open3D(it)} />
      </Section>

      <Section id="garage" kicker="02 · Your personal collection" title={["My", "Garage"]}>
        <Garage saved={saved} onToggleSave={toggleSave} />
      </Section>

      <Section id="editorial" kicker="03 · Stories from the fast lane" title={["The", "Editorial"]}>
        <Editorial />
      </Section>

      <Section id="about" kicker="04 · Why Spotlight exists" title={["About", "Spotlight"]}>
        <About />
      </Section>

      <Section id="access" kicker="05 · Membership" title={["Get", "Access"]}>
        <Access />
      </Section>

      <HomeButton active={active} />

      {lb && (
        <Lightbox
          item={lb} thumbs={thumbs} onClose={() => setLb(null)}
          onPrev={() => stepLb(-1)} onNext={() => stepLb(1)} onView3D={open3D}
        />
      )}
      {view && <Viewer item={view.item} rect={view.rect} thumb={thumbs[view.item.id]} onClose={() => setView(null)} />}
    </main>
  );
}
