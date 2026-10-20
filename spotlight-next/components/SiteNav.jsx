"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [["Gallery", "/"], ["Garage", "/"], ["Editorial", "/editorial"], ["About", "/about"]];

export default function SiteNav() {
  const path = usePathname();
  return (
    <header className="gx-nav">
      <Link href="/" className="gx-logo"><i />Spotlight<b /></Link>
      <nav>
        {LINKS.map(([l, h]) => <Link key={h} href={h} className={path === h ? "on" : ""}>{l}</Link>)}
      </nav>
      <Link href="/access" className="gx-cta">Get access →</Link>
    </header>
  );
}