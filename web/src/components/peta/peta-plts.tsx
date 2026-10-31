"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { STATUS, type Plts } from "@/lib/data";

type Keadaan = "memuat" | "siap" | "gagal";

// Setiap lapisan menjawab pertanyaan berbeda; keterangannya tampil di peta agar tidak dibaca sebagai bukti padam.
// Atribusi wajib tampil (kebijakan masing-masing penyedia). Lisensi untuk produksi: 03-ARCHITECTURE Q10.
export const LAPISAN = {
  peta: {
    label: "Peta",
    keterangan: "Peta jalan OpenStreetMap.",
    sumber: { tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], maxzoom: 19, attribution: "© Kontributor OpenStreetMap" },
  },
  foto: {
    label: "Foto detail",
    keterangan: "Citra gabungan beberapa tahun, untuk melihat lokasi. Bukan kondisi terkini.",
    // Gratis untuk aplikasi non-komersial dengan atribusi (syarat Esri); produksi butuh lisensi ArcGIS.
    sumber: { tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"], maxzoom: 18, attribution: "Citra © Esri, Maxar, Earthstar Geographics" },
  },
  sentinel: {
    label: "Sentinel-2 2024",
    keterangan: "Komposit bebas awan 2024, resolusi 10 m. Untuk melihat apakah area panel masih ada.",
    // CC BY-NC-SA 4.0 untuk non-komersial; penggunaan komersial butuh lisensi EOX.
    sumber: { tiles: ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg"], maxzoom: 15, attribution: "EOxCloudless 2024 oleh EOX IT Services GmbH (berisi data Copernicus Sentinel 2024 yang diolah)" },
  },
  malam: {
    label: "Cahaya malam",
    keterangan: "Gabungan tahunan 2016 (resolusi sekitar 500 m), hanya gambaran. Bukti padam per desa ada di Analisis Cahaya Malam.",
    // NASA GIBS, data terbuka; tingkat ubin tertinggi 8, diperbesar di atasnya.
    sumber: { tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png"], maxzoom: 8, attribution: "NASA Black Marble 2016 lewat NASA GIBS" },
  },
} as const;

export type Lapisan = keyof typeof LAPISAN;
export const DAFTAR_LAPISAN = Object.keys(LAPISAN) as Lapisan[];

export const GAYA_PETA = {
  version: 8 as const,
  projection: { type: "globe" as const },
  sources: Object.fromEntries(DAFTAR_LAPISAN.map(id => [id, { type: "raster" as const, tileSize: 256, ...LAPISAN[id].sumber, tiles: [...LAPISAN[id].sumber.tiles] }])),
  layers: DAFTAR_LAPISAN.map(id => ({ id, type: "raster" as const, source: id, layout: { visibility: id === "peta" ? "visible" as const : "none" as const } })),
};

/** Warna status dibaca dari token CSS agar peta tidak memakai hex sendiri. */
export function warnaToken(nama: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${nama}`).trim();
}

function isiPopup(p: Plts): HTMLElement {
  // Dibangun dengan DOM, bukan setHTML, supaya teks data tidak pernah ditafsirkan sebagai HTML.
  const wadah = document.createElement("div");
  wadah.className = "peta-popup";
  const judul = document.createElement("strong");
  judul.textContent = p.nama;
  const lokasi = document.createElement("span");
  lokasi.textContent = `${p.desa}, ${p.kabupaten} · ${STATUS[p.status].label}`;
  const tautan = document.createElement("a");
  tautan.href = `/pemantauan/${p.id}`;
  tautan.textContent = "Buka detail";
  wadah.append(judul, lokasi, tautan);
  return wadah;
}

function geojson(daftar: Plts[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: daftar.map(p => ({ type: "Feature", properties: { id: p.id, status: p.status }, geometry: { type: "Point", coordinates: [p.lon, p.lat] } })),
  };
}

export function PetaPlts({ daftar }: { daftar: Plts[] }) {
  const wadah = useRef<HTMLDivElement>(null);
  const petaRef = useRef<import("maplibre-gl").Map | undefined>(undefined);
  const [keadaan, setKeadaan] = useState<Keadaan>("memuat");
  const [lapisan, setLapisan] = useState<Lapisan>("peta");

  function pilih(id: Lapisan) {
    setLapisan(id);
    for (const l of DAFTAR_LAPISAN) petaRef.current?.setLayoutProperty(l, "visibility", l === id ? "visible" : "none");
  }

  // Daftar terbaru untuk popup; titik diperbarui lewat setData, bukan membuat ulang peta (status bisa berubah karena peringatan).
  const daftarRef = useRef(daftar);
  useEffect(() => {
    daftarRef.current = daftar;
    if (keadaan !== "siap") return;
    const sumber = petaRef.current?.getSource("plts");
    if (sumber && "setData" in sumber) (sumber as import("maplibre-gl").GeoJSONSource).setData(geojson(daftar));
  }, [daftar, keadaan]);

  useEffect(() => {
    let peta: import("maplibre-gl").Map | undefined;
    let batal = false;
    import("maplibre-gl").then(({ Map, Popup, LngLatBounds, NavigationControl, setWorkerUrl }) => {
      if (batal || !wadah.current) return;
      // MapLibre 6 memuat worker dari berkas terpisah; alamat bawaannya tidak cocok dengan chunk bundler.
      setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
      const batas = daftarRef.current.reduce((b, p) => b.extend([p.lon, p.lat]), new LngLatBounds());
      peta = new Map({
        container: wadah.current,
        style: GAYA_PETA,
        center: [118, -2],
        zoom: 1.6,
        cooperativeGestures: true,
        attributionControl: {},
      });
      petaRef.current = peta;
      peta.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
      peta.on("error", () => setKeadaan(k => (k === "memuat" ? "gagal" : k)));
      peta.on("load", () => {
        if (!peta) return;
        // Dipasang setelah load karena ukuran wadah baru pasti saat itu. Dari globe mendekat ke Indonesia.
        const gerakHalus = !matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Padding atas lebih besar agar titik tidak tertutup pilihan lapisan.
        peta.fitBounds(batas, { padding: { top: 130, bottom: 40, left: 40, right: 60 }, maxZoom: 9, duration: gerakHalus ? 2400 : 0 });
        peta.addSource("plts", { type: "geojson", data: geojson(daftarRef.current) });
        peta.addLayer({
          id: "plts-titik",
          type: "circle",
          source: "plts",
          paint: {
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": warnaToken("surface"),
            "circle-color": ["match", ["get", "status"],
              "kritis", warnaToken("status-crit"),
              "waspada", warnaToken("status-warn"),
              "normal", warnaToken("status-ok"),
              warnaToken("on-surface-muted")],
          },
        });
        peta.on("mouseenter", "plts-titik", () => { peta!.getCanvas().style.cursor = "pointer"; });
        peta.on("mouseleave", "plts-titik", () => { peta!.getCanvas().style.cursor = ""; });
        peta.on("click", "plts-titik", e => {
          const id = e.features?.[0]?.properties?.id;
          const p = daftarRef.current.find(x => x.id === id);
          if (!p) return;
          new Popup({ offset: 12, closeButton: true }).setLngLat([p.lon, p.lat]).setDOMContent(isiPopup(p)).addTo(peta!);
        });
        setKeadaan("siap");
      });
    }).catch(() => setKeadaan("gagal"));
    return () => { batal = true; peta?.remove(); petaRef.current = undefined; };
  }, []);

  return <div className="peta-wadah">
    {keadaan === "siap" && <div className="peta-pilih">
      <div className="toggle" role="group" aria-label="Lapisan peta">
        {DAFTAR_LAPISAN.map(id => <button key={id} type="button" className={`toggle-item ${lapisan === id ? "selected" : ""}`} aria-pressed={lapisan === id} onClick={() => pilih(id)}>{LAPISAN[id].label}</button>)}
      </div>
      <p aria-live="polite">{LAPISAN[lapisan].keterangan}</p>
    </div>}
    <div ref={wadah} className="peta-kanvas" role="region" aria-label="Peta lokasi PLTS. Daftar yang sama tersedia di tabel di bawah peta." />
    {keadaan === "memuat" && <div className="peta-lapis" aria-live="polite">Memuat peta...</div>}
    {keadaan === "gagal" && <div className="peta-lapis" role="alert">
      <strong>Peta tidak dapat dimuat</strong>
      <span>Periksa koneksi internet. Daftar PLTS di bawah tetap bisa dipakai.</span>
    </div>}
  </div>;
}
