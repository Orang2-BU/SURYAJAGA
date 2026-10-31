# API SuryaJaga di Hugging Face Spaces (Docker). Kode diambil dari repo GitHub publik saat build.
# Untuk memakai commit terbaru: Settings Space -> Factory rebuild (cache git clone ikut dibuang).
FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Spaces menjalankan kontainer sebagai user dengan uid 1000.
RUN useradd -m -u 1000 user
USER user
ENV PATH=/home/user/.local/bin:$PATH
WORKDIR /home/user

ARG REPO=https://github.com/Orang2-BU/SURYAJAGA.git
RUN git clone --depth 1 --branch main $REPO suryajaga

WORKDIR /home/user/suryajaga/api
RUN pip install --no-cache-dir --user -r requirements.txt

EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
