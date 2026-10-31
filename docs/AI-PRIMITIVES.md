# AI sebagai Primitif — pedoman merancang panggilan AI di aplikasi

Dipakai bila aplikasi memakai AI/LLM. Sumber:
- Podcast Latent Space "Why I couldn't build Jev at OpenAI" (Diogo Almeida, TypeSafe), diringkas dengan kata-kata sendiri.
- Kode open source `dorkitude/webctl` (MIT), contoh nyata pemakaian decision model Jev.

Bentuk API bisa berubah; cocokkan dengan dokumentasi resmi penyedia sebelum dipakai.

## 1. Tesis

- **Sebagian besar panggilan AI di software produksi dilakukan oleh kode, bukan oleh manusia yang chatting.** Tujuannya biasanya bukan menghasilkan teks, melainkan **membuat keputusan**: benar/salah, pilih kategori, beri skor.
- Model chat (dilatih RLHF untuk percakapan) kurang cocok untuk itu. Kecenderungannya:
  - Jawaban seragam dan terlalu percaya diri.
  - Mahal dan lambat untuk sekadar "ya/tidak".
  - Hasil berbeda tiap dijalankan.
- **Decision model / "System One model"** (mis. Jev dari TypeSafe) dirancang untuk kebutuhan ini:
  - Cepat, sering di bawah 100 ms.
  - Jauh lebih murah per keputusan.
  - Konsisten: input sama dengan urutan diubah, variansnya sangat kecil.
  - Output selalu bertipe valid (*type safe*).
- **Calibration lebih penting dari sekadar benar.** Kalau model bilang 70% yakin, idealnya ia benar sekitar 70% dari waktu. Dengan begitu developer bisa memasang ambang sendiri sesuai risiko aplikasinya.
- **Batasan:** model cepat seperti ini tidak melakukan reasoning panjang; pertanyaan yang butuh banyak langkah logika menurunkan kualitas. Solusinya memecah masalah, bukan memaksakan satu panggilan besar.

## 2. Tiga primitif → kontrol alur di kode

| Primitif | Di kode | Contoh |
|---|---|---|
| **choice** (satu dari N) | `switch` | kategori tiket: tagihan / bug / fitur / lainnya |
| **ya/tidak + probabilitas** | `if p >= ambang` | "ulasan ini menyebut produk rusak?" p = 0.93 |
| **score** (level berurutan) | sort / threshold | urgensi 0–3, relevansi 0–3 |

**Aturan pakai:**
1. **Jangan suruh AI memutuskan langsung** ("email ini penting?"). Pakai **rubrik**: beberapa properti dinilai terpisah, lalu **kode** yang menggabungkan dan memutuskan. Contoh: 5 properti skor 0–3 → `if sum >= 10 and p_urgent > 0.8`.
2. **Yang bisa deterministik dibuat deterministik**: hitungan uang, tanggal, aturan bisnis yang jelas, validasi format. AI hanya untuk isi kondisi yang fuzzy (teks bebas, nada, maksud, kemiripan).
3. **Input berupa state JSON kecil** (objek data, kutipan, daftar item ber-id), bukan template system prompt panjang.
4. **Pecah jadi banyak pertanyaan kecil yang paralel.** Masing-masing menjawab satu hal dan bisa dievaluasi sendiri.
5. **LLM generatif hanya untuk yang butuh teks bebas** (draf balasan, ringkasan, jawaban chat). Pijakkan pada data yang sudah terstruktur dan sertakan buktinya.

## 3. Pola arsitektur

- **Olah saat data masuk (write time), bukan saat ditanya (read time).**
  - Setiap data baru (email, tiket, transkrip, ulasan, dokumen) langsung diklasifikasi, diberi tag, dan diekstrak sekali di depan, lalu hasil terstrukturnya disimpan.
  - Query berikutnya jadi murah dan cepat karena tidak perlu model besar membaca ulang teks mentah.
  - Simpan kutipan sumber + confidence supaya hasilnya bisa dijelaskan.
- **Filter relevansi.** Sebelum memberi konteks ke LLM/agent, setiap kandidat (hasil search, dokumen, chunk) dinilai "relevan dengan tujuan ini?". Hanya yang lolos ambang yang diteruskan. Pada webctl, cara ini menghemat banyak token agent.
- **Chunk filter.** Dokumen panjang dipotong (mis. 2000 karakter, overlap 20%), relevansi tiap chunk dinilai dalam satu batch, dan hanya chunk relevan yang dirakit ulang.
- **Penyatuan entitas / dedupe 2 tahap.**
  1. Cara murah: normalisasi nama/URL/domain email; yang identik langsung digabung.
  2. Kemiripan string/MinHash → beberapa pasangan kandidat.
  3. AI ya/tidak "apakah A dan B entitas/konten yang sama?" per pasangan dalam satu batch.
  4. Ya ≥ ambang → gabung (simpan alias); ragu → review manusia.
- **Batch per id.** Satu request berisi state berupa daftar item ber-id dan satu pertanyaan per id ("nilai hanya item X"). Lebih murah dan cepat daripada satu request per item.
- **Cascade.** Model kecil/cepat dulu; hanya kasus ragu yang naik ke model lebih besar atau manusia.
- **Manusia menyetujui aksi berisiko.** AI mengusulkan beserta bukti dan confidence; manusia approve/ubah/tolak. Keputusan manusia disimpan sebagai data untuk kasus berikutnya.

## 4. Ambang & eskalasi

- Tiga zona per titik keputusan: **otomatis** (yakin) / **review** (ragu) / **buang** (rendah). Contoh awal untuk ya/tidak: ≥ 0.85 / 0.5–0.85 / < 0.5. Kalibrasi ulang dengan eval set.
- Skor level diskalakan ke 0–10 (`score / level_tertinggi × 10`) supaya ambang terbaca sama untuk rubrik berapa pun levelnya. Default webctl: 1,2 level di bawah puncak (untuk 4 level = 6,0).
- Confidence untuk ya/tidak: `|p − 0.5| × 2`.
- **Ambang disimpan di config** (bisa berbeda per tim/kasus), bukan ditulis di prompt.
- Sediakan backfill bila perlu (mis. minimal N hasil walau di bawah ambang, ditandai).

## 5. Eval & kualitas

- **Eval set sendiri lebih berguna daripada benchmark publik.** Mulai dengan 20–50 contoh berlabel dari data nyata atau contoh realistis. Ukur akurasi per primitif.
- **Konsistensi:** jalankan eval yang sama dua kali. Kalau skornya berubah, penilainya sendiri tidak andal. Hindari LLM-as-judge bebas; pakai penilai deterministik (exact match, aturan) atau model terkalibrasi dengan pertanyaan ya/tidak "jawaban ini sesuai referensi?".
- **Robustness:** ubah urutan field/pertanyaan, sinonim, atau tambahkan nonce. Hasilnya harus tetap sama.
- **Reliabilitas dalam "nines":** 90% → 99% → 99,9%. Tentukan target per titik keputusan sesuai risiko.
- **Versi dikunci:** model dan prompt diberi versi dan dicatat di setiap hasil (`extracted_by: model@versi, prompt@v1`). Jalankan ulang eval sebelum mengganti versi.
- **Catat biaya & latensi:** token in/out (dari field `usage`), ms per panggilan, biaya per unit bisnis (per dokumen, per user, per bulan). Angka ini masuk ke struktur biaya di PRD.

## 6. Penyedia

### Jev (TypeSafe), decision model
Bentuk berikut dibaca dari kode klien di webctl. Cocokkan dengan quickstart resmi di typesafe.ai.

```
POST https://api.typesafe.ai/v1/systemone
Authorization: Bearer $JEV_API_KEY
Content-Type: application/json
```

Request:
```json
{
  "model": "jev-latest",
  "state": { "text": "...", "items": [{ "id": "item_0", "title": "..." }] },
  "questions": {
    "urgency": { "type": "score", "instructions": "How urgent is item_0?",
                 "criteria": ["Not urgent: ...", "Low: ...", "High: ...", "Critical: ..."] },
    "is_complaint": { "type": "noul", "instructions": "Is the text a complaint?" }
  }
}
```
- `score`: `criteria` adalah level berurutan **dari terendah (indeks 0) ke tertinggi**, dengan deskripsi konkret per level. Ini juga dipakai untuk pilihan bertingkat. Cek di quickstart apakah ada tipe *choice* tersendiri.
- `noul`: ya/tidak, jawabannya P(ya).

Response:
```json
{
  "answers": {
    "urgency": { "type": "score", "score": 2.31, "confidence": 0.82,
                 "probabilities": {"0": 0.02, "1": 0.09, "2": 0.45, "3": 0.44} },
    "is_complaint": { "type": "noul", "noul": 0.97 }
  },
  "usage": { "input_tokens": 812, "output_tokens": 6 }
}
```
- Error 401/403 = key salah. 429/5xx/jaringan = coba ulang dengan backoff.
- Health-check: state `{"text":"hello world"}` + noul `"Is the text a greeting?"`.

Klien minimal (Python stdlib, tanpa dependency):
```python
import json, os, time, urllib.request, urllib.error

JEV_URL = "https://api.typesafe.ai/v1/systemone"

def jev(state, questions, model="jev-latest", attempts=3):
    body = json.dumps({"model": model, "state": state, "questions": questions}).encode()
    req = urllib.request.Request(JEV_URL, body, {
        "Authorization": f"Bearer {os.environ['JEV_API_KEY']}",
        "Content-Type": "application/json"})
    for i in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)  # {"answers": {...}, "usage": {...}}
        except urllib.error.HTTPError as e:
            if e.code != 429 and e.code < 500 or i == attempts - 1:
                raise
        except urllib.error.URLError:
            if i == attempts - 1:
                raise
        time.sleep(0.5 * 2 ** i)

def score(instructions, criteria):
    return {"type": "score", "instructions": instructions, "criteria": criteria}

def noul(instructions):
    return {"type": "noul", "instructions": instructions}
```
Untuk TypeScript/JS bentuk JSON-nya sama: `fetch` + validasi respons dengan Zod.

Contoh pakai:
```python
a = jev({"text": ticket}, {
    "complaint": noul("Is the customer complaining about a broken product?"),
    "urgency": score("How urgent is this ticket?", ["None", "Low", "High", "Critical"]),
})["answers"]
if a["complaint"]["noul"] >= 0.85 and a["urgency"]["score"] >= 2:  # kode yang memutuskan
    escalate(ticket)
```

### LLM lain (structured output)
- Pakai JSON schema / structured output untuk membatasi enum dan angka.
- **Probabilitas:**
  - `logprobs` token jawaban bila tersedia.
  - Kalau tidak tersedia: mayoritas dari n sampel (mis. 5) sebagai p.
  - Confidence yang ditulis model sendiri paling lemah; beri label "kalibrasi belum diuji".
- Pola di §2–§5 tetap berlaku.

## 7. Contoh penerapan di berbagai jenis aplikasi

| Aplikasi | Keputusan fuzzy → primitif | Kode yang memutuskan |
|---|---|---|
| Helpdesk | ya/tidak "keluhan serius?" + score urgensi | `if` → antrian prioritas / auto-reply |
| Toko online | choice kategori ulasan + ya/tidak "menyebut barang rusak?" | hitung % ulasan rusak per produk → peringatan stok |
| CRM / sales | ya/tidak "kontak utama akan pindah?" + score sentimen | rumus risiko × nilai kontrak = uang berisiko |
| Moderasi | ya/tidak per kebijakan (spam, kasar, data pribadi) | ambang per komunitas |
| Rekrutmen | score kecocokan per kriteria rubrik | ranking + manusia memutuskan |
| Riset / search agent | score relevansi per hasil/chunk | hanya yang ≥ ambang masuk konteks LLM |
