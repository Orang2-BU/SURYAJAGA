"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { FLOW_STEPS, HOME_ROUTE, PAGES, matchPage, type FlowStep, type PageRoute } from "@/lib/nav";
import { Badge, Icon } from "@/components/ui";

/**
 * Placeholder halaman yang belum dibangun (acuan: K-DASP components/shell/placeholder.tsx):
 * halaman tetap ada di navigasi, menjelaskan fungsinya, dan punya jalan kembali.
 */
export function Placeholder({ route }: { route: PageRoute }) {
  const page = PAGES[route];
  const back = page.parent ?? (route === HOME_ROUTE ? null : HOME_ROUTE);
  const backLabel = back ? `Kembali ke ${matchPage(back)?.label ?? "Peta Pemantauan"}` : null;
  return <div className="page-enter">
    <div className="page-heading"><div><h1>{page.label}</h1><p>{page.group}</p></div></div>
    {page.step && <FlowSteps current={page.step} />}
    <section className="placeholder-panel">
      <div className="placeholder-card">
        <span className="placeholder-symbol"><Icon icon={page.icon} size={32} /></span>
        <h2>{page.label}</h2>
        <p>{page.description}</p>
        <Badge>Belum dibangun</Badge>
        {back && <Link className="button secondary" href={back}><Icon icon={ArrowLeft} />{backLabel}</Link>}
      </div>
    </section>
  </div>;
}

function FlowSteps({ current }: { current: FlowStep }) {
  const currentIndex = FLOW_STEPS.indexOf(current);
  return <ol className="toggle flow-steps" aria-label="Langkah alur pengawas">
    {FLOW_STEPS.map((step, i) => <li key={step} className={`toggle-item ${i === currentIndex ? "selected" : ""} ${i < currentIndex ? "done" : ""}`} aria-current={i === currentIndex ? "step" : undefined}>
      {i < currentIndex && <Icon icon={Check} size={14} />}{i + 1}. {step}
    </li>)}
  </ol>;
}
