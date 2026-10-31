"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Bell, CalendarDays, ChevronDown, ChevronsLeft, ChevronsRight, CircleHelp, Menu, X } from "lucide-react";
import { HOME_ROUTE, NAVIGATION, PAGES, isActive, matchPage } from "@/lib/nav";
import { Badge, Icon, Modal } from "@/components/ui";
import { BrandLockup, BrandWordmark } from "./brand";

// Port shell template Soft Op Dashboard (acuan: K-DASP/MilkGraph components/shell/app-shell.tsx).

// Akun dan snapshot demo purwarupa (pilih peran tanpa sandi, 01-PRD F1).
const DEMO_USER = { name: "Pengawas demo", role: "Satgas Kopdes Merah Putih", initials: "PD" };
const PERIOD = { label: "Snapshot", range: "30 Okt 2026" };
// Ringkasan sementara sampai data hasil analisis tersedia (T2-T7).
const NOTIFICATIONS = [
  { title: "Data PLTS belum dimuat", subtitle: "Menunggu data contoh dan hasil analisis", href: "/pemantauan" },
  { title: "Uji satelit belum dijalankan", subtitle: "Butuh token NASA Earthdata dari tim", href: "/bukti/cahaya-malam" },
];

type Panel = "period" | "notifications" | "profile" | "help";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!drawer) return;
    const node = drawerRef.current;
    const trigger = menuButton.current;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 768px)");
    const close = () => { if (media.matches) setDrawer(false); };
    media.addEventListener("change", close);
    return () => { node?.close(); document.body.style.overflow = overflow; media.removeEventListener("change", close); trigger?.focus(); };
  }, [drawer]);

  const closeDrawer = () => setDrawer(false);
  const openPanel = (next: Panel) => { setDrawer(false); setPanel(next); };

  function renderNavigation(mobile = false) {
    return <>
      <div className="brand-row">
        <Link href={HOME_ROUTE} className="brand" aria-label="SuryaJaga, ke Peta Pemantauan" onClick={closeDrawer}>
          <BrandLockup />
        </Link>
        {mobile && <button className="icon-button" aria-label="Tutup menu" onClick={closeDrawer}><Icon icon={X} /></button>}
      </div>
      <Suspense fallback={<NavLinks pathname="" onNavigate={closeDrawer} />}>
        <CurrentNavLinks onNavigate={closeDrawer} />
      </Suspense>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => openPanel("help")} aria-label="Panduan demo">
          <span className="nav-icon"><Icon icon={CircleHelp} size={19} /></span><span className="nav-label">Panduan demo</span>
        </button>
        <button className="account" onClick={() => openPanel("profile")} aria-label={`Lihat akun ${DEMO_USER.name}`}>
          <span className="avatar">{DEMO_USER.initials}</span>
          <span className="account-copy nav-label"><strong>{DEMO_USER.name}</strong><span>{DEMO_USER.role}</span></span>
          <Icon icon={ChevronDown} size={15} className="nav-label" />
        </button>
      </div>
    </>;
  }

  return <div className={`app-frame ${collapsed === null ? "auto-sidebar" : collapsed ? "collapsed" : "expanded"}`}>
    <a className="skip-link" href="#main-content">Lewati ke konten</a>
    <aside className="sidebar" id="desktop-navigation">{renderNavigation()}</aside>
    <div className="workspace">
      <header className="topbar">
        <div className="topbar-start">
          <button className="icon-button desktop-toggle" aria-label="Buka atau ciutkan sidebar" aria-expanded={collapsed === null ? undefined : !collapsed} aria-controls="desktop-navigation" onClick={() => setCollapsed(collapsed === null ? window.innerWidth >= 1200 : !collapsed)}>
            <Icon icon={collapsed === false ? ChevronsLeft : ChevronsRight} />
          </button>
          <button ref={menuButton} className="icon-button mobile-menu" aria-label="Buka menu" aria-expanded={drawer} aria-controls="mobile-navigation" onClick={() => setDrawer(true)}><Icon icon={Menu} /></button>
          <Link href={HOME_ROUTE} className="mobile-brand" aria-label="SuryaJaga, ke Peta Pemantauan">
            <BrandWordmark />
          </Link>
          <Suspense fallback={<span className="breadcrumb">SuryaJaga</span>}>
            <Breadcrumb />
          </Suspense>
        </div>
        <div className="topbar-actions">
          <Badge>Data simulasi</Badge>
          <button className="shift-button" onClick={() => setPanel("period")}>
            <Icon icon={CalendarDays} size={16} /><span>{PERIOD.label}<span className="period-date">, {PERIOD.range}</span></span><Icon icon={ChevronDown} size={14} />
          </button>
          <button className="icon-button notification" aria-label={`Lihat ${NOTIFICATIONS.length} notifikasi`} onClick={() => setPanel("notifications")}><Icon icon={Bell} /><span>{NOTIFICATIONS.length}</span></button>
          <button className="avatar top-avatar" aria-label="Lihat profil" onClick={() => setPanel("profile")}>{DEMO_USER.initials}</button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer className="workspace-footer">
        <span>SuryaJaga <span className="footer-divider">/</span> Sistem peringatan dini PLTS desa</span>
        <span>Data simulasi · snapshot {PERIOD.range} <span className="status-dot" /></span>
      </footer>
    </div>
    {drawer && <dialog ref={drawerRef} id="mobile-navigation" aria-label="Menu navigasi" className="mobile-drawer" onCancel={closeDrawer} onClick={e => { if (e.target === e.currentTarget) closeDrawer(); }}><div className="drawer-content">{renderNavigation(true)}</div></dialog>}
    {panel && <Modal title={{ period: "Snapshot data", notifications: "Notifikasi", profile: "Profil pengguna", help: "Panduan demo" }[panel]} onClose={() => setPanel(null)}>
      {panel === "period" && <>
        <p className="muted">Purwarupa memakai satu snapshot data simulasi dan hasil analisis.</p>
        <button className="period-choice" onClick={() => setPanel(null)}><strong>{PERIOD.label}</strong><span>{PERIOD.range}</span><Badge tone="ok">Dipilih</Badge></button>
      </>}
      {panel === "notifications" && <div className="notification-list">
        {NOTIFICATIONS.map(n => <Link key={n.title} href={n.href} onClick={() => setPanel(null)}><span><strong>{n.title}</strong><span>{n.subtitle}</span></span><Icon icon={ArrowUpRight} /></Link>)}
      </div>}
      {panel === "profile" && <div className="profile-info">
        <span className="avatar large">{DEMO_USER.initials}</span>
        <h3>{DEMO_USER.name}</h3>
        <p>{DEMO_USER.role}</p>
        <Badge>Pengguna demo</Badge>
        <p className="muted">Status dan prediksi membantu memprioritaskan; keputusan mengirim peringatan tetap di pengawas.</p>
        <div className="profile-links">
          <Link className="button secondary" href="/pengaturan" onClick={() => setPanel(null)}>Pengaturan ambang</Link>
          <Link className="button secondary" href="/" onClick={() => setPanel(null)}>Ganti peran</Link>
        </div>
      </div>}
      {panel === "help" && <>
        <p>Alur demo dari peta sampai PLTS kembali normal.</p>
        <ol className="guide-list">
          <li><strong>Pantau</strong><p>Peta Pemantauan menandai PLTS normal, waspada, dan kritis.</p></li>
          <li><strong>Telusuri</strong><p>Buka PLTS kritis untuk melihat grafik cahaya malam dan prediksi umur baterai.</p></li>
          <li><strong>Peringatkan</strong><p>Kirim peringatan ke operator koperasi. Isi pesan terlihat sebelum dikirim.</p></li>
          <li><strong>Pandu operator</strong><p>Ganti peran ke Operator, tulis keluhan, dan ikuti langkah dari asisten.</p></li>
          <li><strong>Pulihkan</strong><p>Operator menandai selesai, status di peta pengawas ikut berubah.</p></li>
        </ol>
        <Badge>Data simulasi dan contoh berlabel</Badge>
        <p className="small muted"><Link className="text-link" href="/bukti/metodologi" onClick={() => setPanel(null)}>Lihat metodologi dan sumber</Link></p>
      </>}
    </Modal>}
  </div>;
}

// usePathname butuh Suspense di rute ber-param dinamis (Next 16 cacheComponents).
function CurrentNavLinks({ onNavigate }: { onNavigate: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return <nav aria-label="Navigasi utama">
    {NAVIGATION.map(({ group, routes }) => <div className="nav-group" key={group}>
      <p className="group-title nav-label">{group}</p>
      {routes.map(href => {
        const item = PAGES[href];
        const active = isActive(pathname, href);
        return <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`} title={item.core ? item.label : `${item.label} · Belum dibangun`} aria-label={item.label} aria-current={active ? "page" : undefined} onClick={onNavigate}>
          <span className="nav-icon"><Icon icon={item.icon} size={19} /></span>
          <span className="nav-label">{item.label}</span>
          {!item.core && <span className="placeholder-dot nav-label" />}
        </Link>;
      })}
    </div>)}
  </nav>;
}

function Breadcrumb() {
  const page = matchPage(usePathname());
  return <span className="breadcrumb">SuryaJaga<span>/</span><strong>{page?.label ?? "Halaman"}</strong></span>;
}
