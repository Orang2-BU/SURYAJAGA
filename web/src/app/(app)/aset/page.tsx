import { TabelAset, type BarisAset } from "@/components/aset/tabel-aset";
import { DAFTAR_PLTS, panelUntuk, prediksiUntuk } from "@/lib/data";

export const metadata = { title: "Daftar PLTS" };

// Bukti per PLTS digabung di server; klien hanya menerima kolom yang ditampilkan.
const BARIS: BarisAset[] = DAFTAR_PLTS.map(p => {
  const prediksi = prediksiUntuk(p.id);
  return {
    ...p,
    peluang: prediksi?.tersedia ? prediksi.p_gagal_26_minggu : null,
    minggu: prediksi?.tersedia ? prediksi.minggu_tersisa : null,
    panel: panelUntuk(p.id)?.status ?? null,
  };
});

export default function DaftarPlts() {
  return <div className="page-enter">
    <div className="page-heading">
      <div>
        <h1>Daftar PLTS</h1>
        <p>Bandingkan semua PLTS dalam satu tabel: status, prediksi baterai, dan kondisi panel.</p>
      </div>
    </div>
    <TabelAset baris={BARIS} />
  </div>;
}
