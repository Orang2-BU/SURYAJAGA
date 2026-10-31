"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { KEPUTUSAN_LOKASI, rupiahRingkas, type CalonLokasi } from "@/lib/data";
import { DAFTAR_LAPISAN, GAYA_PETA, LAPISAN, warnaToken, type Lapisan } from "./peta-plts";

type Keadaan = "memuat" | "siap" | "gagal";

function isiPopup(p: CalonLokasi): HTMLElement {
  // DOM, bukan setHTML: nama desa dari OSM tidak boleh ditafsirkan sebagai HTML.
  const wadah = document.createElement("div");
  wadah.className = "peta-popup";
  const judul = document.createElement("strong");
  judul.textContent = p.nama ?? "Permukiman tanpa nama";
  const isi = document.createElement("span");
  isi.textContent = `±${p.kk} KK · ${KEPUTUSAN_LOKASI[p.keputusan].label} · anggaran sekitar ${rupiahRingkas(p.anggaran_rp[1])}`;
  const tautan = document.createElement("a");
  tautan.href = `/perencanaan/${p.id}`;
  tautan.textContent = "Lihat estimasi";
  wadah.append(judul, isi, tautan);
  return wadah;
}

/** P7: titik permukiman, ukuran mengikuti jumlah KK, warna mengikuti keputusan. */
export function PetaLokasi({ daftar }: { daftar: CalonLokasi[] }) {
  const wadah = useRef<HTMLDivElement>(null);
  const petaRef = useRef<import("maplibre-gl").Map | undefined>(undefined);
  const [keadaan, setKeadaan] = useState<Keadaan>("memuat");
  const [lapisan, setLapisan] = useState<Lapisan>("peta");

  function pilih(id: Lapisan) {
    setLapisan(id);
    for (const l of DAFTAR_LAPISAN) petaRef.current?.setLayoutProperty(l, "visibility", l === id ? "visible" : "none");
  }

  useEffect(() => {
    let peta: import("maplibre-gl").Map | undefined;
    let batal = false;
    import("maplibre-gl").then(({ Map, Popup, LngLatBounds, NavigationControl, setWorkerUrl }) => {
      if (batal || !wadah.current) return;
      setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
      const batas = daftar.reduce((b, p) => b.extend([p.lon, p.lat]), new LngLatBounds());
      peta = new Map({ container: wadah.current, style: GAYA_PETA, center: [127.8, -7.8], zoom: 6, cooperativeGestures: true, attributionControl: {} });
      petaRef.current = peta;
      peta.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
      peta.on("error", () => setKeadaan(k => (k === "memuat" ? "gagal" : k)));
      peta.on("load", () => {
        if (!peta) return;
        peta.fitBounds(batas, { padding: { top: 130, bottom: 40, left: 40, right: 60 }, duration: 0 });
        peta.addSource("lokasi", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: daftar.map(p => ({ type: "Feature", properties: { id: p.id, kk: p.kk, keputusan: p.keputusan }, geometry: { type: "Point", coordinates: [p.lon, p.lat] } })),
          },
        });
        peta.addLayer({
          id: "lokasi-titik",
          type: "circle",
          source: "lokasi",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "kk"], 30, 5, 300, 10, 1200, 16],
            "circle-stroke-width": 2,
            "circle-stroke-color": warnaToken("surface"),
            "circle-opacity": 0.9,
            "circle-color": ["match", ["get", "keputusan"],
              "prioritas", warnaToken("status-ok"),
              "layak_dengan_pendampingan", warnaToken("status-warn"),
              warnaToken("status-crit")],
          },
        });
        peta.on("mouseenter", "lokasi-titik", () => { peta!.getCanvas().style.cursor = "pointer"; });
        peta.on("mouseleave", "lokasi-titik", () => { peta!.getCanvas().style.cursor = ""; });
        peta.on("click", "lokasi-titik", e => {
          const p = daftar.find(x => x.id === e.features?.[0]?.properties?.id);
          if (p) new Popup({ offset: 12 }).setLngLat([p.lon, p.lat]).setDOMContent(isiPopup(p)).addTo(peta!);
        });
        setKeadaan("siap");
      });
    }).catch(() => setKeadaan("gagal"));
    return () => { batal = true; peta?.remove(); petaRef.current = undefined; };
  }, [daftar]);

  return <div className="peta-wadah">
    {keadaan === "siap" && <div className="peta-pilih">
      <div className="toggle" role="group" aria-label="Lapisan peta">
        {DAFTAR_LAPISAN.filter(id => id !== "malam").map(id => <button key={id} type="button" className={`toggle-item ${lapisan === id ? "selected" : ""}`} aria-pressed={lapisan === id} onClick={() => pilih(id)}>{LAPISAN[id].label}</button>)}
      </div>
      <p aria-live="polite">{LAPISAN[lapisan].keterangan}</p>
    </div>}
    <div ref={wadah} className="peta-kanvas" role="region" aria-label="Peta calon lokasi PLTS. Daftar calon teratas tersedia di tabel di bawah peta." />
    {keadaan === "memuat" && <div className="peta-lapis" aria-live="polite">Memuat peta...</div>}
    {keadaan === "gagal" && <div className="peta-lapis" role="alert">
      <strong>Peta tidak dapat dimuat</strong>
      <span>Periksa koneksi internet. Tabel calon lokasi di bawah tetap bisa dipakai.</span>
    </div>}
  </div>;
}
